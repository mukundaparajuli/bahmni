import React from 'react';
import { useScanner } from '@/hooks/useScanner';
import FormInputs from './scanner/FormInputs';
import ActionButtons from './scanner/ActionButtons';
import StatusIndicators from './scanner/StatusIndicators';
import WebcamView from './scanner/WebcamView';
import ImageCropper from './scanner/ImageCropper';
import ImageGallery from './scanner/ImageGallery';
import PdfUploader from './scanner/PdfUploader';
import DeviceInfo from './scanner/DeviceInfo';

const UniversalDocumentScanner = () => {
    const {
        // State
        image,
        capturedImages,
        pdfFile,
        pdfName,
        pdfSize,
        mrn,
        fileName,
        showWebcam,
        showCropper,
        currentCapturedImage,
        isProcessing,
        webcamReady,
        webcamError,
        cameraSettings,
        availableDevices,
        facingMode,
        deviceId,
        isMobile,

        // Refs
        webcamRef,
        cropperRef,
        capturedCropperRef,

        // Functions
        setMrn,
        setFileName,
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
        MAX_IMAGES
    } = useScanner();

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Document Scanner</h1>
                    {isMobile && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Mobile Optimized
                        </span>
                    )}
                </div>

                <StatusIndicators
                    cameraSettings={cameraSettings}
                    webcamError={webcamError}
                    isProcessing={isProcessing}
                    isMobile={isMobile}
                    onRetryCamera={retryCamera}
                />

                <FormInputs
                    mrn={mrn}
                    fileName={fileName}
                    isProcessing={isProcessing}
                    onMrnChange={(e) => setMrn(e.target.value)}
                    onFileNameChange={(e) => setFileName(e.target.value)}
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
                        onGeneratePdf={generateAndUploadPdf}
                    />
                )}

                {/* Uploaded Image Cropper */}
                {image && (
                    <ImageCropper
                        image={image}
                        cropperRef={cropperRef}
                        isProcessing={isProcessing}
                        onCrop={uploadCroppedImage}
                        onCancel={() => setImage(null)}
                        title="✂️ Crop Uploaded Image"
                        showSkipOption={false}
                    />
                )}

                {/* PDF Upload */}
                <PdfUploader
                    pdfFile={pdfFile}
                    pdfName={pdfName}
                    pdfSize={pdfSize}
                    isProcessing={isProcessing}
                    onUploadPdf={uploadPdf}
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

export default UniversalDocumentScanner;