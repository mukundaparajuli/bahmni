import { useRef, useState, useCallback, useEffect } from 'react';
import jsPDF from 'jspdf';
import axiosInstance from '@/api/axios-instance';
import useToastError from '@/hooks/useToastError';
import { compressFile, formatFileSize, validateFile } from '@/utils/compression';

export const useRescan = (documentData) => {
    const [image, setImage] = useState(null);
    const [capturedImages, setCapturedImages] = useState([]);
    const [file, setFile] = useState(null);
    const [pdfName, setPdfName] = useState('');
    const [pdfSize, setPdfSize] = useState(0);
    const [showWebcam, setShowWebcam] = useState(false);
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

    const webcamRef = useRef(null);
    const cropperRef = useRef(null);
    const capturedCropperRef = useRef(null);
    const { showError, showSuccess } = useToastError();

    const MAX_IMAGES = 50;
    // Extract document data
    const { id, fileName, status } = documentData || {};

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

    // Optimized video constraints for document scanning
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

    // Optimized capture function with A4 preparation
    const handleCapture = useCallback(async () => {
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
            const screenshot = webcamRef.current.getScreenshot({
                width: cameraSettings?.settings?.width || 1920,
                height: cameraSettings?.settings?.height || 1080,
                quality: 1.0 // Maximum quality
            });


            if (!screenshot) {
                throw new Error('Failed to capture image');
            }

            const blob = await (await fetch(screenshot)).blob();
            const file = new File([blob], `captured-${Date.now()}.jpg`, { type: 'image/jpeg' });

            const sizeMB = file.size / (1024 * 1024);
            let processedFile = file;
            if (sizeMB > 20) {
                processedFile = await compressFile(file, {
                    maxSizeMB: 15,
                    maxWidthOrHeight: 2560,
                    quality: 0.95,
                });
            }

            const reader = new FileReader();
            reader.onload = () => {
                setCurrentCapturedImage(reader.result);
                setShowWebcam(false);
                setShowCropper(true);
                setIsProcessing(false);
                showSuccess(`Image captured! Size: ${formatFileSize(processedFile.size)}`);
            };
            reader.readAsDataURL(processedFile);
        } catch (error) {
            setIsProcessing(false);
            showError(error, 'Image Processing Error');
        }
    }, [capturedImages.length, webcamReady, showError, showSuccess]);

    // Optimized crop handler with A4 constraints
    const handleCropCapturedImage = useCallback(async () => {
        const cropper = capturedCropperRef.current?.cropper;
        if (!cropper) return;

        setIsProcessing(true);
        try {
            const canvas = cropper.getCroppedCanvas({
                width: 2048,
                height: Math.round(2048 * (297 / 210)),
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });


            const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
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
            showError(error, 'Crop Processing Error');
        }
    }, [showSuccess, showError]);

    // Optimized file handler
    const handleFileChange = async (e) => {
        const originalFile = e.target.files[0];
        if (!originalFile) return;

        setIsProcessing(true);
        try {
            const validation = validateFile(originalFile, {
                maxSize: 100 * 1024 * 1024,
                allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'],
            });
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            const sizeMB = originalFile.size / (1024 * 1024);
            let processedFile = originalFile;
            if (sizeMB > 25) {
                processedFile = await compressFile(originalFile, {
                    maxSizeMB: 20,
                    maxWidthOrHeight: 2560,
                    quality: 0.92,
                });
            }

            const type = processedFile.type;
            if (type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                    setImage(reader.result);
                    setFile(null);
                    setPdfName('');
                    setPdfSize(0);
                    setIsProcessing(false);
                    showSuccess(`Image processed! Size: ${formatFileSize(processedFile.size)}`);
                };
                reader.readAsDataURL(processedFile);
            } else if (type === 'application/pdf') {
                setFile(processedFile);
                setImage(null);
                setPdfName(processedFile.name);
                setPdfSize((processedFile.size / (1024 * 1024)).toFixed(2));
                setIsProcessing(false);
                showSuccess(`PDF processed! Size: ${formatFileSize(processedFile.size)}`);
            }
        } catch (error) {
            setIsProcessing(false);
            showError(error, 'File Processing Error');
        }
    };

    // Upload cropped image
    const uploadCroppedImage = async (uploadStatus) => {
        const cropper = cropperRef.current?.cropper;
        if (!cropper) return;

        setIsProcessing(true);
        try {
            const canvas = cropper.getCroppedCanvas({
                width: 2048,
                height: Math.round(2048 * (297 / 210)),
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });

            const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
            const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });

            const formData = new FormData();
            formData.append('id', id);
            formData.append('file', file);
            formData.append('status', uploadStatus);

            await axiosInstance.post('/clerk/updateDoc', formData);
            setIsProcessing(false);
            showSuccess('Cropped image uploaded successfully!');
            setImage(null);
        } catch (err) {
            setIsProcessing(false);
            showError(err, 'Upload failed');
        }
    };

    // Upload PDF
    const uploadPdf = async (uploadStatus) => {
        if (!file) {
            showError(new Error('Please select a PDF file to upload'), 'Validation Error');
            return;
        }

        setIsProcessing(true);
        try {
            const formData = new FormData();
            formData.append('id', id);
            formData.append('file', file);
            formData.append('status', uploadStatus);

            await axiosInstance.post('/clerk/updateDoc', formData);
            setIsProcessing(false);
            showSuccess('PDF uploaded successfully!');
            setFile(null);
            setPdfName('');
            setPdfSize(0);
        } catch (err) {
            setIsProcessing(false);
            showError(err, 'Upload failed');
        }
    };

    // Optimized PDF generation with parallel processing
    const generateAndUploadPdf = async (uploadStatus) => {
        if (capturedImages.length === 0) {
            showError(new Error('Please capture at least one image'), 'Validation Error');
            return;
        }

        setIsProcessing(true);
        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true,
            });

            const imageDimensions = await Promise.all(
                capturedImages.map((imgSrc) =>
                    new Promise((resolve) => {
                        const img = new Image();
                        img.onload = () => {
                            const imgRatio = img.width / img.height;
                            const usableWidth = 190;
                            const usableHeight = 277;

                            let width, height;
                            if (imgRatio > usableWidth / usableHeight) {
                                width = usableWidth;
                                height = width / imgRatio;
                            } else {
                                height = usableHeight;
                                width = height * imgRatio;
                            }

                            resolve({
                                imgSrc,
                                width,
                                height,
                                x: (210 - width) / 2,
                                y: (297 - height) / 2,
                            });
                        };
                        img.src = imgSrc;
                    })
                )
            );

            imageDimensions.forEach((img, index) => {
                if (index > 0) doc.addPage();
                doc.addImage(img.imgSrc, 'JPEG', img.x, img.y, img.width, img.height, null, 'SLOW');
            });

            const pdfArrayBuffer = doc.output('arraybuffer');
            const pdfFile = new File([pdfArrayBuffer], `scanned-a4-document-${Date.now()}.pdf`, {
                type: 'application/pdf',
            });

            const formData = new FormData();
            formData.append('id', id);
            formData.append('file', pdfFile);
            formData.append('status', uploadStatus);

            await axiosInstance.post('/clerk/updateDoc', formData);
            setIsProcessing(false);
            showSuccess('A4 PDF uploaded successfully!');
            setCapturedImages([]);
        } catch (err) {
            setIsProcessing(false);
            showError(err, 'PDF Upload Failed');
        }
    };

    // Utility functions
    const clearCapturedImages = () => setCapturedImages([]);
    const deleteCapturedImage = (index) => {
        const updated = [...capturedImages];
        updated.splice(index, 1);
        setCapturedImages(updated);
    };
    const closeWebcam = () => {
        setShowWebcam(false);
        setWebcamReady(false);
        setCameraSettings(null);
    };
    const retryCamera = () => {
        setWebcamError(null);
        setWebcamReady(false);
    };
    const selectDevice = (deviceId) => {
        setDeviceId(deviceId);
        setWebcamReady(false);
    };

    return {
        // State
        image,
        capturedImages,
        file,
        pdfName,
        pdfSize,
        showWebcam,
        showCropper,
        currentCapturedImage,
        isProcessing,
        facingMode,
        deviceId,
        availableDevices,
        webcamReady,
        webcamError,
        cameraSettings,
        isMobile,
        id,
        fileName,
        status,

        // Refs
        webcamRef,
        cropperRef,
        capturedCropperRef,

        // Functions
        setShowWebcam,
        setCapturedImages,
        getVideoConstraints,
        handleUserMedia,
        handleUserMediaError,
        handleCapture,
        handleCropCapturedImage,
        handleFileChange,
        uploadCroppedImage,
        uploadPdf,
        generateAndUploadPdf,
        switchCamera,
        toggleFlash,
        focusCamera,
        clearCapturedImages,
        deleteCapturedImage,
        closeWebcam,
        retryCamera,
        selectDevice,

        // Utility
        MAX_IMAGES,
    };
};
