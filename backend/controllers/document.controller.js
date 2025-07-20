const asyncHandler = require('../middleware/async-handler');
const Document = require('../models/document');
const { ApiResponse } = require('../utils/api-response');
const { v4: uuidv4 } = require('uuid');
const path = require("path");
const document = require('../models/document');


exports.uploadDocument = asyncHandler(async (req, res) => {
    const file = req.file;
    const { scannerClerk, patientMRN, employeeId } = req.body;
    console.log(scannerClerk, patientMRN, employeeId);
    console.log(file);

    if (!file) {
        return ApiResponse(res, 400, null, 'No file uploaded');
    }
    const fileName = uuidv4();

    const filePath = path.join('documents', fileName);
    const document = await Document.create({
        scannerClerk,
        patientMRN,
        fileName,
        employeeId
    });
    const id = document._id;
    ApiResponse(res, 201, {
        id,
        scannerClerk,
        patientMRN,
        filePath,
    }, 'File uploaded successfully');
});

exports.getAllMyScannedDocs = asyncHandler(async (req, res) => {
    const { user } = req;
    const scannedDocs = await document.find({ scannerClerk: user._id });
    if (!scannedDocs || scannedDocs.length === 0) {
        const error = new Error('No scanned documents found');
        error.statusCode = 404;
        throw error;
    }
    return ApiResponse(res, 200, scannedDocs, 'Scanned documents retrieved successfully');
})