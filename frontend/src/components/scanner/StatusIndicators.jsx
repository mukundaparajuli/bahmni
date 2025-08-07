import React from 'react';

const StatusIndicators = ({
    cameraSettings,
    webcamError,
    isProcessing,
    isMobile,
    onRetryCamera
}) => {
    return (
        <>
            {/* Camera Status */}
            {cameraSettings && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between text-sm text-green-800">
                        <span>📷 Camera: {cameraSettings.settings.width}x{cameraSettings.settings.height}</span>
                        <div className="flex items-center gap-2">
                            {cameraSettings.capabilities.torch && <span>🔦</span>}
                            <span>📱 {isMobile ? 'Mobile' : 'Desktop'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Webcam Error */}
            {webcamError && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-red-800 text-sm">Camera Error: {webcamError}</p>
                    <button
                        onClick={onRetryCamera}
                        className="mt-2 text-sm text-red-600 underline"
                    >
                        Retry Camera
                    </button>
                </div>
            )}

            {/* Processing indicator */}
            {isProcessing && (
                <div className="flex items-center justify-center p-4 mb-6 bg-blue-50 rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-sm text-blue-700">Processing high-quality image...</span>
                </div>
            )}
        </>
    );
};

export default StatusIndicators; 