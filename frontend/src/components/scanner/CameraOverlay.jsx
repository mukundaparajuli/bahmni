import React from 'react';

const CameraOverlay = () => {
    return (
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-lg">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] h-[90%] border-2 border-yellow-400/80 shadow-lg"></div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white text-sm bg-black/60 px-4 py-2 rounded-full inline-block">
                    📄 Align document within the yellow frame for best results
                </p>
            </div>
        </div>
    );
};

export default CameraOverlay; 