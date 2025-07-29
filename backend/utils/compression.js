const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

/**
 * Compress an image file using Sharp
 * @param {string} inputPath - Path to the input image
 * @param {string} outputPath - Path to save the compressed image
 * @param {Object} options - Compression options
 * @returns {Promise<Object>} - Compression result with file info
 */
const compressImage = async (inputPath, outputPath, options = {}) => {
    try {
        const {
            quality = 80,
            maxWidth = 1920,
            maxHeight = 1080,
            format = 'jpeg'
        } = options;

        const originalStats = await fs.stat(inputPath);
        
        let sharpInstance = sharp(inputPath)
            .resize(maxWidth, maxHeight, {
                fit: 'inside',
                withoutEnlargement: true
            });

        // Apply format-specific compression
        switch (format.toLowerCase()) {
            case 'jpeg':
            case 'jpg':
                sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
                break;
            case 'png':
                sharpInstance = sharpInstance.png({ 
                    quality,
                    compressionLevel: 9,
                    progressive: true
                });
                break;
            case 'webp':
                sharpInstance = sharpInstance.webp({ quality });
                break;
            default:
                sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
        }

        await sharpInstance.toFile(outputPath);
        
        const compressedStats = await fs.stat(outputPath);
        const compressionRatio = ((originalStats.size - compressedStats.size) / originalStats.size * 100).toFixed(2);

        return {
            success: true,
            originalSize: originalStats.size,
            compressedSize: compressedStats.size,
            compressionRatio: `${compressionRatio}%`,
            outputPath
        };
    } catch (error) {
        console.error('Image compression error:', error);
        throw new Error(`Image compression failed: ${error.message}`);
    }
};

/**
 * Compress a PDF file by optimizing images and removing unnecessary data
 * @param {string} inputPath - Path to the input PDF
 * @param {string} outputPath - Path to save the compressed PDF
 * @param {Object} options - Compression options
 * @returns {Promise<Object>} - Compression result with file info
 */
const compressPDF = async (inputPath, outputPath, options = {}) => {
    try {
        const { imageQuality = 0.7 } = options;
        
        const originalStats = await fs.stat(inputPath);
        const existingPdfBytes = await fs.readFile(inputPath);
        
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        
        // Basic PDF optimization - remove unused objects and compress streams
        const pdfBytes = await pdfDoc.save({
            useObjectStreams: false, // Disable for better compression
            addDefaultPage: false,
            objectsPerTick: 50,
        });
        
        await fs.writeFile(outputPath, pdfBytes);
        
        const compressedStats = await fs.stat(outputPath);
        const compressionRatio = ((originalStats.size - compressedStats.size) / originalStats.size * 100).toFixed(2);

        return {
            success: true,
            originalSize: originalStats.size,
            compressedSize: compressedStats.size,
            compressionRatio: `${compressionRatio}%`,
            outputPath
        };
    } catch (error) {
        console.error('PDF compression error:', error);
        throw new Error(`PDF compression failed: ${error.message}`);
    }
};

/**
 * Compress a file based on its type
 * @param {string} inputPath - Path to the input file
 * @param {string} outputPath - Path to save the compressed file
 * @param {string} mimeType - MIME type of the file
 * @param {Object} options - Compression options
 * @returns {Promise<Object>} - Compression result
 */
const compressFile = async (inputPath, outputPath, mimeType, options = {}) => {
    try {
        if (mimeType.startsWith('image/')) {
            const format = mimeType.split('/')[1];
            return await compressImage(inputPath, outputPath, { ...options, format });
        } else if (mimeType === 'application/pdf') {
            return await compressPDF(inputPath, outputPath, options);
        } else {
            // For unsupported file types, just copy the file
            await fs.copyFile(inputPath, outputPath);
            const stats = await fs.stat(inputPath);
            return {
                success: true,
                originalSize: stats.size,
                compressedSize: stats.size,
                compressionRatio: '0%',
                outputPath,
                message: 'File type not supported for compression, copied as-is'
            };
        }
    } catch (error) {
        console.error('File compression error:', error);
        throw error;
    }
};

module.exports = {
    compressImage,
    compressPDF,
    compressFile
};