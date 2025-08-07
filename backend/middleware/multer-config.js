const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer with dynamic folder based on fieldname
const configureMulter = () => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            let uploadDir;

            if (file.fieldname === 'photo') {
                uploadDir = path.join(__dirname, '..', 'uploads', 'profile-photos');
            } else if (file.fieldname === 'employeeIdPhoto') {
                uploadDir = path.join(__dirname, '..', 'uploads', 'employee-id-photos');
            } else if (file.fieldname === 'file') {
                uploadDir = path.join(__dirname, '..', 'uploads', 'documents');
            } else {
                return cb(new Error('Invalid field name for upload'), null);
            }

            fs.mkdirSync(uploadDir, { recursive: true });

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
        limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    });
};

module.exports = configureMulter;
