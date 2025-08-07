import React from 'react';
import { FiUpload, FiCamera, FiX } from 'react-icons/fi';

const ActionButtons = ({
    showWebcam,
    isProcessing,
    onFileChange,
    onToggleWebcam
}) => {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <label className="flex-1 cursor-pointer">
                <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={onFileChange}
                    className="hidden"
                    disabled={isProcessing}
                />
                <div className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border-2 border-dashed border-blue-400 rounded-lg hover:bg-blue-50 transition">
                    <FiUpload className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Upload File</span>
                </div>
            </label>

            <button
                onClick={onToggleWebcam}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition ${showWebcam
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } disabled:bg-gray-400`}
                disabled={isProcessing}
            >
                {showWebcam ? <FiX /> : <FiCamera />}
                <span>{showWebcam ? 'Close Camera' : 'Open Camera'}</span>
            </button>
        </div>
    );
};

export default ActionButtons; 