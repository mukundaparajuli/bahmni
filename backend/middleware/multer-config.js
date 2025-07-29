const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { compressFile } = require('../utils/compression');

// Configure multer with a dynamic storage folder and compression
const configureMulter = (uploadDir) => {
    // Ensure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Create compressed directory
    const compressedDir = path.join(uploadDir, 'compressed');
    if (!fs.existsSync(compressedDir)) {
        fs.mkdirSync(compressedDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            cb(null, `${uniqueSuffix}-${file.originalname}`);
        },
    });

    const upload = multer({
        storage,
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Only JPEG, PNG images or PDFs are allowed'), false);
            }
        },
        limits: { fileSize: 10 * 1024 * 1024 }, // Increased to 10MB to account for compression
    });

    // Middleware to compress files after upload
    const compressMiddleware = async (req, res, next) => {
        if (!req.file) {
            return next();
        }

        try {
            const originalPath = req.file.path;
            const compressedPath = path.join(compressedDir, req.file.filename);
            
            // Compress the file
            const compressionResult = await compressFile(
                originalPath,
                compressedPath,
                req.file.mimetype,
                {
                    quality: req.file.mimetype.startsWith('image/') ? 80 : undefined,
                    maxWidth: 1920,
                    maxHeight: 1080,
                    imageQuality: 0.7 // For PDFs
                }
            );

            // Update req.file with compressed file info
            req.file.compressedPath = compressedPath;
            req.file.compressionResult = compressionResult;
            req.file.originalSize = compressionResult.originalSize;
            req.file.compressedSize = compressionResult.compressedSize;
            req.file.compressionRatio = compressionResult.compressionRatio;

            // Use compressed file path for further processing
            req.file.path = compressedPath;
            req.file.size = compressionResult.compressedSize;

            console.log(`File compressed: ${req.file.originalname}`);
            console.log(`Original size: ${(compressionResult.originalSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`Compressed size: ${(compressionResult.compressedSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`Compression ratio: ${compressionResult.compressionRatio}`);

            // Optionally delete the original file to save space
            try {
                await fs.promises.unlink(originalPath);
            } catch (deleteError) {
                console.warn('Could not delete original file:', deleteError.message);
            }

            next();
        } catch (error) {
            console.error('Compression middleware error:', error);
            // If compression fails, continue with original file
            next();
        }
    };

    return { upload, compressMiddleware };
};

module.exports = configureMulter;