const path = require('path');
const fs = require('fs');
const asyncHandler = require('../middleware/async-handler');
const multer = require('multer');
const { ApiResponse } = require('../utils/api-response');
// Create 'documents' folder if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'documents');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const sanitized = file.originalname.replace(/\s+/g, '_');
        cb(null, `${timestamp}-${sanitized}`);
    }
});

const upload = multer({ storage });

exports.upload = upload; // Export this for route middleware

// Upload document handler
exports.uploadDocument = asyncHandler(async (req, res) => {
    const file = req.file;
    const { scannerClerk, patientMRN } = req.body;

    if (!file) {
        return ApiResponse(res, 400, null, 'No file uploaded');
    }

    const filePath = path.join('documents', file.filename);

    // Save to DB if needed here

    ApiResponse(res, 201, {
        scannerClerk,
        patientMRN,
        filePath,
    }, 'File uploaded successfully');
});