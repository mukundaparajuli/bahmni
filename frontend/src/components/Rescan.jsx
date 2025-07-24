import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import jsPDF from 'jspdf';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const Rescan = () => {
    const { state } = useLocation();
    const webcamRef = useRef(null);

    const [capturedImages, setCapturedImages] = useState([]);
    const [showWebcam, setShowWebcam] = useState(false);
    const [file, setFile] = useState(null);

    if (!state) return <p>No document data provided.</p>;

    const { id, fileName, filePath, uploadedAt } = state;

    const handleCapture = useCallback(() => {
        const screenshot = webcamRef.current.getScreenshot();
        if (screenshot) {
            setCapturedImages(prev => [...prev, screenshot]);
            setShowWebcam(false);
        }
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setFile(file);
    };

    const generatePDFfromImages = () => {
        const doc = new jsPDF();
        capturedImages.forEach((img, index) => {
            if (index !== 0) doc.addPage();
            doc.addImage(img, 'JPEG', 10, 10, 190, 270);
        });
        return doc.output('blob');
    };

    const uploadUpdatedDocument = async (fileToUpload) => {
        const formData = new FormData();
        formData.append('id', id);
        formData.append('file', fileToUpload);


        try {
            await axios.post('http://localhost:5555/api/v1/clerk/updateDoc', formData);
            alert('Document updated successfully!');
            setCapturedImages([]);
            setFile(null);
        } catch (error) {
            console.error(error);
            alert('Failed to update document.');
        }
    };

    const handleUpload = async () => {
        if (capturedImages.length > 0) {
            const pdfBlob = generatePDFfromImages();
            const pdfFile = new File([pdfBlob], 'rescanned-document.pdf', { type: 'application/pdf' });
            await uploadUpdatedDocument(pdfFile);
        } else if (file) {
            await uploadUpdatedDocument(file);
        } else {
            alert('Please capture images or upload a file.');
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-xl font-semibold mb-4">Rescan or Resubmit Document</h1>

            <p className="text-sm text-gray-600 mb-2">Document ID: {id}</p>
            <p className="text-sm text-gray-600 mb-4">Old File: {fileName}</p>

            <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="mb-4 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0 file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            <button
                onClick={() => setShowWebcam(true)}
                className="mb-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
                Open Camera
            </button>

            {showWebcam && (
                <div className="mb-4">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full rounded-md"
                        videoConstraints={{ facingMode: 'environment' }}
                    />
                    <button
                        onClick={handleCapture}
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        Capture Image
                    </button>
                </div>
            )}

            {capturedImages.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-lg font-medium mb-2">Captured Images</h2>
                    <div className="grid grid-cols-2 gap-2">
                        {capturedImages.map((img, index) => (
                            <div key={index} className="relative">
                                <img src={img} alt={`Captured ${index}`} className="w-full rounded shadow" />
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
                </div>
            )}

            <button
                onClick={handleUpload}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
                Upload Rescan/Resubmitted Document
            </button>
        </div>
    );
};

export default Rescan;
