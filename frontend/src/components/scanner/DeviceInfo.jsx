import React from 'react';

const DeviceInfo = ({
    isMobile,
    availableDevices,
    cameraSettings,
    deviceId,
    onDeviceSelect
}) => {
    return (
        <div className="mt-8 space-y-4">
            {/* Quality Tips */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-3">💡 Tips for Best Quality</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
                    <ul className="space-y-1">
                        <li>• Use good lighting - natural light works best</li>
                        <li>• Keep the device steady when capturing</li>
                        <li>• Fill the frame with your document</li>
                        <li>• Ensure the document is flat and unwrinkled</li>
                    </ul>
                    <ul className="space-y-1">
                        <li>• Use flash in low-light conditions</li>
                        <li>• Clean your camera lens before use</li>
                        <li>• Tap focus button if image appears blurry</li>
                        <li>• Switch cameras for better quality if available</li>
                    </ul>
                </div>
            </div>

            {/* Device Information */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">📱 Device Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                    <div>
                        <p><strong>Device Type:</strong> {isMobile ? 'Mobile' : 'Desktop'}</p>
                        <p><strong>Available Cameras:</strong> {availableDevices.length}</p>
                        {cameraSettings && (
                            <>
                                <p><strong>Resolution:</strong> {cameraSettings.settings.width}x{cameraSettings.settings.height}</p>
                                <p><strong>Frame Rate:</strong> {cameraSettings.settings.frameRate || 'Auto'} fps</p>
                            </>
                        )}
                    </div>
                    <div>
                        {cameraSettings && (
                            <>
                                <p><strong>Focus Mode:</strong> {cameraSettings.settings.focusMode || 'Auto'}</p>
                                <p><strong>Flash Available:</strong> {cameraSettings.capabilities.torch ? 'Yes' : 'No'}</p>
                                <p><strong>Zoom Available:</strong> {cameraSettings.capabilities.zoom ? 'Yes' : 'No'}</p>
                                <p><strong>Facing Mode:</strong> {cameraSettings.settings.facingMode || 'Environment'}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Camera Selection (if multiple cameras) */}
            {availableDevices.length > 1 && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">📷 Camera Selection</h4>
                    <div className="space-y-2">
                        {availableDevices.map((device, index) => (
                            <button
                                key={device.deviceId}
                                onClick={() => onDeviceSelect(device.deviceId)}
                                className={`w-full text-left p-2 rounded text-sm transition ${deviceId === device.deviceId
                                    ? 'bg-blue-100 border border-blue-300 text-blue-800'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                📹 {device.label || `Camera ${index + 1}`}
                                {deviceId === device.deviceId && <span className="ml-2">✓</span>}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Troubleshooting */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">🔧 Troubleshooting</h4>
                <div className="text-sm text-yellow-700 space-y-1">
                    <p><strong>Camera not working?</strong> Check browser permissions and refresh the page.</p>
                    <p><strong>Poor image quality?</strong> Ensure good lighting and clean camera lens.</p>
                    <p><strong>App running slow?</strong> Close other tabs/apps to free up memory.</p>
                    <p><strong>Upload failing?</strong> Check internet connection and file size.</p>
                </div>
            </div>
        </div>
    );
};

export default DeviceInfo; 