const db = require('../config/db');
const asyncHandler = require('../middleware/async-handler');
const { ApiResponse } = require('../utils/api-response');
const path = require('path');
const fs = require('fs').promises;

exports.getClerkDocuments = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { user } = req;
    const scannerClerkId = user.id;

    // Get total count
    const total = await db.document.count({
        where: { scannerId: scannerClerkId },
    });

    const documents = await db.document.findMany({
        where: { scannerId: scannerClerkId },
        skip,
        take: limit,
        include: {
            scanner: true,
            approver: true,
            uploader: true,
        },
    });

    if (!documents || documents.length === 0) {
        return ApiResponse(res, 404, null, 'No documents found for the clerk');
    }

    return ApiResponse(res, 200, {
        data: documents,
        page,
        total,
        totalPages: Math.ceil(total / limit),
    }, 'Documents retrieved successfully');
});


exports.scanDocument = asyncHandler(async (req, res) => {
    // Get the file and other details from the request
    const file = req.file;
    const { patientMRN, employeeId } = req.body;

    if (!file) {
        const error = new Error('No file uploaded');
        error.statusCode = 400;
        throw error;
    }

    //check if the file from the patient with this mrn number has already been uploaded by other scanner clerk
    const existingDocument = await db.document.findFirst({
        where: {
            patientMRN: patientMRN,
        },
    });

    if (existingDocument && existingDocument.scannerId !== req.user.id) {
        const error = new Error('Document with this patient MRN has already been scanned by another clerk');
        error.statusCode = 400;
        throw error;
    }

    const fileName = file.originalname;
    const filePath = `/uploads/documents/${file.filename}`;
    const scannerId = req.user.id; // Changed from req.user._id to req.user.id

    // Create new document
    const document = await db.document.create({
        data: {
            scannerId,
            patientMRN,
            employeeId,
            fileName,
            filePath,
            status: 'draft', // Default status as per schema
            scannedAt: new Date(), // Explicitly set for clarity
        },
    });

    console.log(document);
    ApiResponse(res, 201, document, 'File uploaded successfully');
});

exports.deleteDocument = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        const error = new Error('Document ID is required');
        error.statusCode = 400;
        throw error;
    }

    // Find document by ID
    const document = await db.document.findUnique({
        where: { id: parseInt(id) }, // Convert string ID to integer
    });

    if (!document) {
        return ApiResponse(res, 404, null, 'Document not found');
    }

    // Check if document is in draft status
    if (document.status !== 'draft') {
        const error = new Error('You can only delete draft documents');
        error.statusCode = 403;
        throw error;
    }

    // Delete document
    await db.document.delete({
        where: { id: parseInt(id) },
    });

    return ApiResponse(res, 200, null, 'Document deleted successfully');
});



// Search for documents by patient MRN 
// can only search for documents that are in draft or submitted status and are scanned by the clerk
exports.getSearchResult = asyncHandler(async (req, res) => {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!query) {
        const error = new Error('Search query is required');
        error.statusCode = 400;
        throw error;
    }

    const whereClause = {
        OR: [
            { patientMRN: { contains: query, mode: 'insensitive' } },
            { fileName: { contains: query, mode: 'insensitive' } },
        ],
        scannerId: req.user.id,
        status: {
            in: ['draft', 'submitted'],
        }
    };

    // Get total count for pagination
    const total = await db.document.count({ where: whereClause });

    const documents = await db.document.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
            scanner: true,
            approver: true,
            uploader: true,
        },
    });

    if (!documents || documents.length === 0) {
        return ApiResponse(res, 404, null, 'No documents found for the given search query');
    }

    return ApiResponse(res, 200, {
        data: documents,
        page,
        total,
        totalPages: Math.ceil(total / limit),
    }, 'Documents retrieved successfully');
});
exports.submitDocument = asyncHandler(async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return ApiResponse(res, 40, null, 'Id not provided for document');
    }
    const updatedDocument = await db.document.update({
        where: { id: parseInt(id) },
        data: {
            status: "submitted",
        },
        include: {
            scanner: true,
            approver: true,
            uploader: true,
        },
    });
    if (!updatedDocument) {
        return ApiResponse(res, 404, null, "Document not found");
    }
    return ApiResponse(res, 200, updatedDocument, "Document submitted successfully");

})

exports.updateDocument = asyncHandler(async (req, res) => {
    const { id, status } = req.body;
    const file = req.file;

    if (!id || !file) {
        const error = new Error('Document ID and file are required');
        error.statusCode = 400;
        throw error;
    }

    const document = await db.document.findUnique({
        where: { id: parseInt(id) },
    });

    if (!document) {
        return ApiResponse(res, 404, null, 'Document not found');
    }
    const oldFilePath = path.join(__dirname, '..', document.filePath);
    console.log(`Deleting old file at: ${oldFilePath}`);
    await fs.unlink(oldFilePath, (err) => {
        if (err) {
            console.error(`Error deleting old file: ${err.message}`);
        } else {
            console.log('Old file deleted successfully');
        }
    });

    const filePath = `/uploads/documents/${file.filename}`;

    const updatedDocument = await db.document.update({
        where: { id: parseInt(id) },
        data: {
            fileName: file.originalname,
            filePath: filePath,
            status: status,
            uploadedAt: new Date(),
        },
        include: {
            scanner: true,
            approver: true,
            uploader: true,
        },
    });
    return ApiResponse(res, 200, updatedDocument, 'Document updated successfully');
});

