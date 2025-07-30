import { PDFDocument } from 'pdf-lib';
import imageCompression from 'browser-image-compression';

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateFile = (file, options = {}) => {
    const { maxSize = 30 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'] } = options;
    const errors = [];
    if (file.size > maxSize) {
        errors.push(`File size (${formatFileSize(file.size)}) exceeds maximum (${formatFileSize(maxSize)})`);
    }
    if (!allowedTypes.includes(file.type)) {
        errors.push(`File type (${file.type}) is not allowed. Allowed: ${allowedTypes.join(', ')}`);
    }
    return { isValid: errors.length === 0, errors };
};

export const compressImage = async (file, options = {}) => {
    try {
        const {
            maxSizeMB = 3,
            maxWidthOrHeight = 1280,
            useWebWorker = true,
            quality = 1.0,
            initialQuality = 1.0,
        } = options;

        console.log('Original image size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
        const compressedFile = await imageCompression(file, {
            maxSizeMB,
            maxWidthOrHeight,
            useWebWorker,
            quality,
            initialQuality,
            alwaysKeepResolution: true,
        });
        console.log('Compressed image size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
        console.log('Compression ratio:', (((file.size - compressedFile.size) / file.size) * 100).toFixed(2), '%');
        return compressedFile;
    } catch (error) {
        console.error('Image compression failed:', error);
        throw new Error(`Image compression failed: ${error.message}`);
    }
};

export const compressPDF = async (file, options = {}) => {
    try {
        console.log('Original PDF size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pdfBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            updateMetadata: false,
        });

        const compressedFile = new File([pdfBytes], file.name, {
            type: 'application/pdf',
            lastModified: Date.now(),
        });

        console.log('Compressed PDF size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
        console.log(
            'PDF compression ratio:',
            (((file.size - compressedFile.size) / file.size) * 100).toFixed(2),
            '%',
        );

        if (file.size - compressedFile.size < file.size * 0.05) {
            console.warn('Minimal compression achieved. Consider server-side processing.');
        }

        return compressedFile;
    } catch (error) {
        console.error('PDF compression failed:', error);
        throw new Error(`PDF compression failed: ${error.message}`);
    }
};

export const compressFile = async (file, options = {}) => {
    try {
        const validation = validateFile(file, options);
        if (!validation.isValid) {
            console.error('File validation failed:', validation.errors);
            return file;
        }

        if (file.type.startsWith('image/')) {
            return await compressImage(file, options);
        } else if (file.type === 'application/pdf') {
            console.warn('Client-side PDF compression limited. Consider server-side processing.');
            return await compressPDF(file, options);
        }

        console.log('File type not supported for compression:', file.type);
        return file;
    } catch (error) {
        console.error('File compression error:', error);
        return file;
    }
};