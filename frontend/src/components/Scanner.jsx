import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import Webcam from 'react-webcam';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import jsPDF from 'jspdf';
import axiosInstance from '@/api/axios-instance';
import useToastError from '@/hooks/useToastError';
import { Button } from '@/components/ui/button';
import { compressFile, formatFileSize, validateFile } from '@/utils/compression';
import { FiCamera, FiUpload, FiX, FiTrash2, FiCheck, FiPaperclip, FiZap, FiZapOff, FiTarget, FiRotateCw, FiSettings } from 'react-icons/fi';

// Web Worker code for image processing
const createImageProcessorWorker = () => {
    const workerCode = `
        self.onmessage = function(e) {
            const { imageData, quality, maxWidth, index } = e.data;
            
            try {
                // Create canvas in worker
                const canvas = new OffscreenCanvas(maxWidth, Math.round(maxWidth * (297/210)));
                const ctx = canvas.getContext('2d');
                
                // Process image
                const img = new Image();
                img.onload = function() {
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    // Convert to blob
                    canvas.convertToBlob({ type: 'image/jpeg', quality: quality })
                        .then(blob => {
                            const reader = new FileReader();
                            reader.onload = () => {
                                self.postMessage({
                                    index,
                                    result: reader.result,
                                    size: blob.size,
                                    success: true
                                });
                            };
                            reader.onerror = () => {
                                self.postMessage({
                                    index,
                                    error: 'Failed to read processed image',
                                    success: false
                                });
                            };
                            reader.readAsDataURL(blob);
                        })
                        .catch(error => {
                            self.postMessage({
                                index,
                                error: error.message,
                                success: false
                            });
                        });
                };
                img.onerror = function() {
                    self.postMessage({
                        index,
                        error: 'Failed to load image',
                        success: false
                    });
                };
                img.src = imageData;
            } catch (error) {
                self.postMessage({
                    index,
                    error: error.message,
                    success: false
                });
            }
        };
    `;

    return new Worker(URL.createObjectURL(new Blob([workerCode], { type: 'application/javascript' })));
};

