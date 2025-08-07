import React, { useMemo } from 'react';
import { FiTrash2, FiX, FiUpload } from 'react-icons/fi';

const ImageGallery = ({
    capturedImages,
    isProcessing,
    onClearAll,
    onDeleteImage,
    onGeneratePdf,
    showDraftOption = false
}) => {
    const isAndroid = useMemo(() => /Android/i.test(navigator.userAgent), []);
    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                    📸 Captured Images ({capturedImages.length})
                </h2>
                <button
                    onClick={onClearAll}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                    disabled={isProcessing}
                >
                    <FiTrash2 size={14} />
                    Clear All
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {capturedImages.map((img, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-200">
                        <img
                            src={img}
                            alt={`Captured ${index + 1}`}
                            className="w-full h-32 object-cover"
                        />
                        <button
                            onClick={() => onDeleteImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full transition opacity-0 group-hover:opacity-100"
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

            {showDraftOption ? (
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button
                        onClick={() => onGeneratePdf(true)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                        disabled={isProcessing}
                    >
                        <FiUpload />
                        {isProcessing ? 'Creating Draft PDF...' : 'Upload as Draft PDF'}
                    </button>
                    <button
                        onClick={() => onGeneratePdf(false)}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                        disabled={isProcessing}
                    >
                        <FiUpload />
                        {isProcessing ? 'Creating Submitted PDF...' : 'Upload as Submitted PDF'}
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => onGeneratePdf()}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                    disabled={isProcessing}
                >
                    <FiUpload />
                    {isProcessing
                        ? 'Creating High-Quality PDF...'
                        : `Upload as A4 PDF (${capturedImages.length} images)`}
                </button>
            )}
        </div>
    );
};

export default ImageGallery; 