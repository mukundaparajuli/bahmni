const asyncHandler = require('../middleware/async-handler');
const Document = require('../models/document');
const { ApiResponse } = require('../utils/api-response');
const { v4: uuidv4 } = require('uuid');
const path = require("path")


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