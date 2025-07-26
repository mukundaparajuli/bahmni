import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set the worker source for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.js",
    import.meta.url
).toString();

const PDFTest = () => {
    const [numPages, setNumPages] = React.useState(null);
    
    const onDocumentLoadSuccess = ({ numPages }) => {
        console.log('Test PDF loaded successfully with', numPages, 'pages');
        setNumPages(numPages);
    };

    const onDocumentLoadError = (error) => {
        console.error('Test PDF load error:', error);
    };

    // Sample PDF data URL for testing (minimal PDF)
    const samplePDF = "data:application/pdf;base64,JVBERi0xLjEKJcKlwrHDqwoKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCgoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDQgMCBSCj4+Cj4+Ci9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iagoKNSAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVAovRjEgMTIgVGYKNzIgNzIwIFRkCihUZXN0IFBERiBGaWxlKSBUagoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQ1IDAwMDAwIG4gCjAwMDAwMDAzMDcgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MDAKJSVFT0YK";

    return (
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">PDF Test Component</h3>
            <div className="bg-gray-50 p-4 rounded">
                <Document
                    file={samplePDF}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    className="flex flex-col items-center"
                >
                    {Array.from(new Array(numPages || 0), (_, index) => (
                        <div key={index} className="mb-4">
                            <Page
                                pageNumber={index + 1}
                                width={400}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                className="border rounded shadow"
                            />
                        </div>
                    ))}
                </Document>
                {!numPages && (
                    <p className="text-center text-gray-500">Loading test PDF...</p>
                )}
            </div>
        </div>
    );
};

export default PDFTest;