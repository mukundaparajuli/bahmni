const db = require("../config/db");
const asyncHandler = require("../middleware/async-handler");
const { ApiResponse } = require("../utils/api-response");

exports.getAllDocuments = asyncHandler(async (req, res) => {
    // Parse query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { status, patientMRN, employeeId, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where = {
        ...(status && { status }),
        ...(patientMRN && { patientMRN: { contains: patientMRN, mode: "insensitive" } }),
        ...(employeeId && { employeeId: { contains: employeeId, mode: "insensitive" } }),
        ...(startDate &&
            endDate && {
            scannedAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
            },
        }),
    };

    // Fetch total count with filters
    const total = await db.document.count({ where });

    // Fetch documents with filters and pagination
    const documents = await db.document.findMany({
        where,
        skip,
        take: limit,
        include: {
            scanner: {
                include: {
                    department: true,
                    education: true,
                    profession: true,
                },
            },
            approver: {
                include: {
                    department: true,
                    education: true,
                    profession: true,
                },
            },
            uploader: {
                include: {
                    department: true,
                    education: true,
                    profession: true,
                },
            },
        },
        orderBy: { scannedAt: "desc" },
    });

    if (!documents || documents.length === 0) {
        return ApiResponse(res, 404, null, "No documents found");
    }

    return ApiResponse(res, 200, {
        data: documents,
        page,
        total,
        totalPages: Math.ceil(total / limit),
    }, "Documents retrieved successfully");
});

exports.getAllScanners = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await db.user.count({
        where: {
            roles: {
                has: 'ScannerClerk'
            }
        }
    });

    const scanners = await db.user.findMany({
        where: {
            roles: {
                has: 'ScannerClerk'
            }
        },
        skip,
        take: limit,
        include: {
            scannedDocuments: true
        }
    })

    if (!scanners || scanners.length === 0) {
        return ApiResponse(res, 404, null, 'No scanners found');
    }

    return ApiResponse(res, 200, {
        data: scanners,
        page,
        total,
        totalPages: Math.ceil(total / limit),
    }, 'Scanners retrieved successfully');
})

exports.getAllApprovers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await db.user.count({
        where: {
            roles: {
                has: 'Approver'
            }
        }
    });

    const approvers = await db.user.findMany({
        where: {
            roles: {
                has: 'Approver'
            }
        },
        skip,
        take: limit,
        include: {
            approvedDocuments: true
        }
    })

    if (!approvers || approvers.length === 0) {
        return ApiResponse(res, 404, null, 'No approvers found');
    }

    return ApiResponse(res, 200, {
        data: approvers,
        page,
        total,
        totalPages: Math.ceil(total / limit),
    }, 'Approvers retrieved successfully');
})

exports.getAllUploaders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await db.user.count({
        where: {
            roles: {
                has: 'Uploader'
            }
        }
    });

    const uploaders = await db.user.findMany({
        where: {
            roles: {
                has: 'Uploader'
            }
        },
        skip,
        take: limit,
        include: {
            uploadedDocuments: true
        }
    })

    if (!uploaders || uploaders.length === 0) {
        return ApiResponse(res, 404, null, 'No uploaders found');
    }

    return ApiResponse(res, 200, {
        data: uploaders,
        page,
        total,
        totalPages: Math.ceil(total / limit),
    }, 'Uploaders retrieved successfully');
})