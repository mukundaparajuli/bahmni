const fs = require("fs").promises;
const path = require("path");
const db = require("../config/db");
const { bahmniService } = require("../services/bahmni.services");
const env = require("../config/env.js");

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

        // Get document from database
        const document = await db.document.findUnique({
            where: { id: +documentId },
        });

        if (!document) {
            throw new ApiError(404, "Document not found");
        }

        if (document.status !== "approved") {
            throw new ApiError(400, "Only approved documents can be uploaded");
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
        const fileType = document.fileType || "PATIENT_DOCUMENT";
        // Get file extension without dot (e.g., "pdf" instead of "application/pdf")
        const format = path.extname(filePath).substring(1).toLowerCase() || "pdf";
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

        // Link document to patient
        await bahmniService.linkDocumentToPatient({
            patientUuid,
            visitTypeUuid,
            visitStartDate: new Date().toISOString(),
            encounterTypeUuid,
            encounterDateTime: null,
            providerUuid,
            visitUuid,
            locationUuid,
            documents: [
                {
                    testUuid: testUUid,
                    image: uploadResponse.url,
                    obsDateTime: new Date().toISOString(),
                },
            ],
        });

        // Update document status only after everything succeeds
        await db.document.update({
            where: { id: +documentId },
            data: {
                status: "uploaded_to_bahmni",
                bahmniUrl: uploadResponse.url,
                uploadedAt: new Date(),
            },
        });

        return res.status(200).json({
            success: true,
            data: {
                bahmniUrl: uploadResponse.url,
                documentId: +documentId,
                patientUuid,
                visitUuid,
            },
            message: "Document successfully uploaded to Bahmni",
        });

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
        const approvedDocuments = await db.document.findMany({
            where: {
                status: {
                    in: ["approved", "rescanned_approved"],
                },
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Return empty array instead of 404 for better UX
        return res.status(200).json({
            success: true,
            data: approvedDocuments,
            message: approvedDocuments.length > 0
                ? "Retrieved all approved documents"
                : "No approved documents found",
        });

    } catch (error) {
        console.error("Error retrieving approved documents:", error);

        // Convert to ApiError for consistency
        const apiError = new ApiError(500, "Failed to retrieve approved documents");
        next(apiError);
    }
};

module.exports = {
    uploadToBahmni,
    getAllApprovedDocuments,
};