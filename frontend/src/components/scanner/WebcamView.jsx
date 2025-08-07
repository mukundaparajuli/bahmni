import React from 'react';
import Webcam from 'react-webcam';
import { FiCamera, FiX } from 'react-icons/fi';
import CameraControls from './CameraControls';
import CameraOverlay from './CameraOverlay';

const WebcamView = ({
    showWebcam,
    webcamRef,
    webcamReady,
    webcamError,
    isProcessing,
    cameraSettings,
    availableDevices,
    facingMode,
    getVideoConstraints,
    handleUserMedia,
    handleUserMediaError,
    handleCapture,
    onToggleFlash,
    onFocusCamera,
    onSwitchCamera,
    onCloseWebcam
}) => {
    if (!showWebcam) return null;

    return (
        <div className="mb-6">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    screenshotQuality={1.0}
                    videoConstraints={getVideoConstraints()}
                    onUserMedia={handleUserMedia}
                    onUserMediaError={handleUserMediaError}
                    className="w-full h-auto"
                    style={{
                        maxHeight: '70vh',
                        transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
                    }}
                    forceScreenshotSourceSize={true}
                    imageSmoothing={true}
                />

                <CameraOverlay />
                <CameraControls
                    cameraSettings={cameraSettings}
                    availableDevices={availableDevices}
                    isProcessing={isProcessing}
                    onToggleFlash={onToggleFlash}
                    onFocusCamera={onFocusCamera}
                    onSwitchCamera={onSwitchCamera}
                />

                {/* Camera ready indicator */}
                {!webcamReady && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                            <p>Initializing camera...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Capture button */}
            <div className="flex gap-3 mt-4">
                <button
                    onClick={handleCapture}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                    disabled={isProcessing || !webcamReady}
                >
                    <FiCamera />
                    {isProcessing ? 'Capturing...' : 'Capture High-Quality Image'}
                </button>
                <button
                    onClick={onCloseWebcam}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                    disabled={isProcessing}
                >
                    <FiX />
                    Close
                </button>
            </div>
        </div>
    );
};

export default WebcamView; 