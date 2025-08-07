import React from 'react';

const FormInputs = ({
    mrn,
    fileName,
    isProcessing,
    onMrnChange,
    onFileNameChange
}) => {
    return (
        <>
            {/* MRN Input */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient MRN</label>
                <input
                    type="text"
                    value={mrn}
                    onChange={onMrnChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="e.g., MRN123456"
                    disabled={isProcessing}
                />
            </div>

            {/* File name Input */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">File Name</label>
                <input
                    type="text"
                    value={fileName}
                    onChange={onFileNameChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Document name"
                    disabled={isProcessing}
                />
            </div>
        </>
    );
};

export default FormInputs; 