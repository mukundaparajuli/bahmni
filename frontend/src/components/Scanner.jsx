import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import jsPDF from 'jspdf';
import axiosInstance from '@/api/axios-instance';
import useToastError from '@/hooks/useToastError';
import { Button } from '@/components/ui/button';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const DocumentScanner = () => {
    const [image, setImage] = useState(null);
    const [capturedImages, setCapturedImages] = useState([]);
    const [pdfFile, setPdfFile] = useState(null);
    const [mrn, setMrn] = useState('');
    const [showWebcam, setShowWebcam] = useState(false);
    const [pdfName, setPdfName] = useState('');
    const [pdfSize, setPdfSize] = useState(0);
    const [showCropper, setShowCropper] = useState(false);
    const [currentCapturedImage, setCurrentCapturedImage] = useState(null);
    const cropperRef = useRef(null);
    const webcamRef = useRef(null);
    const capturedCropperRef = useRef(null);
    const { showError, showSuccess } = useToastError();

    // Improved camera constraints for better document scanning
    const videoConstraints = {
        facingMode: 'environment',
        width: { ideal: 1920, max: 1920 },
        height: { ideal: 1080, max: 1080 },
        aspectRatio: { ideal: 16/9 }
    };

    const handleCapture = useCallback(() => {
        const screenshot = webcamRef.current.getScreenshot({
            width: 1920,
            height: 1080,
            quality: 0.95
        });
        if (screenshot) {
            setCurrentCapturedImage(screenshot);
            setShowWebcam(false);
            setShowCropper(true);
        }
    }, []);

    const handleCropCapturedImage = useCallback(() => {
        const cropper = capturedCropperRef.current?.cropper;
        if (!cropper) return;

        const canvas = cropper.getCroppedCanvas({
            width: 1920,
            height: 1080,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });

        const croppedImage = canvas.toDataURL('image/jpeg', 0.95);
        setCapturedImages(prev => [...prev, croppedImage]);
        setShowCropper(false);
        setCurrentCapturedImage(null);
        showSuccess('Image captured and cropped successfully');
    }, [showSuccess]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const type = file.type;
        if (type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result);
                setPdfFile(null);
                setPdfName('');
                setPdfSize(0);
            };
            reader.readAsDataURL(file);
        } else if (type === 'application/pdf') {
            setPdfFile(file);
            setImage(null);
            setPdfName(file.name);
            setPdfSize((file.size / (1024 * 1024)).toFixed(2)); // Convert to MB
        }
    };

    const uploadCroppedImage = async () => {
        if (!mrn.trim()) {
            showError(new Error('Please enter the patient MRN to proceed'), 'Validation Error');
            return;
        }
        const cropper = cropperRef.current?.cropper;
        if (!cropper) return;

        const canvas = cropper.getCroppedCanvas({
            width: 1920,
            height: 1080,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
        const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('patientMRN', mrn);
        formData.append('employeeId', '12345');

        try {
            await axiosInstance.post('/clerk/uploadDoc', formData);
            showSuccess('Image uploaded successfully!');
            setImage(null);
        } catch (err) {
            console.error(err);
            showError(err, 'Upload failed');
        }
    };

    const uploadPdf = async () => {
        if (!mrn.trim()) {
            showError(new Error('Please enter the patient MRN to proceed'), 'Validation Error');
            return;
        }
        if (!pdfFile) {
            showError(new Error('Please select a PDF file to upload'), 'Validation Error');
            return;
        }
        
        const formData = new FormData();
        formData.append('file', pdfFile);
        formData.append('patientMRN', mrn);
        formData.append('employeeId', '1234');

        try {
            const res = await axiosInstance.post('/clerk/uploadDoc', formData);
            showSuccess('PDF uploaded successfully!');
            setPdfFile(null);
            setPdfName('');
            setPdfSize(0);
        } catch (err) {
            console.error(err);
            showError(err, 'Upload failed');
        }
    };

    const generateAndUploadPdf = async () => {
        if (!mrn.trim()) {
            showError(new Error('Please enter the patient MRN to proceed'), 'Validation Error');
            return;
        }
        if (capturedImages.length === 0) {
            showError(new Error('Please capture at least one image'), 'Validation Error');
            return;
        }

        // Create PDF with better quality settings
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: false
        });

        for (let i = 0; i < capturedImages.length; i++) {
            if (i !== 0) doc.addPage();
            
            // Calculate proper dimensions to maintain aspect ratio
            const imgWidth = 190; // A4 width minus margins
            const imgHeight = 270; // A4 height minus margins
            
            doc.addImage(
                capturedImages[i], 
                'JPEG', 
                10, 
                10, 
                imgWidth, 
                imgHeight,
                undefined,
                'FAST'
            );
        }

        const pdfBlob = doc.output('blob');
        const file = new File([pdfBlob], 'scanned-document.pdf', { type: 'application/pdf' });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('scannerClerk', '687903b74d2933e28308743f');
        formData.append('patientMRN', mrn);
        formData.append('employeeId', '1234');

        try {
            await axiosInstance.post(`/clerk/uploadDoc`, formData);
            showSuccess('Scanned PDF uploaded successfully!');
            setCapturedImages([]);
        } catch (err) {
            console.error(err);
            showError(err, 'Upload failed');
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-xl font-semibold mb-4">Document Scanner</h1>

            {/* Patient MRN */}
            <label className="block text-sm font-medium mb-1 text-gray-700">Enter Patient MRN</label>
            <input
                type="text"
                value={mrn}
                onChange={(e) => setMrn(e.target.value)}
                className="w-full mb-4 px-3 py-2 border rounded-md text-sm"
                placeholder="e.g., MRN123456"
            />

            {/* File Upload */}
            <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="mb-4 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0 file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            {/* Camera Button */}
            <button
                onClick={() => setShowWebcam(true)}
                className="mb-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
                Open Camera
            </button>

            {/* Webcam Component with improved settings */}
            {showWebcam && (
                <div className="mb-4 relative">
                    <div className="relative border-4 border-dashed border-blue-500 rounded-lg p-2">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full rounded-md"
                            videoConstraints={videoConstraints}
                            screenshotQuality={0.95}
                        />
                        {/* Corner guides for document alignment */}
                        <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-yellow-400 rounded-tl-lg"></div>
                        <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-yellow-400 rounded-tr-lg"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-yellow-400 rounded-bl-lg"></div>
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-yellow-400 rounded-br-lg"></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 text-center">
                        Align the document corners with the yellow guides for best results
                    </p>
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={handleCapture}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                        >
                            Capture Image
                        </button>
                        <button
                            onClick={() => setShowWebcam(false)}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Image Cropper for Captured Images */}
            {showCropper && currentCapturedImage && (
                <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Crop Captured Image</h3>
                    <div className="w-full h-[60vh] mb-4">
                        <Cropper
                            src={currentCapturedImage}
                            ref={capturedCropperRef}
                            style={{ height: '100%', width: '100%' }}
                            aspectRatio={NaN}
                            guides={true}
                            viewMode={1}
                            dragMode="move"
                            autoCropArea={0.9}
                            background={false}
                            cropBoxResizable={true}
                            cropBoxMovable={true}
                            toggleDragModeOnDblclick={false}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleCropCapturedImage}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            Save Cropped Image
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowCropper(false);
                                setCurrentCapturedImage(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setCapturedImages(prev => [...prev, currentCapturedImage]);
                                setShowCropper(false);
                                setCurrentCapturedImage(null);
                                showSuccess('Image saved without cropping');
                            }}
                        >
                            Skip Cropping
                        </Button>
                    </div>
                </div>
            )}

            {/* Captured Image Gallery */}
            {capturedImages.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-lg font-medium mb-2">Captured Images ({capturedImages.length})</h2>
                    <div className="grid grid-cols-2 gap-2">
                        {capturedImages.map((img, index) => (
                            <div key={index} className="relative">
                                <img src={img} alt={`Captured ${index + 1}`} className="w-full rounded shadow" />
                                <button
                                    onClick={() => {
                                        const updated = [...capturedImages];
                                        updated.splice(index, 1);
                                        setCapturedImages(updated);
                                    }}
                                    className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={generateAndUploadPdf}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                        >
                            Upload All as PDF ({capturedImages.length} images)
                        </button>
                        <button
                            onClick={() => setCapturedImages([])}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                        >
                            Clear All Images
                        </button>
                    </div>
                </div>
            )}

            {/* Cropper Component for File Upload */}
            {image && (
                <>
                    <h3 className="text-lg font-medium mb-2">Crop Uploaded Image</h3>
                    <div className="w-full h-[60vh] mb-4">
                        <Cropper
                            src={image}
                            ref={cropperRef}
                            style={{ height: '100%', width: '100%' }}
                            aspectRatio={NaN}
                            guides={true}
                            viewMode={1}
                            dragMode="move"
                            autoCropArea={0.9}
                            background={false}
                            cropBoxResizable={true}
                            cropBoxMovable={true}
                        />
                    </div>
                    <button
                        onClick={uploadCroppedImage}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        Upload Cropped Image
                    </button>
                </>
            )}

            {/* PDF Preview and Upload */}
            {pdfFile && (
                <div className="mt-4">
                    <p className="text-sm mb-2 text-gray-600">
                        PDF selected: {pdfName} ({pdfSize} MB)
                    </p>
                    <button
                        onClick={uploadPdf}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        Upload PDF
                    </button>
                </div>
            )}
        </div>
    );
};

export default DocumentScanner;