const UniversalDocumentScanner = () => {
    const [image, setImage] = useState(null);
    const [capturedImages, setCapturedImages] = useState([]);
    const [pdfFile, setPdfFile] = useState(null);
    const [mrn, setMrn] = useState('');
    const [fileName, setFileName] = useState('');
    const [showWebcam, setShowWebcam] = useState(false);
    const [pdfName, setPdfName] = useState('');
    const [pdfSize, setPdfSize] = useState(0);
    const [showCropper, setShowCropper] = useState(false);
    const [currentCapturedImage, setCurrentCapturedImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [facingMode, setFacingMode] = useState('environment');
    const [deviceId, setDeviceId] = useState('');
    const [availableDevices, setAvailableDevices] = useState([]);
    const [webcamReady, setWebcamReady] = useState(false);
    const [webcamError, setWebcamError] = useState(null);
    const [cameraSettings, setCameraSettings] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    // Performance optimization states
    const [processingProgress, setProcessingProgress] = useState(0);
    const [processingStep, setProcessingStep] = useState('');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const webcamRef = useRef(null);
    const cropperRef = useRef(null);
    const capturedCropperRef = useRef(null);
    const { showError, showSuccess } = useToastError();

    const MAX_IMAGES = 50;
    const A4_RATIO = 210 / 297;
    const MAX_PDF_SIZE_MB = 15;

    // Memoized worker creation
    const imageWorker = useMemo(() => {
        if (typeof window !== 'undefined' && 'Worker' in window && 'OffscreenCanvas' in window) {
            try {
                return createImageProcessorWorker();
            } catch (error) {
                console.warn('Web Worker creation failed:', error);
                return null;
            }
        }
        return null;
    }, []);

    // Cleanup worker on unmount
    useEffect(() => {
        return () => {
            if (imageWorker) {
                imageWorker.terminate();
            }
        };
    }, [imageWorker]);

    // Detect if mobile device
    useEffect(() => {
        const checkMobile = () => {
            const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                window.innerWidth <= 768 ||
                ('ontouchstart' in window);
            setIsMobile(mobile);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Get available cameras
    useEffect(() => {
        const getDevices = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                setAvailableDevices(videoDevices);

                // Set default device (prefer back camera on mobile)
                if (videoDevices.length > 0) {
                    const backCamera = videoDevices.find(device =>
                        device.label.toLowerCase().includes('back') ||
                        device.label.toLowerCase().includes('rear') ||
                        device.label.toLowerCase().includes('environment')
                    );
                    setDeviceId(backCamera ? backCamera.deviceId : videoDevices[0].deviceId);
                }

                console.log('Available cameras:', videoDevices.map(d => ({ id: d.deviceId, label: d.label })));
            } catch (error) {
                console.error('Error getting devices:', error);
            }
        };

        getDevices();
    }, []);

    // Optimized video constraints for both mobile and desktop
    const getVideoConstraints = useCallback(() => {
        const baseConstraints = {
            width: { min: 640, ideal: 1920, max: 4096 },
            height: { min: 480, ideal: 1080, max: 3072 },
            frameRate: { ideal: 30, max: 60 },
            focusMode: { ideal: 'continuous' },
            exposureMode: { ideal: 'continuous' },
            whiteBalanceMode: { ideal: 'continuous' }
        };

        // Use deviceId if available, otherwise use facingMode
        if (deviceId) {
            return {
                ...baseConstraints,
                deviceId: { exact: deviceId }
            };
        } else {
            return {
                ...baseConstraints,
                facingMode: { ideal: facingMode }
            };
        }
    }, [deviceId, facingMode]);

    // Handle webcam user media success
    const handleUserMedia = useCallback((stream) => {
        setWebcamReady(true);
        setWebcamError(null);

        // Get camera capabilities and settings
        const track = stream.getVideoTracks()[0];
        if (track) {
            const capabilities = track.getCapabilities();
            const settings = track.getSettings();

            setCameraSettings({ capabilities, settings });
            console.log('Camera capabilities:', capabilities);
            console.log('Camera settings:', settings);

            showSuccess(`Camera ready: ${settings.width}x${settings.height}${capabilities.torch ? ' with flash' : ''}`);
        }
    }, [showSuccess]);

    // Handle webcam errors
    const handleUserMediaError = useCallback((error) => {
        setWebcamReady(false);
        setWebcamError(error.message);
        console.error('Webcam error:', error);
        showError(error, 'Camera Error');
    }, [showError]);

    // Switch camera (mobile) or change device (desktop)
    const switchCamera = useCallback(() => {
        if (availableDevices.length <= 1) {
            showError(new Error('No other cameras available'), 'Camera Switch');
            return;
        }

        if (isMobile) {
            // Toggle between front and back on mobile
            setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
        } else {
            // Cycle through available devices on desktop
            const currentIndex = availableDevices.findIndex(device => device.deviceId === deviceId);
            const nextIndex = (currentIndex + 1) % availableDevices.length;
            setDeviceId(availableDevices[nextIndex].deviceId);
        }

        setWebcamReady(false);
        showSuccess('Switching camera...');
    }, [availableDevices, deviceId, facingMode, isMobile, showError, showSuccess]);

    // Toggle flash (if supported)
    const toggleFlash = useCallback(async () => {
        if (!webcamRef.current || !cameraSettings?.capabilities?.torch) {
            showError(new Error('Flash not supported on this device'), 'Flash Error');
            return;
        }

        try {
            const stream = webcamRef.current.video?.srcObject;
            if (stream) {
                const track = stream.getVideoTracks()[0];
                const currentSettings = track.getSettings();

                await track.applyConstraints({
                    advanced: [{ torch: !currentSettings.torch }]
                });

                showSuccess(currentSettings.torch ? 'Flash turned off' : 'Flash turned on');
            }
        } catch (error) {
            showError(error, 'Flash Error');
        }
    }, [cameraSettings, showError, showSuccess]);

    // Focus camera (if supported)
    const focusCamera = useCallback(async () => {
        if (!webcamRef.current || !cameraSettings?.capabilities?.focusMode) return;

        try {
            const stream = webcamRef.current.video?.srcObject;
            if (stream) {
                const track = stream.getVideoTracks()[0];

                // Trigger single-shot focus
                await track.applyConstraints({
                    advanced: [{ focusMode: 'single-shot' }]
                });

                showSuccess('Focusing...');

                // Return to continuous focus after 1 second
                setTimeout(async () => {
                    try {
                        await track.applyConstraints({
                            advanced: [{ focusMode: 'continuous' }]
                        });
                    } catch (error) {
                        console.log('Could not return to continuous focus');
                    }
                }, 1000);
            }
        } catch (error) {
            console.log('Manual focus not supported');
        }
    }, [cameraSettings, showSuccess]);

    // Memoized calculations for performance optimization
    const calculateOptimalQuality = useCallback((imageCount) => {
        if (imageCount > 30) return 0.60;
        if (imageCount > 20) return 0.70;
        if (imageCount > 12) return 0.75;
        if (imageCount > 6) return 0.82;
        return 0.88;
    }, []);

    const calculateOptimalWidth = useCallback((imageCount) => {
        if (imageCount > 30) return 900;
        if (imageCount > 20) return 1100;
        if (imageCount > 12) return 1300;
        if (imageCount > 6) return 1500;
        return 1700;
    }, []);

    // Estimate PDF size
    const estimatePdfSize = useCallback((imageCount) => {
        const baseOverheadMB = 0.5;
        const quality = calculateOptimalQuality(imageCount);
        const width = calculateOptimalWidth(imageCount);
        const height = width * (297 / 210);

        // Rough JPEG size estimation
        const avgImageSizeMB = (width * height * 3 * quality * 0.8) / (1024 * 1024);
        return baseOverheadMB + (imageCount * avgImageSizeMB);
    }, [calculateOptimalQuality, calculateOptimalWidth]);

    // Optimized single image processing
    const processImageOptimized = async (imgSrc, index, totalImages) => {
        return new Promise((resolve) => {
            const quality = calculateOptimalQuality(totalImages);
            const maxWidth = calculateOptimalWidth(totalImages);

            // Use web worker if available, otherwise fallback
            if (imageWorker) {
                const handleWorkerMessage = (e) => {
                    if (e.data.index === index) {
                        imageWorker.removeEventListener('message', handleWorkerMessage);
                        if (e.data.success) {
                            resolve({
                                imgSrc: e.data.result,
                                actualSize: e.data.size,
                                index
                            });
                        } else {
                            console.warn(`Worker failed for image ${index}, falling back to main thread:`, e.data.error);
                            // Fallback to main thread
                            processImageMainThread(imgSrc, index, quality, maxWidth).then(resolve);
                        }
                    }
                };

                imageWorker.addEventListener('message', handleWorkerMessage);

                imageWorker.postMessage({
                    imageData: imgSrc,
                    quality,
                    maxWidth,
                    index
                });
            } else {
                // Fallback to main thread with requestIdleCallback
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(() => {
                        processImageMainThread(imgSrc, index, quality, maxWidth).then(resolve);
                    });
                } else {
                    setTimeout(() => {
                        processImageMainThread(imgSrc, index, quality, maxWidth).then(resolve);
                    }, 0);
                }
            }
        });
    };

    // Main thread processing with optimizations
    const processImageMainThread = async (imgSrc, index, quality, maxWidth) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                // Use createImageBitmap for better performance if available
                if ('createImageBitmap' in window) {
                    createImageBitmap(img).then((bitmap) => {
                        processWithImageBitmap(bitmap, index, quality, maxWidth, resolve);
                    }).catch(() => {
                        processWithCanvas(img, index, quality, maxWidth, resolve);
                    });
                } else {
                    processWithCanvas(img, index, quality, maxWidth, resolve);
                }
            };
            img.onerror = () => {
                resolve({
                    imgSrc: imgSrc, // fallback to original
                    actualSize: 0,
                    index,
                    error: 'Failed to process image'
                });
            };
            img.src = imgSrc;
        });
    };

    const processWithImageBitmap = (bitmap, index, quality, maxWidth, resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = maxWidth;
        canvas.height = Math.round(maxWidth * (297 / 210));

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve({
                        imgSrc: reader.result,
                        actualSize: blob.size,
                        index
                    });
                };
                reader.readAsDataURL(blob);
            } else {
                resolve({
                    imgSrc: canvas.toDataURL('image/jpeg', quality),
                    actualSize: 0,
                    index
                });
            }

            // Clean up
            bitmap.close();
            canvas.width = 0;
            canvas.height = 0;
        }, 'image/jpeg', quality);
    };

    const processWithCanvas = (img, index, quality, maxWidth, resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = maxWidth;
        canvas.height = Math.round(maxWidth * (297 / 210));

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve({
                        imgSrc: reader.result,
                        actualSize: blob.size,
                        index
                    });
                    // Clean up canvas
                    canvas.width = 0;
                    canvas.height = 0;
                };
                reader.readAsDataURL(blob);
            } else {
                resolve({
                    imgSrc: canvas.toDataURL('image/jpeg', quality),
                    actualSize: 0,
                    index
                });
                canvas.width = 0;
                canvas.height = 0;
            }
        }, 'image/jpeg', quality);
    };

    // Optimized image processing with batching
    const processImagesInBatches = async (images, batchSize = 3) => {
        const results = [];
        const totalBatches = Math.ceil(images.length / batchSize);

        for (let i = 0; i < totalBatches; i++) {
            const batch = images.slice(i * batchSize, (i + 1) * batchSize);
            const batchPromises = batch.map((imgSrc, batchIndex) =>
                processImageOptimized(imgSrc, i * batchSize + batchIndex, images.length)
            );

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // Update progress
            const progress = ((i + 1) / totalBatches) * 50; // 50% for image processing
            setProcessingProgress(progress);
            setProcessingStep(`Processing images: batch ${i + 1}/${totalBatches}`);

            // Small delay to prevent UI blocking
            if (i < totalBatches - 1) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }

        return results;
    };

    // Performance-optimized capture
    const handleCapture = useCallback(async () => {
        console.log("new code")
        if (capturedImages.length >= MAX_IMAGES) {
            showError(new Error(`Cannot capture more than ${MAX_IMAGES} images`), 'Limit Reached');
            return;
        }

        if (!webcamRef.current || !webcamReady) {
            showError(new Error('Camera not ready'), 'Capture Error');
            return;
        }

        setIsProcessing(true);
        try {
            // Use optimal settings based on current image count
            const quality = Math.max(0.85, 1 - (capturedImages.length * 0.02));
            const maxDimension = Math.max(1400, 2000 - (capturedImages.length * 30));

            const screenshot = webcamRef.current.getScreenshot({
                width: Math.min(maxDimension, cameraSettings?.settings?.width || 1920),
                height: Math.min(maxDimension * (297 / 210), cameraSettings?.settings?.height || 1080),
                quality: quality
            });

            if (!screenshot) {
                throw new Error('Failed to capture image');
            }

            // Process asynchronously
            const response = await fetch(screenshot);
            const blob = await response.blob();
            const reader = new FileReader();

            reader.onload = () => {
                setCurrentCapturedImage(reader.result);
                setShowWebcam(false);
                setShowCropper(true);
                setIsProcessing(false);
                showSuccess(`Image captured! Size: ${(blob.size / (1024 * 1024)).toFixed(2)}MB`);
            };
            reader.readAsDataURL(blob);

        } catch (error) {
            setIsProcessing(false);
            showError(error, 'Capture Failed');
        }
    }, [capturedImages.length, webcamReady, cameraSettings, showError, showSuccess]);

    // Enhanced crop handler for captured images
    const handleCropCapturedImage = useCallback(async () => {
        const cropper = capturedCropperRef.current?.cropper;
        if (!cropper) return;

        setIsProcessing(true);
        try {
            const canvas = cropper.getCroppedCanvas({
                width: 1600,
                height: Math.round(1600 * (297 / 210)),
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });

            const blob = await new Promise((resolve) =>
                canvas.toBlob(resolve, 'image/jpeg', 0.90)
            );
            const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });

            const reader = new FileReader();
            reader.onload = () => {
                setCapturedImages((prev) => [...prev, reader.result]);
                setShowCropper(false);
                setCurrentCapturedImage(null);
                setIsProcessing(false);
                showSuccess('Image cropped and saved!');
            };
            reader.readAsDataURL(file);
        } catch (error) {
            setIsProcessing(false);
            showError(error, 'Crop Failed');
        }
    }, [showSuccess, showError]);

    // File upload handler
    // const handleFileChange = async (e) => {
    //     const file = e.target.files[0];
    //     if (!file) return;

    //     setIsProcessing(true);
    //     try {
    //         const validation = validateFile(file, {
    //             maxSize: 100 * 1024 * 1024, // 100MB
    //             allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
    //         });

    //         if (!validation.isValid) {
    //             throw new Error(validation.errors.join(', '));
    //         }

    //         const sizeMB = file.size / (1024 * 1024);
    //         let processedFile = file;

    //         // Smart compression
    //         if (sizeMB > 25) {
    //             processedFile = await compressFile(file, {
    //                 maxSizeMB: 20,
    //                 maxWidthOrHeight: 2560,
    //                 quality: 0.92,
    //             });
    //         }

    //         const type = processedFile.type;
    //         if (type.startsWith('image/')) {
    //             const reader = new FileReader();
    //             reader.onload = () => {
    //                 setImage(reader.result);
    //                 setPdfFile(null);
    //                 setPdfName('');
    //                 setPdfSize(0);
    //                 setIsProcessing(false);
    //                 showSuccess(`Image loaded! Size: ${formatFileSize(processedFile.size)}`);
    //             };
    //             reader.readAsDataURL(processedFile);
    //         } else if (type === 'application/pdf') {
    //             setPdfFile(processedFile);
    //             setImage(null);
    //             setPdfName(processedFile.name);
    //             setPdfSize((processedFile.size / (1024 * 1024)).toFixed(2));
    //             setIsProcessing(false);
    //             showSuccess(`PDF loaded! Size: ${formatFileSize(processedFile.size)}`);
    //         }
    //     } catch (error) {
    //         setIsProcessing(false);
    //         showError(error, 'File Processing Failed');
    //     }
    // };

    // Streaming PDF generation with size control
    const generateAndUploadPdf = async () => {
        if (!mrn.trim()) {
            showError(new Error('Please enter the patient MRN'), 'Validation Error');
            return;
        }
        if (capturedImages.length === 0) {
            showError(new Error('Please capture at least one image'), 'Validation Error');
            return;
        }

        setIsProcessing(true);
        setIsGeneratingPdf(true);
        setProcessingProgress(0);
        setProcessingStep('Initializing...');

        try {
            // Step 1: Check estimated size and warn user
            const estimatedSize = estimatePdfSize(capturedImages.length);
            if (estimatedSize > MAX_PDF_SIZE_MB * 0.9) { // Warn at 90% of limit
                console.warn(`Estimated PDF size: ${estimatedSize.toFixed(1)}MB - may need aggressive compression`);
            }

            // Step 2: Process images in batches
            setProcessingStep('Optimizing images for PDF...');
            const processedImages = await processImagesInBatches(capturedImages);

            setProcessingProgress(60);
            setProcessingStep('Creating PDF document...');

            // Step 3: Create PDF with compression
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true,
            });

            // Step 4: Add images with progress tracking
            for (let i = 0; i < processedImages.length; i++) {
                if (i > 0) doc.addPage();

                const img = processedImages[i];
                const margin = 10;
                const maxWidth = 190;
                const maxHeight = 277;

                // Calculate positioning
                const imgRatio = img.width / img.height || A4_RATIO;
                const pageRatio = maxWidth / maxHeight;

                let finalWidth, finalHeight, x, y;

                if (imgRatio > pageRatio) {
                    finalWidth = maxWidth;
                    finalHeight = finalWidth / imgRatio;
                    x = margin;
                    y = (297 - finalHeight) / 2;
                } else {
                    finalHeight = maxHeight;
                    finalWidth = finalHeight * imgRatio;
                    x = (210 - finalWidth) / 2;
                    y = margin;
                }

                doc.addImage(
                    img.imgSrc,
                    'JPEG',
                    x,
                    y,
                    finalWidth,
                    finalHeight,
                    `img_${i}`,
                    'FAST'
                );

                // Update progress
                const progress = 60 + ((i + 1) / processedImages.length) * 25;
                setProcessingProgress(progress);
                setProcessingStep(`Adding image ${i + 1}/${processedImages.length} to PDF...`);

                // Yield control to prevent blocking
                if (i % 3 === 0 && i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 5));
                }
            }

            setProcessingProgress(90);
            setProcessingStep('Finalizing PDF...');

            // Step 5: Generate PDF and check size
            let pdfArrayBuffer = doc.output('arraybuffer');
            let pdfSizeMB = pdfArrayBuffer.byteLength / (1024 * 1024);

            console.log(`Initial PDF size: ${pdfSizeMB.toFixed(2)}MB`);

            // Step 6: If too large, apply emergency compression
            if (pdfSizeMB > MAX_PDF_SIZE_MB) {
                setProcessingStep('PDF too large - applying emergency compression...');
                setProcessingProgress(70);

                // Super aggressive compression
                const emergencyImages = await Promise.all(
                    capturedImages.map(async (imgSrc, index) => {
                        return new Promise((resolve) => {
                            const img = new Image();
                            img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');

                                // Very small dimensions
                                const maxWidth = 800;
                                const maxHeight = Math.round(maxWidth * (297 / 210));

                                canvas.width = maxWidth;
                                canvas.height = maxHeight;

                                ctx.imageSmoothingEnabled = true;
                                ctx.imageSmoothingQuality = 'medium';
                                ctx.drawImage(img, 0, 0, maxWidth, maxHeight);

                                canvas.toBlob((blob) => {
                                    if (blob) {
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            resolve(reader.result);
                                            canvas.width = 0;
                                            canvas.height = 0;
                                        };
                                        reader.readAsDataURL(blob);
                                    } else {
                                        resolve(canvas.toDataURL('image/jpeg', 0.5));
                                        canvas.width = 0;
                                        canvas.height = 0;
                                    }
                                }, 'image/jpeg', 0.5); // Very low quality
                            };
                            img.src = imgSrc;
                        });
                    })
                );

                // Recreate PDF with emergency images
                const emergencyDoc = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4',
                    compress: true,
                });

                emergencyImages.forEach((imgSrc, index) => {
                    if (index > 0) emergencyDoc.addPage();

                    const margin = 15;
                    const width = 180;
                    const height = 252;

                    emergencyDoc.addImage(
                        imgSrc,
                        'JPEG',
                        margin,
                        margin,
                        width,
                        height,
                        `emergency_img_${index}`,
                        'FAST'
                    );
                });

                pdfArrayBuffer = emergencyDoc.output('arraybuffer');
                pdfSizeMB = pdfArrayBuffer.byteLength / (1024 * 1024);

                console.log(`Emergency compressed PDF size: ${pdfSizeMB.toFixed(2)}MB`);
                const pdfFile = new File(
                    [pdfArrayBuffer],
                    `scanned-document-${Date.now()}.pdf`,
                    { type: 'application/pdf' }
                );

                const formData = new FormData();
                formData.append('file', pdfFile);
                formData.append('patientMRN', mrn);
                formData.append('fileName', fileName);

                await axiosInstance.post('/clerk/uploadDoc', formData);
                setIsProcessing(false);
                showSuccess('PDF uploaded Successfully!');
                setCapturedImages([]);
            } else {
                const pdfFile = new File(
                    [pdfArrayBuffer],
                    `scanned-document-${Date.now()}.pdf`,
                    { type: 'application/pdf' }
                );

                const formData = new FormData();
                formData.append('file', pdfFile);
                formData.append('patientMRN', mrn);
                formData.append('fileName', fileName);

                await axiosInstance.post('/clerk/uploadDoc', formData);
                setIsProcessing(false);
                showSuccess('PDF uploaded successfully!');
                setCapturedImages([]);
            }
        } catch (err) {
            setIsProcessing(false);
            showError(err, 'PDF upload failed')
        }
    };
    // Add these functions to the component (inside the UniversalDocumentScanner component)

    // const uploadCroppedImage = useCallback(async () => {
    //     const cropper = cropperRef.current?.cropper;
    //     if (!cropper) return;

    //     setIsProcessing(true);
    //     try {
    //         const canvas = cropper.getCroppedCanvas({
    //             width: 1600,
    //             height: Math.round(1600 * (297 / 210)),
    //             imageSmoothingEnabled: true,
    //             imageSmoothingQuality: 'high',
    //         });

    //         const blob = await new Promise((resolve) =>
    //             canvas.toBlob(resolve, 'image/jpeg', 0.90)
    //         );
    //         const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });

    //         const formData = new FormData();
    //         formData.append('file', file);
    //         formData.append('patientMRN', mrn);
    //         formData.append('fileName', fileName);

    //         await axiosInstance.post('/clerk/uploadDoc', formData);
    //         setIsProcessing(false);
    //         showSuccess('Image uploaded successfully!');
    //         setImage(null);
    //     } catch (error) {
    //         setIsProcessing(false);
    //         showError(error, 'Image Upload Failed');
    //     }
    // }, [mrn, fileName, showSuccess, showError]);

    // const uploadPdf = useCallback(async () => {
    //     if (!mrn.trim()) {
    //         showError(new Error('Please enter the patient MRN'), 'Validation Error');
    //         return;
    //     }

    //     setIsProcessing(true);
    //     try {
    //         const formData = new FormData();
    //         formData.append('file', pdfFile);
    //         formData.append('patientMRN', mrn);
    //         formData.append('fileName', fileName);

    //         await axiosInstance.post('/clerk/uploadDoc', formData);
    //         setIsProcessing(false);
    //         showSuccess('PDF uploaded successfully!');
    //         setPdfFile(null);
    //         setPdfName('');
    //         setPdfSize(0);
    //     } catch (error) {
    //         setIsProcessing(false);
    //         showError(error, 'PDF Upload Failed');
    //     }
    // }, [mrn, fileName, pdfFile, showSuccess, showError]);
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6" >
            <div className="bg-white rounded-lg shadow-md p-6" >
                <div className="flex items-center justify-between mb-6" >
                    <h1 className="text-2xl font-bold text-gray-800" > Document Scanner </h1>
                    {
                        isMobile && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full" >
                                Mobile Optimized
                            </span>
                        )}
                </div>

                {/* Camera Status */}
                {
                    cameraSettings && (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200" >
                            <div className="flex items-center justify-between text-sm text-green-800" >
                                <span>📷 Camera: {cameraSettings.settings.width}x{cameraSettings.settings.height} </span>
                                < div className="flex items-center gap-2" >
                                    {cameraSettings.capabilities.torch && <span>🔦</span>
                                    }
                                    {availableDevices.length > 1 && <span>📱 {availableDevices.length} cameras </span>}
                                </div>
                            </div>
                        </div>
                    )}

                {/* Webcam Error */}
                {
                    webcamError && (
                        <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200" >
                            <p className="text-red-800 text-sm" > Camera Error: {webcamError} </p>
                            < button
                                onClick={() => {
                                    setWebcamError(null);
                                    setWebcamReady(false);
                                }
                                }
                                className="mt-2 text-sm text-red-600 underline"
                            >
                                Retry Camera
                            </button>
                        </div>
                    )}

                {/* MRN Input */}
                <div className="mb-6" >
                    <label className="block text-sm font-medium text-gray-700 mb-2" > Patient MRN </label>
                    < input
                        type="text"
                        value={mrn}
                        onChange={(e) => setMrn(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="e.g., MRN123456"
                        disabled={isProcessing}
                    />
                </div>

                {/* File name Input */}
                <div className="mb-6" >
                    <label className="block text-sm font-medium text-gray-700 mb-2" > File Name </label>
                    < input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Document name"
                        disabled={isProcessing}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6" >
                    {/* <label className="flex-1 cursor-pointer" >
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={isProcessing}
                        />
                        <div className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border-2 border-dashed border-blue-400 rounded-lg hover:bg-blue-50 transition" >
                            <FiUpload className="text-blue-600" />
                            <span className="text-sm font-medium text-gray-700" > Upload File </span>
                        </div>
                    </label> */}

                    < button
                        onClick={() => setShowWebcam(!showWebcam)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition ${showWebcam
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                            } disabled:bg-gray-400`}
                        disabled={isProcessing}
                    >
                        {showWebcam ? <FiX /> : <FiCamera />}
                        <span>{showWebcam ? 'Close Camera' : 'Open Camera'} </span>
                    </button>
                </div>

                {/* Processing indicator */}
                {
                    isProcessing && (
                        <div className="flex items-center justify-center p-4 mb-6 bg-blue-50 rounded-lg" >
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3" > </div>
                            < span className="text-sm text-blue-700" > Processing high - quality image...</span>
                        </div>
                    )
                }

                {/* Enhanced Webcam View */}
                {
                    showWebcam && (
                        <div className="mb-6" >
                            <div className="relative bg-gray-900 rounded-lg overflow-hidden" >
                                <Webcam
                                    ref={webcamRef}
                                    audio={false}
                                    screenshotFormat="image/jpeg"
                                    screenshotQuality={1.0}
                                    videoConstraints={getVideoConstraints()}
                                    onUserMedia={handleUserMedia}
                                    onUserMediaError={handleUserMediaError}
                                    className="w-full h-auto"
                                    style={{
                                        maxHeight: '70vh',
                                        transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
                                    }
                                    }
                                    forceScreenshotSourceSize={true}
                                    imageSmoothing={true}
                                />

                                {/* Camera overlay with A4 guide */}
                                < div className="absolute inset-0 pointer-events-none" >
                                    <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-lg" >
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] h-[90%] border-2 border-yellow-400/80 shadow-lg" > </div>
                                    </div>
                                    < div className="absolute bottom-4 left-0 right-0 text-center" >
                                        <p className="text-white text-sm bg-black/60 px-4 py-2 rounded-full inline-block" >
                                            📄 Align document within the yellow frame for best results
                                        </p>
                                    </div>
                                </div>

                                {/* Camera controls */}
                                < div className="absolute top-4 right-4 flex flex-col gap-2" >
                                    {/* Flash toggle */}
                                    {
                                        cameraSettings?.capabilities?.torch && (
                                            <button
                                                onClick={toggleFlash}
                                                className="p-2 rounded-full bg-white/80 text-gray-700 shadow-lg hover:bg-white transition"
                                                disabled={isProcessing}
                                            >
                                                <FiZap size={18} />
                                            </button>
                                        )
                                    }

                                    {/* Focus button */}
                                    {
                                        cameraSettings?.capabilities?.focusMode && (
                                            <button
                                                onClick={focusCamera}
                                                className="p-2 rounded-full bg-white/80 text-gray-700 shadow-lg hover:bg-white transition"
                                                disabled={isProcessing}
                                            >
                                                <FiTarget size={18} />
                                            </button>
                                        )
                                    }

                                    {/* Camera switch */}
                                    {
                                        availableDevices.length > 1 && (
                                            <button
                                                onClick={switchCamera}
                                                className="p-2 rounded-full bg-white/80 text-gray-700 shadow-lg hover:bg-white transition"
                                                disabled={isProcessing}
                                            >
                                                <FiRotateCw size={18} />
                                            </button>
                                        )
                                    }
                                </div>

                                {/* Camera ready indicator */}
                                {
                                    !webcamReady && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center" >
                                            <div className="text-white text-center" >
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" > </div>
                                                < p > Initializing camera...</p>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>

                            {/* Capture button */}
                            <div className="flex gap-3 mt-4" >
                                <button
                                    onClick={handleCapture}
                                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                                    disabled={isProcessing || !webcamReady}
                                >
                                    <FiCamera />
                                    {isProcessing ? 'Capturing...' : 'Capture High-Quality Image'}
                                </button>
                                < button
                                    onClick={() => {
                                        setShowWebcam(false);
                                        setWebcamReady(false);
                                        setCameraSettings(null);
                                    }}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                                    disabled={isProcessing}
                                >
                                    <FiX />
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                {/* Image Cropper for captured images */}
                {
                    showCropper && currentCapturedImage && (
                        <div className="mb-6" >
                            <h3 className="text-lg font-semibold text-gray-800 mb-3" >✂️ Crop Your Document </h3>
                            < div className="h-96 w-full bg-gray-100 rounded-lg overflow-hidden" >
                                <Cropper
                                    src={currentCapturedImage}
                                    ref={capturedCropperRef}
                                    style={{ height: '100%', width: '100%' }
                                    }
                                    aspectRatio={A4_RATIO}
                                    viewMode={1}
                                    dragMode="move"
                                    autoCropArea={0.8}
                                    background={false}
                                    cropBoxResizable={true}
                                    cropBoxMovable={true}
                                    responsive={true}
                                    checkOrientation={true}
                                    guides={true}
                                    scalable={true}
                                    zoomable={true}
                                    wheelZoomRatio={0.1}
                                    touchDragZoom={isMobile}
                                />
                            </div>
                            < div className="flex flex-wrap gap-3 mt-4" >
                                <Button
                                    onClick={handleCropCapturedImage}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                                    disabled={isProcessing}
                                >
                                    <FiCheck />
                                    {isProcessing ? 'Processing...' : 'Save Cropped Image'}
                                </Button>
                                < Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowCropper(false);
                                        setCurrentCapturedImage(null);
                                    }}
                                    disabled={isProcessing}
                                >
                                    <FiX />
                                    Cancel
                                </Button>
                                < Button
                                    variant="outline"
                                    onClick={() => {
                                        setCapturedImages((prev) => [...prev, currentCapturedImage]);
                                        setShowCropper(false);
                                        setCurrentCapturedImage(null);
                                        showSuccess('Image saved without cropping');
                                    }}
                                    disabled={isProcessing}
                                >
                                    <FiPaperclip />
                                    Skip Cropping
                                </Button>
                            </div>
                        </div>
                    )}

                {/* Captured Images Gallery */}
                {
                    capturedImages.length > 0 && (
                        <div className="mb-6" >
                            <div className="flex justify-between items-center mb-3" >
                                <h2 className="text-lg font-semibold text-gray-800" >
                                    📸 Captured Images({capturedImages.length})
                                </h2>
                                < button
                                    onClick={() => setCapturedImages([])
                                    }
                                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                                    disabled={isProcessing}
                                >
                                    <FiTrash2 size={14} />
                                    Clear All
                                </button>
                            </div>
                            < div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" >
                                {
                                    capturedImages.map((img, index) => (
                                        <div key={index} className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-200" >
                                            <img
                                                src={img}
                                                alt={`Captured ${index + 1}`}
                                                className="w-full h-32 object-cover"
                                            />
                                            <button
                                                onClick={
                                                    () => {
                                                        const updated = [...capturedImages];
                                                        updated.splice(index, 1);
                                                        setCapturedImages(updated);
                                                    }
                                                }
                                                className={`absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full transition ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                                disabled={isProcessing}
                                            >
                                                <FiX size={14} />
                                            </button>
                                            < div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2" >
                                                <p className="text-xs text-white truncate" > Image {index + 1} </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                            < button
                                onClick={generateAndUploadPdf}
                                className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                                disabled={isProcessing}
                            >
                                <FiUpload />
                                {
                                    isProcessing
                                        ? 'Creating High-Quality PDF...'
                                        : `Upload as A4 PDF (${capturedImages.length} images)`
                                }
                            </button>
                        </div>
                    )}

                {/* Uploaded Image Cropper */}
                {
                    image && (
                        <div className="mb-6" >
                            <h3 className="text-lg font-semibold text-gray-800 mb-3" >✂️ Crop Uploaded Image </h3>
                            < div className="h-96 w-full bg-gray-100 rounded-lg overflow-hidden" >
                                <Cropper
                                    src={image}
                                    ref={cropperRef}
                                    style={{ height: '100%', width: '100%' }
                                    }
                                    aspectRatio={A4_RATIO}
                                    viewMode={1}
                                    dragMode="move"
                                    autoCropArea={0.8}
                                    background={false}
                                    cropBoxResizable={true}
                                    cropBoxMovable={true}
                                    responsive={true}
                                    checkOrientation={true}
                                    guides={true}
                                    scalable={true}
                                    zoomable={true}
                                    wheelZoomRatio={0.1}
                                    touchDragZoom={isMobile}
                                />
                            </div>
                            < button
                                onClick={uploadCroppedImage}
                                className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                                disabled={isProcessing}
                            >
                                <FiUpload />
                                {isProcessing ? 'Uploading...' : 'Upload Cropped Image'}
                            </button>
                        </div>
                    )}

                {/* PDF Upload */}
                {
                    pdfFile && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200" >
                            <div className="flex items-start gap-3" >
                                <div className="bg-blue-100 p-2 rounded-full" >
                                    <FiPaperclip className="text-blue-600" />
                                </div>
                                < div className="flex-1" >
                                    <p className="font-medium text-gray-800" > {pdfName} </p>
                                    < p className="text-sm text-gray-600" > {pdfSize} MB </p>
                                </div>
                            </div>
                            < button
                                onClick={uploadPdf}
                                className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                                disabled={isProcessing}
                            >
                                <FiUpload />
                                {isProcessing ? 'Uploading...' : 'Upload PDF'}
                            </button>
                        </div>
                    )
                }

                {/* Quality Tips and Device Info */}
                <div className="mt-8 space-y-4" >
                    {/* Quality Tips */}
                    < div className="p-4 bg-green-50 rounded-lg border border-green-200" >
                        <h3 className="text-lg font-semibold text-green-800 mb-3" >💡 Tips for Best Quality </h3>
                        < div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700" >
                            <ul className="space-y-1" >
                                <li>• Use good lighting - natural light works best </li>
                                <li>• Keep the device steady when capturing </li>
                                <li>• Fill the frame with your document </li>
                                <li>• Ensure the document is flat and unwrinkled </li>
                            </ul>
                            < ul className="space-y-1" >
                                <li>• Use flash in low - light conditions </li>
                                <li>• Clean your camera lens before use </li>
                                <li>• Tap focus button if image appears blurry </li>
                                <li>• Switch cameras for better quality if available </li>
                            </ul>
                        </div>
                    </div>

                    {/* Device Information */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200" >
                        <h4 className="font-semibold text-blue-800 mb-2" >📱 Device Information </h4>
                        < div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700" >
                            <div>
                                <p><strong>Device Type: </strong> {isMobile ? 'Mobile' : 'Desktop'}</p >
                                <p><strong>Available Cameras: </strong> {availableDevices.length}</p >
                                {cameraSettings && (
                                    <>
                                        <p><strong>Resolution: </strong> {cameraSettings.settings.width}x{cameraSettings.settings.height}</p >
                                        <p><strong>Frame Rate: </strong> {cameraSettings.settings.frameRate || 'Auto'} fps</p >
                                    </>
                                )}
                            </div>
                            <div>
                                {
                                    cameraSettings && (
                                        <>
                                            <p><strong>Focus Mode: </strong> {cameraSettings.settings.focusMode || 'Auto'}</p >
                                            <p><strong>Flash Available: </strong> {cameraSettings.capabilities.torch ? 'Yes' : 'No'}</p >
                                            <p><strong>Zoom Available: </strong> {cameraSettings.capabilities.zoom ? 'Yes' : 'No'}</p >
                                            <p><strong>Facing Mode: </strong> {cameraSettings.settings.facingMode || 'Environment'}</p >
                                        </>
                                    )
                                }
                            </div>
                        </div>
                    </div>

                    {/* Camera Selection (if multiple cameras) */}
                    {
                        availableDevices.length > 1 && (
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200" >
                                <h4 className="font-semibold text-gray-800 mb-2" >📷 Camera Selection </h4>
                                < div className="space-y-2" >
                                    {
                                        availableDevices.map((device, index) => (
                                            <button
                                                key={device.deviceId}
                                                onClick={() => {
                                                    setDeviceId(device.deviceId);
                                                    setWebcamReady(false);
                                                }
                                                }
                                                className={`w-full text-left p-2 rounded text-sm transition ${deviceId === device.deviceId
                                                    ? 'bg-blue-100 border border-blue-300 text-blue-800'
                                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                📹 {device.label || `Camera ${index + 1}`}
                                                {deviceId === device.deviceId && <span className="ml-2" >✓</span>}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        )}

                    {/* Troubleshooting */}
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200" >
                        <h4 className="font-semibold text-yellow-800 mb-2" >🔧 Troubleshooting </h4>
                        < div className="text-sm text-yellow-700 space-y-1" >
                            <p><strong>Camera not working ? </strong> Check browser permissions and refresh the page.</p >
                            <p><strong>Poor image quality ? </strong> Ensure good lighting and clean camera lens.</p >
                            <p><strong>App running slow ? </strong> Close other tabs/apps to free up memory.</p>
                            < p > <strong>Upload failing ? </strong> Check internet connection and file size.</p >
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default UniversalDocumentScanner;