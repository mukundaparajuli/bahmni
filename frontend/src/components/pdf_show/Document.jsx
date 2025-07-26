import React, { useState, useEffect } from "react";
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Import centralized PDF configuration
import '@/utils/pdf-config';

const PDFPreviewer = ({ filePath }) => {
    const [numPages, setNumPages] = useState(null);
    const [width, setWidth] = useState(0);

    // Update width based on container size
    useEffect(() => {
        const updateWidth = () => {
            const container = document.getElementById("pdf-container");
            if (container) {
                setWidth(container.offsetWidth - 40); // Subtract padding
            }
        };
        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    // Handle document load success
    const onDocumentLoadSuccess = ({ numPages }) => {
        console.log('PDF loaded successfully with', numPages, 'pages');
        setNumPages(numPages);
    };

    // Handle document load error
    const onDocumentLoadError = (error) => {
        console.error('PDF load error:', error);
    };
    console.log("PDF file path:", filePath);
    return (
        <div
            id="pdf-container"
            className="w-full max-w-4xl mx-auto p-4 overflow-y-auto max-h-[85vh] bg-white rounded-lg"
        >
            {filePath ? (
                <Document
                    file={filePath}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    className="flex flex-col items-center"
                >
                    {Array.from(new Array(numPages || 0), (_, index) => (
                        <div key={index} className="mb-4 shadow-lg">
                            <Page
                                pageNumber={index + 1}
                                width={width}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                className="border rounded"
                            />
                        </div>
                    ))}
                </Document>
            ) : (
                <p className="text-center text-gray-500">No PDF file provided</p>
            )}
        </div>
    );
};

export default PDFPreviewer;