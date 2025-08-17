const { Role, DocumentStatus } = require("@prisma/client");
const db = require("../config/db");
const asyncHandler = require("../middleware/async-handler");
const { ApiResponse } = require("../utils/api-response");
const { bahmniService } = require("../services/bahmni.services");
const path = require("path");
const env = require("../config/env");
const fs = require("fs").promises;

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

exports.getScannerDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log(req.params)
    if (!id) {
        const error = new Error("Please provide valid id");
        error.status(400);
        throw error;
    }

    const scannerDetails = await db.user.findFirst({
        where: {
            id: +id
        },
        include: {
            department: true,
            profession: true,
            education: true,
            scannedDocuments: true,
        }
    })

    if (!scannerDetails) {
        return ApiResponse(res, 404, null, 'Scanner not found');
    }

    return ApiResponse(res, 200, scannerDetails, 'Scanner details retrieved successfully');
})

exports.getApproverDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        const error = new Error("Please provide valid id");
        error.status(400);
        throw error;
    }

    const approverDetails = await db.user.findFirst({
        where: {
            id: +id
        },
        include: {
            department: true,
            profession: true,
            education: true,
            approvedDocuments: true,
        }
    })

    if (!approverDetails) {
        return ApiResponse(res, 404, null, 'Approver not found');
    }

    return ApiResponse(res, 200, approverDetails, 'Approver details retrieved successfully');
})

exports.getUploaderDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        const error = new Error("Please provide valid id");
        error.status(400);
        throw error;
    }

    const uploaderDetails = await db.user.findFirst({
        where: {
            id: +id
        },
        include: {
            department: true,
            profession: true,
            education: true,
            uploadedDocuments: true,
        }
    })

    if (!uploaderDetails) {
        return ApiResponse(res, 404, null, 'Uploader not found');
    }

    return ApiResponse(res, 200, uploaderDetails, 'Uploader details retrieved successfully');
})

exports.getOverview = asyncHandler(async (req, res) => {
    const [scanners, uploaders, approvers] = await Promise.all([
        db.user.count({ where: { roles: { has: Role.ScannerClerk } } }),
        db.user.count({ where: { roles: { has: Role.Uploader } } }),
        db.user.count({ where: { roles: { has: Role.Approver } } }),
    ]);

    const [totalDocuments, draft, submitted, approved, rejected, uploaded, rescanned, rescannedApproved, rescannedDraft] = await Promise.all([
        db.document.count(),
        db.document.count({ where: { status: DocumentStatus.draft } }),
        db.document.count({ where: { status: DocumentStatus.submitted } }),
        db.document.count({ where: { status: DocumentStatus.approved } }),
        db.document.count({ where: { status: DocumentStatus.rejected } }),
        db.document.count({ where: { status: DocumentStatus.uploaded } }),
        db.document.count({ where: { status: DocumentStatus.rescanned } }),
        db.document.count({ where: { status: DocumentStatus.rescanned_approved } }),
        db.document.count({ where: { status: DocumentStatus.rescanned_draft } }),
    ]);

    // Get recent documents with relations
    const recentDocuments = await db.document.findMany({
        orderBy: { scannedAt: 'desc' },
        take: 5,
        include: {
            scanner: { select: { id: true, fullName: true } },
            approver: { select: { id: true, fullName: true } },
            uploader: { select: { id: true, fullName: true } },
        },
    });

    return ApiResponse(res, 200, {
        stats: {
            users: { scanners, uploaders, approvers },
            documents: {
                total: totalDocuments,
                draft,
                submitted,
                approved,
                rejected,
                uploaded,
                rescanned,
                rescannedApproved,
                rescannedDraft,
            },
        },
        recentDocuments,
    },
        "Overview retrieved successfully")
})

