const fs = require("fs");
const path = require("path");
const axios = require("axios");
const https = require("https");
const db = require("../config/db");
const env = require("../config/env");
const asyncHandler = require("../middleware/async-handler");
const { ApiResponse } = require("../utils/api-response");

exports.uploadToBahmni = asyncHandler(async (req, res) => {
    const { documentId } = req.body;

    if (!documentId) {
        const error = new Error("Document ID is required");
        error.statusCode = 400;
        throw error;
    }

    const document = await db.document.findUnique({ where: { id: documentId } });
    if (!document) {
        const error = new Error("Document not found");
        error.statusCode = 404;
        throw error;
    }

    if (document.status !== "approved") {
        const error = new Error("Only approved documents can be uploaded to Bahmni");
        error.statusCode = 400;
        throw error;
    }

    const filePath = path.resolve(document.filePath);
    if (!fs.existsSync(filePath)) {
        const error = new Error("Document file not found on server");
        error.statusCode = 404;
        throw error;
    }

    const formData = new FormData();
    formData.append("patient", document.patientUUID);
    formData.append("fileCaption", `Document uploaded for MRN ${document.patientMRN}`);
    formData.append("file", fs.createReadStream(filePath));

    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    try {
        const response = await axios.post(
            `${env.openrms.openrmsBaseUrl}/ws/rest/v1/attachment`,
            formData,
            {
                auth: {
                    username: env.openrms.openrmsUsername,
                    password: env.openrms.openrmsPassword
                },
                httpsAgent,
                headers: formData.getHeaders()
            }
        );

        await db.document.update({
            where: { id: documentId },
            data: { status: "uploaded" }
        });

        return new ApiResponse(res, 200, response.data, "Document successfully uploaded to Bahmni");
    } catch (err) {
        console.error("Error uploading to Bahmni:", err.message);
        const error = new Error("Failed to upload document to Bahmni");
        error.statusCode = 500;
        throw error;
    }
});

exports.getAllApprovedDocuments = asyncHandler(async (req, res) => {
    const approvedDocuments = await db.document.findMany({
        where: {
            status: {
                OR: [
                    "approved",
                    "rescanned_approved"
                ]
            }
        }
    });

    if (!approvedDocuments) {
        const error = new Error("No approved documents were found");
        error.statusCode = 404;
        throw error;
    }

    return new ApiResponse(res, 200, approvedDocuments, "All the approved documents are here");
})