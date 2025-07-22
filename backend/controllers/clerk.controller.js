const asyncHandler = require('../middleware/async-handler');
const Document = require('../models/document');
const { ApiResponse } = require('../utils/api-response');

exports.getClerkDocuments = asyncHandler(async (req, res) => {
    //take the user id from the request
    const { user } = req;
    const scannerClerkId = user._id;

    //find the documents that are scanned by the scanner clerk
    const documents = await Document.find({ scannerId: scannerClerkId });

    if (!documents || documents.length === 0) {
        const error = new Error('No documents found for this scanner clerk');
        error.statusCode = 404;
        throw error;
    }

    return ApiResponse(res, 200, documents, 'Documents retrieved successfully');
});


exports.scanDocument = asyncHandler(async (req, res) => {
    // get the file and other details from the request
    const file = req.file;
    const { patientMRN, employeeId } = req.body;

    console.log(file);

    if (!file) {
        const error = new Error('No file uploaded');
        error.statusCode = 400;
        throw error;
    }
    const fileName = file.originalname;
    const filePath = `/uploads/documents/${file.filename}`;
    const scannerId = req.user._id;

    const document = await Document.create({
        scannerId,
        patientMRN,
        employeeId,
        fileName,
        filePath,
    });
    ApiResponse(res, 201, document, 'File uploaded successfully');
});

exports.deleteDocument = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        const error = new Error('Document ID is required');
        error.statusCode = 400;
        throw error;
    }

    const documentExists = await Document.findById(id);
    if (!documentExists) {
        const error = new Error('Document not found');
        error.statusCode = 404;
        throw error;
    }

    if (!documentExists.status === 'draft') {
        const error = new Error('You can only delete draft documents');
        error.statusCode = 403;
        throw error;
    }
    const document = await Document.findByIdAndDelete(id);

    if (!document) {
        const error = new Error('Document not found');
        error.statusCode = 404;
        throw error;
    }

    return ApiResponse(res, 200, null, 'Document deleted successfully');
});