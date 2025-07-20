const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer with a dynamic storage folder
const configureMulter = (uploadDir) => {
    // Ensure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
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

    return multer({
        storage,
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Only JPEG, PNG images or PDFs are allowed'), false);
            }
        },
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    });
};

module.exports = configureMulter;