exports.replaceDocumentInBahmni = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { id, mrnNumber } = req.body;

    const file = req.file;

    if (!id) {
        const error = new Error('Document ID is required');
        error.statusCode = 400;
        throw error;
    }

    const document = await db.document.findUnique({
        where: { id: parseInt(id) },
    });

    if (!document) {
        return ApiResponse(res, 404, null, 'Document not found');
    }
    let newFilePath;
    let newFileName = document.fileName;

    if (file) {
        const oldFilePath = path.join(__dirname, '..', document.filePath);
        try {
            await fs.unlink(oldFilePath);
            console.log('Old file deleted successfully');
        } catch (err) {
            console.error(`Error deleting old file: ${err.message}`);
        }
        newFilePath = `/uploads/documents/${file.filename}`;
    }



    // get the bahmni url
    const bahmniUrl = document.bahmniUrl;
    const visitUuid = document.visitUUid;

    if (!bahmniUrl) {
        const error = new Error("Bahmni url not found, document might not have been uploaded");
        error.status(404);
        throw error;
    }


    // Get patient UUID first to ensure patient exists
    const patientUuid = await bahmniService.getPatientUuid(mrnNumber);

    // Prepare other required UUIDs in parallel
    const [providerUuid, locationUuid] = await Promise.all([
        bahmniService.getProviderUuid(),
        bahmniService.getLocationUuidByName(env.bahmni.locationName || "Bahmni Clinic"),
    ]);

    // Get additional UUIDs needed for linking
    const [visitTypeUuid, encounterTypeUuid] = await Promise.all([
        bahmniService.getVisitTypeId(env.bahmni.visitType || "OPD"),
        bahmniService.getEncounterTypeId("Patient Document")
    ]);


    const testUUid = await bahmniService.getTestUuid();
    const { startDatetime, stopDatetime } = await bahmniService.getVisitStartDateAndEndDate(visitUuid);


    // delete that document from the bahmni
    const deletedDoc = await bahmniService.deleteDocument(bahmniUrl);

    await bahmniService.linkDocumentToPatient({
        patientUuid,
        visitTypeUuid,
        visitStartDate: startDatetime,
        encounterTypeUuid,
        encounterDateTime: null,
        providerUuid,
        visitUuid,
        locationUuid,
        documents: [
            {
                testUuid: testUUid,
                image: bahmniUrl,
                obsDateTime: null,
            },
        ],
    });


    // <-------------------------------------uploading to bahmni ---------------------------------------->


    // Read file content
    const baseDir = path.resolve(__dirname, "..");
    const filePath = path.join(baseDir, newFilePath);
    let fileContent;

    // read the file
    try {
        await fs.access(filePath); // Check if file exists
        const stats = await fs.stat(filePath);

        // Check file size (limit to 10MB for safety)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (stats.size > maxSize) {
            throw new Error(`File too large: ${(stats.size / (1024 * 1024)).toFixed(2)}MB. Maximum allowed: 10MB`);
        }

        console.log(`Reading file: ${filePath} (${(stats.size / (1024 * 1024)).toFixed(2)}MB)`);
        fileContent = await fs.readFile(filePath);
    } catch (err) {
        console.error("File read error:", err);
    }




    // // Create visit
    // const visitUuid = await bahmniService.createVisit(
    //     patientUuid,
    //     env.bahmni.visitType || "OPD",
    //     env.bahmni.locationName || "Bahmni Clinic"
    // );

    // Prepare document data
    const fileName = document.fileName || path.basename(filePath);
    const ext = path.extname(filePath).substring(1).toLowerCase();
    const fileType = ext.match(/(jpg|jpeg|png|gif)$/) ? "image" : ext;

    const format = ext;
    const base64Content = fileContent.toString("base64");


    // Upload document to Bahmni
    const uploadResponse = await bahmniService.uploadDocument({
        content: base64Content,
        encounterTypeName: "Patient Document",
        visitUuid,
        format,
        patientUuid,
        fileType,
        fileName
    });

    if (!uploadResponse?.url) {
        throw new Error("Failed to upload document to Bahmni");
    }




    // Link document to patient
    await bahmniService.linkDocumentToPatient({
        patientUuid,
        visitTypeUuid,
        visitStartDate: startDatetime,
        encounterTypeUuid,
        encounterDateTime: null,
        providerUuid,
        visitUuid,
        locationUuid,
        documents: [
            {
                testUuid: testUUid,
                image: uploadResponse.url,
                obsDateTime: null,
            },
        ],
    });

    // Update document status only after everything succeeds
    const updatedDocument = await db.document.update({
        where: { id: +id },
        data: {
            status: "uploaded",
            filePath: newFilePath,
            fileName: newFileName,
            bahmniUrl: uploadResponse.url,
            uploadedAt: new Date(),
        },
    });

    return ApiResponse(res, 200, updatedDocument, "Document was replaced successfully in bahmni")
})