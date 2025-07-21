import React, { useState, useEffect } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const PDFPreviewer = () => {
    const [file, setFile] = useState(null);
    const [width, setWidth] = useState(300);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile?.type === 'application/pdf') {
            setFile(selectedFile);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-4" id="pdf-container">
            <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="mb-4 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            {file && (
                <div className="p-2 w-[220px] border rounded shadow bg-white">
                    <Document file={file}>
                        <Page
                            pageNumber={1}
                            width={300}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                        />
                    </Document>
                </div>
            )}
        </div>
    );
}

export default PDFPreviewer;
