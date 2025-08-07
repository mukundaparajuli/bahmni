import React from 'react';
import { FiPaperclip, FiUpload } from 'react-icons/fi';

const PdfUploader = ({
    pdfFile,
    pdfName,
    pdfSize,
    isProcessing,
    onUploadPdf,
    showDraftOption = false
}) => {
    if (!pdfFile) return null;

    return (
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

            {showDraftOption ? (
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button
                        onClick={() => onUploadPdf(true)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                        disabled={isProcessing}
                    >
                        <FiUpload />
                        {isProcessing ? 'Uploading Draft...' : 'Upload as Draft PDF'}
                    </button>
                    <button
                        onClick={() => onUploadPdf(false)}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                        disabled={isProcessing}
                    >
                        <FiUpload />
                        {isProcessing ? 'Uploading Submitted...' : 'Upload as Submitted PDF'}
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => onUploadPdf()}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                    disabled={isProcessing}
                >
                    <FiUpload />
                    {isProcessing ? 'Uploading...' : 'Upload PDF'}
                </button>
            )}
        </div>
    );
};

export default PdfUploader; 