import React from 'react';
import { useLocation } from 'react-router-dom';
import { useRescan } from '@/hooks/useRescan';
import FormInputs from './scanner/FormInputs';
import ActionButtons from './scanner/ActionButtons';
import StatusIndicators from './scanner/StatusIndicators';
import WebcamView from './scanner/WebcamView';
import ImageCropper from './scanner/ImageCropper';
import ImageGallery from './scanner/ImageGallery';
import PdfUploader from './scanner/PdfUploader';
import DeviceInfo from './scanner/DeviceInfo';

const Rescan = () => {
    const { state } = useLocation();

    if (!state) return <p>No document data provided.</p>;

    const {
        // State
        image,
        capturedImages,
        file,
        pdfName,
        pdfSize,
        showWebcam,
        showCropper,
        currentCapturedImage,
        isProcessing,
        facingMode,
        deviceId,
        availableDevices,
        webcamReady,
        webcamError,
        cameraSettings,
        isMobile,
        id,
        fileName,
        status,

        // Refs
        webcamRef,
        cropperRef,
        capturedCropperRef,

        // Functions
        setShowWebcam,
        getVideoConstraints,
        handleUserMedia,
        handleUserMediaError,
        handleCapture,
        handleCropCapturedImage,
        handleFileChange,
        uploadCroppedImage,
        uploadPdf,
        generateAndUploadPdf,
        switchCamera,
        toggleFlash,
        focusCamera,
        clearCapturedImages,
        deleteCapturedImage,
        closeWebcam,
        retryCamera,
        selectDevice,

        // Utility
        MAX_IMAGES,
    } = useRescan(state);

    // Helper function to determine upload status based on current status
    const getUploadStatus = (isDraft = false) => {
        if (status === 'rejected') {
            return isDraft ? 'rescanned_draft' : 'rescanned';
        }
        return isDraft ? 'draft' : 'submitted';
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Rescan or Resubmit Document</h1>
                    {isMobile && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Mobile Optimized
                        </span>
                    )}
                </div>

                {/* Document Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Document ID: {id}</p>
                    <p className="text-sm text-gray-600 mb-1">File: {fileName}</p>
                    <p className="text-sm text-gray-600">Status: <span className="capitalize">{status}</span></p>
                </div>

                <StatusIndicators
                    cameraSettings={cameraSettings}
                    webcamError={webcamError}
                    isProcessing={isProcessing}
                    isMobile={isMobile}
                    onRetryCamera={retryCamera}
                />

                <ActionButtons
                    showWebcam={showWebcam}
                    isProcessing={isProcessing}
                    onFileChange={handleFileChange}
                    onToggleWebcam={() => setShowWebcam(!showWebcam)}
                />

                <WebcamView
                    showWebcam={showWebcam}
                    webcamRef={webcamRef}
                    webcamReady={webcamReady}
                    webcamError={webcamError}
                    isProcessing={isProcessing}
                    cameraSettings={cameraSettings}
                    availableDevices={availableDevices}
                    facingMode={facingMode}
                    getVideoConstraints={getVideoConstraints}
                    handleUserMedia={handleUserMedia}
                    handleUserMediaError={handleUserMediaError}
                    handleCapture={handleCapture}
                    onToggleFlash={toggleFlash}
                    onFocusCamera={focusCamera}
                    onSwitchCamera={switchCamera}
                    onCloseWebcam={closeWebcam}
                />

                {/* Image Cropper for captured images */}
                {showCropper && currentCapturedImage && (
                    <ImageCropper
                        image={currentCapturedImage}
                        cropperRef={capturedCropperRef}
                        isProcessing={isProcessing}
                        onCrop={handleCropCapturedImage}
                        onCancel={() => {
                            setShowCropper(false);
                            setCurrentCapturedImage(null);
                        }}
                        onSkipCrop={() => {
                            // Add the image without cropping
                            const updated = [...capturedImages, currentCapturedImage];
                            setCapturedImages(updated);
                            setShowCropper(false);
                            setCurrentCapturedImage(null);
                        }}
                        title="✂️ Crop Your Document"
                        showSkipOption={true}
                    />
                )}

                {/* Captured Images Gallery */}
                {capturedImages.length > 0 && (
                    <ImageGallery
                        capturedImages={capturedImages}
                        isProcessing={isProcessing}
                        onClearAll={clearCapturedImages}
                        onDeleteImage={deleteCapturedImage}
                        onGeneratePdf={(isDraft) => generateAndUploadPdf(getUploadStatus(isDraft))}
                        showDraftOption={true}
                    />
                )}

                {/* Uploaded Image Cropper */}
                {image && (
                    <ImageCropper
                        image={image}
                        cropperRef={cropperRef}
                        isProcessing={isProcessing}
                        onCrop={(isDraft) => uploadCroppedImage(getUploadStatus(isDraft))}
                        onCancel={() => setImage(null)}
                        title="✂️ Crop Uploaded Image"
                        showSkipOption={false}
                        showDraftOption={true}
                    />
                )}

                {/* PDF Upload */}
                <PdfUploader
                    pdfFile={file}
                    pdfName={pdfName}
                    pdfSize={pdfSize}
                    isProcessing={isProcessing}
                    onUploadPdf={(isDraft) => uploadPdf(getUploadStatus(isDraft))}
                    showDraftOption={true}
                />

                {/* Device Information and Tips */}
                <DeviceInfo
                    isMobile={isMobile}
                    availableDevices={availableDevices}
                    cameraSettings={cameraSettings}
                    deviceId={deviceId}
                    onDeviceSelect={selectDevice}
                />
            </div>
        </div>
    );
};

export default Rescan;