const path = require('path');
const fs = require('fs');
const asyncHandler = require('../middleware/async-handler');
const multer = require('multer');
const { ApiResponse } = require('../utils/api-response');
const { v4: uuidv4 } = require('uuid');
const uploadDir = path.join(__dirname, '..', 'documents');
const Document = require('../models/document');
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
    const fileName = uuidv4();

    const filePath = path.join('documents', fileName);
    const document = await Document.create({
        scannerClerk,
        patientMRN,
        fileName
    });
    const id = document._id;
    ApiResponse(res, 201, {
        id,
        scannerClerk,
        patientMRN,
        filePath,
    }, 'File uploaded successfully');
});