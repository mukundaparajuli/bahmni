import React from 'react';
import { FiZap, FiTarget, FiRotateCw } from 'react-icons/fi';

const CameraControls = ({
    cameraSettings,
    availableDevices,
    isProcessing,
    onToggleFlash,
    onFocusCamera,
    onSwitchCamera
}) => {
    return (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
            {/* Flash toggle */}
            {cameraSettings?.capabilities?.torch && (
                <button
                    onClick={onToggleFlash}
                    className="p-2 rounded-full bg-white/80 text-gray-700 shadow-lg hover:bg-white transition"
                    disabled={isProcessing}
                >
                    <FiZap size={18} />
                </button>
            )}

            {/* Focus button */}
            {cameraSettings?.capabilities?.focusMode && (
                <button
                    onClick={onFocusCamera}
                    className="p-2 rounded-full bg-white/80 text-gray-700 shadow-lg hover:bg-white transition"
                    disabled={isProcessing}
                >
                    <FiTarget size={18} />
                </button>
            )}

            {/* Camera switch */}
            {availableDevices.length > 1 && (
                <button
                    onClick={onSwitchCamera}
                    className="p-2 rounded-full bg-white/80 text-gray-700 shadow-lg hover:bg-white transition"
                    disabled={isProcessing}
                >
                    <FiRotateCw size={18} />
                </button>
            )}
        </div>
    );
};

export default CameraControls; 