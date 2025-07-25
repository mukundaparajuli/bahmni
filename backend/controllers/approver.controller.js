const db = require('../config/db');
const asyncHandler = require('../middleware/async-handler');
const { ApiResponse } = require('../utils/api-response');

exports.approveDocument = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const document = await db.document.findUnique({
        where: { id: parseInt(id) },
    });

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

    const updatedDocument = await db.document.update({
        where: { id: parseInt(id) },
        data: {
            status: 'approved',
            approverId: req.user.id,
            reviewedAt: new Date(),
            filePath: document.filePath,
            fileName: document.fileName,
        },
        include: {
            scanner: true,
            approver: true,
            uploader: true,
        },
    });

    if (!updatedDocument) {
        const error = new Error('Failed to approve document');
        error.statusCode = 500;
        throw error;
    }

    return ApiResponse(res, 200, updatedDocument, 'Document was approved successfully');
});

exports.rejectDocument = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rejectComment } = req.body;

    if (!rejectComment) {
        const error = new Error('Rejection comment is required');
        error.statusCode = 400;
        throw error;
    }

    const document = await db.document.findUnique({
        where: { id: parseInt(id) },
    });

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

    const updatedDocument = await db.document.update({
        where: { id: parseInt(id) },
        data: {
            status: 'rejected',
            approverId: req.user.id,
            comment: rejectComment,
            reviewedAt: new Date(),
            filePath: document.filePath,
            fileName: document.fileName,
        },
        include: {
            scanner: true,
            approver: true,
            uploader: true,
        },
    });

    return ApiResponse(res, 200, updatedDocument, 'Document has been rejected');
});

exports.getScannedDocuments = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Count total matching documents
    const total = await db.document.count({
        where: {
            status: {
                in: ['submitted'],
            }
        },
    });

    const scannedDocs = await db.document.findMany({
        where: {
            status: {
                in: ['submitted'],
            }
        },
        skip,
        take: limit,
        orderBy: { scannedAt: 'desc' },
        include: {
            scanner: true,
            approver: true,
            uploader: true,
        },
    });

    return ApiResponse(res, 200, {
        data: scannedDocs,
        page,
        total,
        totalPages: Math.ceil(total / limit),
    }, 'Scanned documents retrieved successfully');
});

exports.getAllMyApprovedDocuments = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await db.document.count({
        where: { approverId: userId, status: 'approved' },
    });

    const approvedDocs = await db.document.findMany({
        where: { approverId: userId, status: 'approved' },
        skip,
        take: limit,
        orderBy: { reviewedAt: 'desc' },
        include: {
            scanner: true,
            approver: true,
            uploader: true,
        },
    });

    if (!approvedDocs.length) {
        return ApiResponse(res, 404, null, 'No approved documents found');
    }

    return ApiResponse(res, 200, {
        data: approvedDocs,
        page,
        total,
        totalPages: Math.ceil(total / limit),
    }, 'Approved documents retrieved successfully');
});

exports.getAllMyRejectedDocuments = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await db.document.count({
        where: { approverId: userId, status: 'rejected' },
    });

    const rejectedDocs = await db.document.findMany({
        where: { approverId: userId, status: 'rejected' },
        skip,
        take: limit,
        orderBy: { reviewedAt: 'desc' },
        include: {
            scanner: true,
            approver: true,
            uploader: true,
        },
    });

    if (!rejectedDocs.length) {
        return ApiResponse(res, 404, null, 'No rejected documents found');
    }

    return ApiResponse(res, 200, {
        data: rejectedDocs,
        page,
        total,
        totalPages: Math.ceil(total / limit),
    }, 'Rejected documents retrieved successfully');
});

exports.getSearchedDocuments = asyncHandler(async (req, res) => {
    const searchTerm = req.query.query || req.query.searchTerm;
    if (!searchTerm) {
        const error = new Error('Search term is required');
        error.statusCode = 400;
        throw error;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const whereClause = {
        OR: [
            { patientMRN: { contains: searchTerm, mode: 'insensitive' } },
            { employeeId: { contains: searchTerm, mode: 'insensitive' } },
            { fileName: { contains: searchTerm, mode: 'insensitive' } },
        ],
    };

    const total = await db.document.count({ where: whereClause });

    const documents = await db.document.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { scannedAt: 'desc' },
        include: {
            scanner: true,
            approver: true,
            uploader: true,
        },
    });

    if (!documents.length) {
        return ApiResponse(res, 404, null, 'No documents found for the given search query');
    }

    return ApiResponse(res, 200, {
        data: documents,
        page,
        total,
        totalPages: Math.ceil(total / limit),
    }, 'Documents retrieved successfully');
});
