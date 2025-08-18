const fs = require("fs").promises;
const path = require("path");
const db = require("../config/db");
const { bahmniService } = require("../services/bahmni.services");
const env = require("../config/env.js");
const { ApiResponse } = require("../utils/api-response.js");

class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

const uploadToBahmni = async (req, res, next) => {
    try {
        const { documentId, mrnNumber } = req.body;

        // Validate input
        if (!documentId || !mrnNumber) {
            throw new ApiError(400, "Document ID and MRN number are required");
        }
        console.log(documentId);
        // Get document from database
        const document = await db.document.findUnique({
            where: { id: +documentId },
        });

        if (!document) {
            throw new ApiError(404, "Document not found");
        }

        if (document.status !== "approved" && document.status !== "uploaded") {
            throw new ApiError(400, "Only approved or uploaded documents can be uploaded");
        }

        // Read file content
        const baseDir = path.resolve(__dirname, "..");
        const filePath = path.join(baseDir, document.filePath);
        let fileContent;

        try {
            await fs.access(filePath); // Check if file exists
            const stats = await fs.stat(filePath);

            // Check file size (limit to 10MB for safety)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (stats.size > maxSize) {
                throw new ApiError(400, `File too large: ${(stats.size / (1024 * 1024)).toFixed(2)}MB. Maximum allowed: 10MB`);
            }

            console.log(`Reading file: ${filePath} (${(stats.size / (1024 * 1024)).toFixed(2)}MB)`);
            fileContent = await fs.readFile(filePath);
        } catch (err) {
            console.error("File read error:", err);
            if (err instanceof ApiError) throw err;
            throw new ApiError(404, "Document file not found on server");
        }

        // Get patient UUID first to ensure patient exists
        const patientUuid = await bahmniService.getPatientUuid(mrnNumber);

        // Prepare other required UUIDs in parallel
        const [providerUuid, locationUuid] = await Promise.all([
            bahmniService.getProviderUuid(),
            bahmniService.getLocationUuidByName(env.bahmni.locationName || "Bahmni Clinic"),
        ]);

        // Create visit
        const visitUuid = await bahmniService.createVisit(
            patientUuid,
            env.bahmni.visitType || "OPD",
            env.bahmni.locationName || "Bahmni Clinic"
        );

        // Prepare document data
        const fileName = document.fileName || path.basename(filePath);
        const ext = path.extname(filePath).substring(1).toLowerCase();
        const fileType = ext.match(/(jpg|jpeg|png|gif)$/) ? "image" : ext;

        // Get file extension without dot (e.g., "pdf" instead of "application/pdf")
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
            throw new ApiError(500, "Failed to upload document to Bahmni");
        }

        // Get additional UUIDs needed for linking
        const [visitTypeUuid, encounterTypeUuid] = await Promise.all([
            bahmniService.getVisitTypeId(env.bahmni.visitType || "OPD"),
            bahmniService.getEncounterTypeId("Patient Document")
        ]);

        const testUUid = await bahmniService.getTestUuid();
        const now = new Date().toISOString();
        const { startDatetime, stopDatetime } = await bahmniService.getVisitStartDateAndEndDate(visitUuid);

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
        await db.document.update({
            where: { id: +documentId },
            data: {
                status: "uploaded",
                visitUUid: visitUuid,
                bahmniUrl: uploadResponse.url,
                uploaderId: req.user.id,
                uploadedAt: new Date(),
            },
        });

        return ApiResponse(res, 200, {
            bahmniUrl: uploadResponse.url,
            documentId: +documentId,
            patientUuid,
            visitUuid
        }, "Document uploaded to bahmni successfully")



    } catch (error) {
        console.error("Bahmni upload error:", error);

        // Convert non-ApiError instances to ApiError for consistency
        if (!(error instanceof ApiError)) {
            const statusCode = error.statusCode || 500;
            const message = error.message || "Internal server error";
            error = new ApiError(statusCode, message);
        }

        next(error);
    }
};

const getAllApprovedDocuments = async (req, res, next) => {
    try {


        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count
        const total = await db.document.count({
            where: {
                status: {
                    in: ["approved", "rescanned_approved"],
                },
            },
        });


        const approvedDocuments = await db.document.findMany({
            where: {
                status: {
                    in: ["approved", "rescanned_approved"],
                },
            },
            skip,
            take: limit,
            orderBy: {
                scannedAt: 'desc'
            }
        });

        console.log(approvedDocuments)

        // Return empty array instead of 404 for better UX
        return ApiResponse(res, 200, {
            data: approvedDocuments,
            page,
            total,
            totalPages: Math.ceil(total / limit),
        },
            approvedDocuments.length > 0
                ? "Retrieved all approved documents"
                : "No approved documents found",
        );

    } catch (error) {
        console.error("Error retrieving approved documents:", error);
        const apiError = new ApiError(500, "Failed to retrieve approved documents");
        next(apiError);
    }
};

module.exports = {
    uploadToBahmni,
    getAllApprovedDocuments,
};