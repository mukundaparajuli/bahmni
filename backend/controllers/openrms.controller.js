const db = require("../config/db");
const env = require("../config/env");
const asyncHandler = require("../middleware/async-handler");
const { ApiResponse } = require("../utils/api-response");

exports.searchPatients = asyncHandler(async (req, res) => {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: "Query missing" });


    const openrmsSearchPatientUrl = env.openrms.openrmsSearchPatientUrl;
    const auth = {
        username: env.openrms.openrmsUsername,
        password: env.openrms.openrmsPassword
    }
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });


    const response = await axios.get(
        `${openrmsSearchPatientUrl}?q=${encodeURIComponent(q)}`,
        {
            auth,
            httpsAgent
        }
    );

    const patients = response.data.results.map(p => ({
        uuid: p.uuid,
        name: p.display,
        identifiers: p.identifiers,
    }));

    if (!patients.length) {
        const error = new Error("No patient exists for this name or MRN number");
        error.statusCode = 404;
        throw error;
    }

    return new ApiResponse(res, 200, patients, "Patients search results are here");
})

exports.checkIfDocUnderProcess = asyncHandler(async (req, res) => {
    const { mrn } = req.body;

    if (!mrn) {
        const error = new Error("Please provide a mrn number");
        error.statusCode = 400;
        throw error;
    }

    // check if any document exists for the given mrn whose doucment is under process
    const processingDocument = await db.document.findFirst({
        where: {
            patientMRN: mrn,
            status: {
                in: ["draft", "submitted", "approved", "rejected", "rescanned", "rescanned_draft", "rescanned_approved"]
            }
        }
    })

    if (processingDocument) {
        const error = new Error("Document for this patient is already under process");
        error.statusCode = 409;
        throw error;
    }

    //edi kunai document processing ma xaina bhane return the 200 response
    return new ApiResponse(res, 200, null, "You can scan the document for the patient");
})

