const asyncHandler = require('../middleware/async-handler');
const Document = require('../models/document');
const { ApiResponse } = require('../utils/api-response');

exports.approveDocument = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const document = await Document.findById(id);
    if (!document) {
        const error = new Error('Document not found');
        error.statusCode = 404;
        throw error;
    }
    if (document.status !== 'draft' && document.status !== 'submitted') {
        const error = new Error('Document already processed');
        error.statusCode = 400;
        throw error;
    }

    document.status = 'approved';
    document.approverId = req.user._id;
    document.reviewedAt = new Date();
    document.filePath = document.filePath;
    document.fileName = document.fileName;
    await document.save();

    return ApiResponse(res, 200, document, "Document was approved successfully")
});

exports.rejectDocument = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rejectComment } = req.body;

    const document = await Document.findById(id);
    if (!document) {
        const error = new Error('Document not found');
        error.statusCode = 404;
        throw error;
    }
    if (document.status !== 'draft' && document.status !== 'submitted') {
        const error = new Error('Document already processed');
        error.statusCode = 400;
        throw error;
    }
    document.approverId = req.user._id;
    document.comment = rejectComment;
    document.status = 'rejected';
    document.approverId = req.user._id;
    document.filePath = document.filePath;
    document.fileName = document.fileName;
    document.reviewedAt = new Date();
    await document.save();

    return ApiResponse(res, 200, document, "Document has been rejected");
});

exports.getScannedDocuments = asyncHandler(async (req, res) => {
    //using draft status here but should be changed to submitted later
    const scannedDocs = await Document.find({ status: 'draft' });
    if (!scannedDocs || scannedDocs.length === 0) {
        const error = new Error('No scanned documents found');
        error.statusCode = 404;
        throw error;
    }
    return ApiResponse(res, 200, scannedDocs, 'Scanned documents retrieved successfully');
});

exports.getAllMyApprovedDocuments = asyncHandler(async (req, res) => {
    const { user } = req;
    const approvedDocs = await Document.find({ approverId: user._id, status: 'approved' });
    if (!approvedDocs || approvedDocs.length === 0) {
        const error = new Error('No approved documents found');
        error.statusCode = 404;
        throw error;
    }
    return ApiResponse(res, 200, approvedDocs, 'Approved documents retrieved successfully');
});

exports.getAllMyRejectedDocuments = asyncHandler(async (req, res) => {
    const { user } = req;
    const rejectedDocs = await Document.find({ approverId: user._id, status: 'rejected' });
    if (!rejectedDocs || rejectedDocs.length === 0) {
        const error = new Error('No rejected documents found');
        error.statusCode = 404;
        throw error;
    }
    return ApiResponse(res, 200, rejectedDocs, 'Rejected documents retrieved successfully');
});