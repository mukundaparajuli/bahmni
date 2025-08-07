import React from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Button } from '@/components/ui/button';
import { FiCheck, FiX, FiPaperclip, FiUpload } from 'react-icons/fi';

const ImageCropper = ({
    image,
    cropperRef,
    isProcessing,
    onCrop,
    onCancel,
    onSkipCrop,
    title = "✂️ Crop Your Document",
    showSkipOption = false,
    showDraftOption = false
}) => {
    const A4_RATIO = 210 / 297;

    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
            <div className="h-96 w-full bg-gray-100 rounded-lg overflow-hidden">
                <Cropper
                    src={image}
                    ref={cropperRef}
                    style={{ height: '100%', width: '100%' }}
                    aspectRatio={A4_RATIO}
                    viewMode={1}
                    dragMode="move"
                    autoCropArea={0.8}
                    background={false}
                    cropBoxResizable={true}
                    cropBoxMovable={true}
                    responsive={true}
                    checkOrientation={true}
                    guides={true}
                    scalable={true}
                    zoomable={true}
                    wheelZoomRatio={0.1}
                    touchDragZoom={true}
                />
            </div>

            {showDraftOption ? (
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <Button
                        onClick={() => onCrop(true)}
                        className="flex-1 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isProcessing}
                    >
                        <FiUpload />
                        {isProcessing ? 'Uploading Draft...' : 'Upload as Draft'}
                    </Button>
                    <Button
                        onClick={() => onCrop(false)}
                        className="flex-1 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                        disabled={isProcessing}
                    >
                        <FiUpload />
                        {isProcessing ? 'Uploading Submitted...' : 'Upload as Submitted'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isProcessing}
                    >
                        <FiX />
                        Cancel
                    </Button>
                </div>
            ) : (
                <div className="flex flex-wrap gap-3 mt-4">
                    <Button
                        onClick={() => onCrop()}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                        disabled={isProcessing}
                    >
                        <FiCheck />
                        {isProcessing ? 'Processing...' : 'Save Cropped Image'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isProcessing}
                    >
                        <FiX />
                        Cancel
                    </Button>
                    {showSkipOption && (
                        <Button
                            variant="outline"
                            onClick={onSkipCrop}
                            disabled={isProcessing}
                        >
                            <FiPaperclip />
                            Skip Cropping
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageCropper; 