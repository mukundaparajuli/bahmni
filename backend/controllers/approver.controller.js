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
    if (document.status !== 'pending') {
        const error = new Error('Document already processed');
        error.statusCode = 400;
        throw error;
    }

    document.status = 'approved';
    document.reviewerId = req.user._id;
    document.reviewedAt = new Date();
    await document.save();

    return ApiResponse(res, 200, document, "Document was approved successfully")
});

exports.rejectDocument = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;

    const document = await Document.findById(id);
    if (!document) {
        const error = new Error('Document not found');
        error.statusCode = 404;
        throw error;
    }
    if (document.status !== 'pending') {
        const error = new Error('Document already processed');
        error.statusCode = 400;
        throw error;
    }
    document.comment = comment;
    document.status = 'rejected';
    document.reviewerId = req.user._id;
    document.reviewedAt = new Date();
    await document.save();

    return ApiResponse(res, 200, document, "Document has been rejected");
});
