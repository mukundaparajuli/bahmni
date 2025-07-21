import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Set the worker source for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

const PDFPreviewer = ({ file }) => {
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
        setNumPages(numPages);
    };

    return (
        <div
            id="pdf-container"
            className="w-full max-w-4xl mx-auto p-4 overflow-y-auto max-h-[85vh] bg-white rounded-lg"
        >
            {file ? (
                <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
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