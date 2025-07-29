import imageCompression from 'browser-image-compression';
import { PDFDocument } from 'pdf-lib';

/**
 * Compress an image file on the client side
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - The compressed image file
 */
export const compressImage = async (file, options = {}) => {
    try {
        const {
            maxSizeMB = 1, // Maximum file size in MB
            maxWidthOrHeight = 1920, // Maximum width or height
            useWebWorker = true,
            quality = 0.8, // Image quality (0-1)
            initialQuality = 0.8
        } = options;

        const compressionOptions = {
            maxSizeMB,
            maxWidthOrHeight,
            useWebWorker,
            quality,
            initialQuality,
            alwaysKeepResolution: false,
            exifOrientation: 1, // Preserve orientation
        };

        console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
        
        const compressedFile = await imageCompression(file, compressionOptions);
        
        console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
        console.log('Compression ratio:', (((file.size - compressedFile.size) / file.size) * 100).toFixed(2), '%');
        
        return compressedFile;
    } catch (error) {
        console.error('Image compression failed:', error);
        throw new Error(`Image compression failed: ${error.message}`);
    }
};

/**
 * Compress a PDF file on the client side
 * @param {File} file - The PDF file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - The compressed PDF file
 */
export const compressPDF = async (file, options = {}) => {
    try {
        console.log('Original PDF size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
        
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        // Basic PDF optimization
        const pdfBytes = await pdfDoc.save({
            useObjectStreams: false,
            addDefaultPage: false,
            objectsPerTick: 50,
        });
        
        const compressedFile = new File([pdfBytes], file.name, {
            type: 'application/pdf',
            lastModified: Date.now(),
        });
        
        console.log('Compressed PDF size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
        console.log('PDF compression ratio:', (((file.size - compressedFile.size) / file.size) * 100).toFixed(2), '%');
        
        return compressedFile;
    } catch (error) {
        console.error('PDF compression failed:', error);
        throw new Error(`PDF compression failed: ${error.message}`);
    }
};

/**
 * Compress a file based on its type
 * @param {File} file - The file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - The compressed file or original if not compressible
 */
export const compressFile = async (file, options = {}) => {
    try {
        if (file.type.startsWith('image/')) {
            return await compressImage(file, options);
        } else if (file.type === 'application/pdf') {
            return await compressPDF(file, options);
        }
        
        // For other file types, return as-is
        console.log('File type not supported for compression:', file.type);
        return file;
    } catch (error) {
        console.error('File compression error:', error);
        // If compression fails, return original file
        return file;
    }
};

/**
 * Get file size in a human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate file type and size before compression
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateFile = (file, options = {}) => {
    const {
        maxSize = 10 * 1024 * 1024, // 10MB default
        allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    } = options;

    const errors = [];

    if (file.size > maxSize) {
        errors.push(`File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`);
    }

    if (!allowedTypes.includes(file.type)) {
        errors.push(`File type (${file.type}) is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};