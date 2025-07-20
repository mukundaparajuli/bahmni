import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import axios from 'axios';
import { upload } from '../api/uploadDoc-api'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const DocumentScanner = () => {
    const [image, setImage] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [mrn, setMrn] = useState('');
    const [showWebcam, setShowWebcam] = useState(false);
    const [pdfName, setPdfName] = useState('');
    const cropperRef = useRef(null);
    const webcamRef = useRef(null);
    console.log(upload);

    const handleCapture = useCallback(() => {
        const screenshot = webcamRef.current.getScreenshot();
        setImage(screenshot);
        setShowWebcam(false);
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const type = file.type;
        if (type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result);
                setPdfFile(null);
            };
            reader.readAsDataURL(file);
        } else if (type === 'application/pdf') {
            setPdfFile(file);
            setImage(null);
            setPdfName(file.name);
        }
    };

    const uploadCroppedImage = async () => {
        if (!mrn) return alert('Enter Patient MRN');
        const cropper = cropperRef.current?.cropper;
        if (!cropper) return;

        const canvas = cropper.getCroppedCanvas();
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg'));
        const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('scannerClerk', '687903b74d2933e28308743f'); // replace with actual
        formData.append('patientMRN', mrn);
        formData.append('employeeId', '12345');
        console.log(blob);
        try {
            const res = await axios.post('http://localhost:5000/api/v1/doc/uploadDocument', formData);

            alert('Image uploaded successfully!');
            setImage(null);
        } catch (err) {
            console.log(res.data);
            console.error(err);
            alert('Upload failed');
        }
    };

    const uploadPdf = async () => {
        if (!mrn || !pdfFile) return alert('Missing Patient MRN or PDF');
        const formData = new FormData();
        formData.append('file', pdfFile);
        formData.append('scannerClerk', '687903b74d2933e28308743f'); // replace with actual
        formData.append('patientMRN', mrn);
        formData.append('employeeId', '1234');
        console.log(pdfFile);

        try {
            const res = await axios.post('http://localhost:5000/api/v1/doc/uploadDocument', formData);
            alert('PDF uploaded successfully!');
            setPdfFile(null);
            setPdfName('');
        } catch (err) {
            console.error(err);
            alert('Upload failed');
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

            {/* Camera */}
            <button
                onClick={() => setShowWebcam(true)}
                className="mb-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
                Open Camera
            </button>

            {/* Webcam Component */}
            {showWebcam && (
                <div className="mb-4">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full rounded-md"
                        videoConstraints={{
                            facingMode: 'environment',
                        }}
                    />
                    <button
                        onClick={handleCapture}
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        Capture & Crop
                    </button>
                </div>
            )}

            {/* Cropper Component */}
            {image && (
                <>
                    <div className="w-full h-[60vh] mb-4">
                        <Cropper
                            src={image}
                            ref={cropperRef}
                            style={{ height: '100%', width: '100%' }}
                            aspectRatio={NaN}
                            guides={true}
                            viewMode={1}
                            dragMode="move"
                            autoCropArea={1}
                            background={false}
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

            {/* PDF Preview */}
            {pdfFile && (
                <>

                    <button
                        onClick={uploadPdf}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        Upload PDF
                    </button>
                </>
            )}
        </div>
    );
};

export default DocumentScanner;
