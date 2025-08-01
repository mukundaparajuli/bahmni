import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import jsPDF from 'jspdf';
import { useLocation } from 'react-router-dom';
import axiosInstance from '@/api/axios-instance';
import useToastError from '@/hooks/useToastError';
import { Button } from '@/components/ui/button';
import { compressFile, formatFileSize, validateFile } from '@/utils/compression';
import { FiCamera, FiUpload, FiX, FiTrash2, FiCheck, FiPaperclip } from 'react-icons/fi';

const Rescan = () => {
    const { state } = useLocation();
    const webcamRef = useRef(null);
    const cropperRef = useRef(null);
    const capturedCropperRef = useRef(null);
    const { showError, showSuccess } = useToastError();

    const [capturedImages, setCapturedImages] = useState([]);
    const [showWebcam, setShowWebcam] = useState(false);
    const [file, setFile] = useState(null);
    const [pdfName, setPdfName] = useState('');
    const [pdfSize, setPdfSize] = useState(0);
    const [showCropper, setShowCropper] = useState(false);
    const [currentCapturedImage, setCurrentCapturedImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [image, setImage] = useState(null);

    const MAX_IMAGES = 50;
    const A4_RATIO = 210 / 297; // A4 aspect ratio (width/height)

    if (!state) return <p>No document data provided.</p>;

    const { id, fileName, status } = state;
    console.log(state);
    // Optimized video constraints for document scanning
    const videoConstraints = {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
        aspectRatio: A4_RATIO,
    };

    // Optimized capture function with A4 preparation
    const handleCapture = useCallback(async () => {
        if (capturedImages.length >= MAX_IMAGES) {
            showError(new Error(`Cannot capture more than ${MAX_IMAGES} images`), 'Limit Reached');
            return;
        }

        setIsProcessing(true);
        try {
            const screenshot = webcamRef.current.getScreenshot({
                width: 1280,
                height: Math.round(1280 * (297 / 210)),
                quality: 0.85,
            });

            if (!screenshot) {
                throw new Error('Failed to capture image');
            }

            const blob = await (await fetch(screenshot)).blob();
            const file = new File([blob], `captured-${Date.now()}.jpg`, { type: 'image/jpeg' });

            const sizeMB = file.size / (1024 * 1024);
            let processedFile = file;
            if (sizeMB > 1.5) {
                processedFile = await compressFile(file, {
                    maxSizeMB: 1.5,
                    maxWidthOrHeight: 1280,
                    quality: 0.85,
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
    }, [capturedImages.length, showError, showSuccess]);

    // Optimized crop handler with A4 constraints
    const handleCropCapturedImage = useCallback(async () => {
        const cropper = capturedCropperRef.current?.cropper;
        if (!cropper) return;

        setIsProcessing(true);
        try {
            const canvas = cropper.getCroppedCanvas({
                width: 1280,
                height: Math.round(1280 * (297 / 210)),
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'medium',
            });

            const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
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
                maxSize: 20 * 1024 * 1024,
                allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
            });
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            const sizeMB = originalFile.size / (1024 * 1024);
            let processedFile = originalFile;
            if (sizeMB > 1.5) {
                processedFile = await compressFile(originalFile, {
                    maxSizeMB: 1.5,
                    maxWidthOrHeight: 1280,
                    quality: 0.85,
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
    const uploadCroppedImage = async (status) => {
        const cropper = cropperRef.current?.cropper;
        if (!cropper) return;

        setIsProcessing(true);
        try {
            const canvas = cropper.getCroppedCanvas({
                width: 1280,
                height: Math.round(1280 * (297 / 210)),
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'medium',
            });

            const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
            const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });

            const formData = new FormData();
            formData.append('id', id);
            formData.append('file', file);
            formData.append('status', status);

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
    const uploadPdf = async (status) => {
        if (!file) {
            showError(new Error('Please select a PDF file to upload'), 'Validation Error');
            return;
        }

        setIsProcessing(true);
        try {
            const formData = new FormData();
            formData.append('id', id);
            formData.append('file', file);
            formData.append('status', status);

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
    const generateAndUploadPdf = async (status) => {
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
                doc.addImage(img.imgSrc, 'JPEG', img.x, img.y, img.width, img.height, null, 'MEDIUM');
            });

            const pdfArrayBuffer = doc.output('arraybuffer');
            const pdfFile = new File([pdfArrayBuffer], `scanned-a4-document-${Date.now()}.pdf`, {
                type: 'application/pdf',
            });

            const formData = new FormData();
            formData.append('id', id);
            formData.append('file', pdfFile);
            formData.append('status', status);

            await axiosInstance.post('/clerk/updateDoc', formData);
            setIsProcessing(false);
            showSuccess('A4 PDF uploaded successfully!');
            setCapturedImages([]);
        } catch (err) {
            setIsProcessing(false);
            showError(err, 'PDF Upload Failed');
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Rescan or Resubmit Document</h1>

                <p className="text-sm text-gray-600 mb-2">Document ID: {id}</p>
                <p className="text-sm text-gray-600 mb-6">Old File: {fileName}</p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <label className="flex-1 cursor-pointer w-full">
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={isProcessing}
                        />
                        <div className="flex items-center justify-center gap-2 w-full px-4 py-1 bg-white border-2 border-dashed border-blue-400 rounded-lg hover:bg-blue-50 transition">
                            <FiUpload className="text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Upload File</span>
                        </div>
                    </label>

                    <button
                        onClick={() => setShowWebcam(true)}
                        className="w-full flex-1 flex items-center justify-center gap-2 px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                        disabled={isProcessing}
                    >
                        <FiCamera />
                        <span>Open Camera</span>
                    </button>
                </div>

                {isProcessing && (
                    <div className="flex items-center justify-center p-4 mb-6 bg-blue-50 rounded-lg">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                        <span className="text-sm text-blue-700">Processing, please wait...</span>
                    </div>
                )}

                {/* Webcam View with A4 overlay */}
                {showWebcam && (
                    <div className="mb-6">
                        <div className="relative aspect-[297/210] bg-gray-100 rounded-lg overflow-hidden">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className="w-full h-full object-cover"
                                videoConstraints={videoConstraints}
                                screenshotQuality={0.85}
                                forceScreenshotSourceSize={true}
                            />
                            <div className="absolute inset-0 border-4 border-dashed border-blue-300 rounded-lg pointer-events-none">
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] h-[90%] border-2 border-white/50"></div>
                            </div>
                            <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm bg-black/50 py-1">
                                Align document within A4 boundaries
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleCapture}
                                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                                disabled={isProcessing}
                            >
                                <FiCamera />
                                {isProcessing ? 'Capturing...' : 'Capture Image'}
                            </button>
                            <button
                                onClick={() => setShowWebcam(false)}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                                disabled={isProcessing}
                            >
                                <FiX />
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Image Cropper for Captured Images */}
                {showCropper && currentCapturedImage && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Crop Your Image</h3>
                        <div className="h-96 w-full bg-gray-100 rounded-lg overflow-hidden">
                            <Cropper
                                src={currentCapturedImage}
                                ref={capturedCropperRef}
                                style={{ height: '100%', width: '100%' }}
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
                                data={{ width: 210, height: 297 }}
                            />
                        </div>
                        <div className="flex flex-wrap gap-3 mt-4">
                            <Button
                                onClick={handleCropCapturedImage}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                                disabled={isProcessing}
                            >
                                <FiCheck />
                                {isProcessing ? 'Processing...' : 'Save Cropped Image'}
                            </Button>
                            <Button
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
                            <Button
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
                {capturedImages.length > 0 && (
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Captured Images ({capturedImages.length})
                            </h2>
                            <button
                                onClick={() => setCapturedImages([])}
                                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                                disabled={isProcessing}
                            >
                                <FiTrash2 size={14} />
                                Clear All
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {capturedImages.map((img, index) => (
                                <div
                                    key={index}
                                    className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-200"
                                >
                                    <img
                                        src={img}
                                        alt={`Captured ${index + 1}`}
                                        className="w-full h-32 object-cover"
                                    />
                                    <button
                                        onClick={() => {
                                            const updated = [...capturedImages];
                                            updated.splice(index, 1);
                                            setCapturedImages(updated);
                                        }}
                                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                                        disabled={isProcessing}
                                    >
                                        <FiX size={14} />
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                        <p className="text-xs text-white truncate">Image {index + 1}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-4">
                            <Button
                                onClick={() => generateAndUploadPdf(status === 'rejected' ? 'rescanned_draft' : 'draft')}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={isProcessing}
                            >
                                <FiUpload />
                                {isProcessing ? 'Processing...' : 'Upload as Draft PDF'}
                            </Button>
                            <Button
                                onClick={() => generateAndUploadPdf(status === 'rejected' ? 'rescanned' : 'submitted')}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                                disabled={isProcessing}
                            >
                                <FiUpload />
                                {isProcessing ? 'Processing...' : 'Upload as Submitted PDF'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Uploaded Image Cropper */}
                {image && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Crop Uploaded Image</h3>
                        <div className="h-96 w-full bg-gray-100 rounded-lg overflow-hidden">
                            <Cropper
                                src={image}
                                ref={cropperRef}
                                style={{ height: '100%', width: '100%' }}
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
                            />
                        </div>
                        <div className="flex flex-wrap gap-3 mt-4">
                            <Button
                                onClick={() => uploadCroppedImage(status === 'rejected' ? 'rescanned_draft' : 'draft')}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={isProcessing}
                            >
                                <FiUpload />
                                {isProcessing ? 'Uploading...' : 'Upload as Draft Image'}
                            </Button>
                            <Button
                                onClick={() => uploadCroppedImage(status === 'rejected' ? 'rescanned' : 'submitted')}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                                disabled={isProcessing}
                            >
                                <FiUpload />
                                {isProcessing ? 'Uploading...' : 'Upload as Submitted Image'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* PDF Upload */}
                {file && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <FiPaperclip className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-800">{pdfName}</p>
                                <p className="text-sm text-gray-600">{pdfSize} MB</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-4">
                            <Button
                                onClick={() => uploadPdf(status === 'rejected' ? 'rescanned_draft' : 'draft')}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={isProcessing}
                            >
                                <FiUpload />
                                {isProcessing ? 'Uploading...' : 'Upload as Draft PDF'}
                            </Button>
                            <Button
                                onClick={() => uploadPdf(status === 'rejected' ? 'rescanned' : 'submitted')}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                                disabled={isProcessing}
                            >
                                <FiUpload />
                                {isProcessing ? 'Uploading...' : 'Upload as Submitted PDF'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Rescan;