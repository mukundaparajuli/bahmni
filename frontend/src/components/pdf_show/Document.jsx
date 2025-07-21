import React, { useState, useEffect } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const PDFPreviewer = ({ file }) => {
    const [width, setWidth] = useState(300);
    return (
        <div className="w-full max-w-md mx-auto p-4" id="pdf-container">
            this is the pdf component
            {file && (
                <div className="p-2 w-[220px] border rounded shadow bg-white">
                    <Document file={file}>
                        <Page
                            pageNumber={1}
                            width={width}
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
