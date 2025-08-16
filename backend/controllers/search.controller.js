const fs = require("fs").promises;
const path = require("path");
const db = require("../config/db");
const { bahmniService } = require("../services/bahmni.services");
const env = require("../config/env.js");
const { ApiResponse } = require("../utils/api-response.js");
const { get } = require("http");
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
const getMRN = async (req, res, next) => {
    try {
        console.log('getMRN function ');
        const { mrn } = req.query;
        if (!mrn) {
            throw new ApiError(400, "Patient MRN is required");
        }
        const patientMRN = await bahmniService.getPatientMRN(mrn);
        ApiResponse(res, 200, { patientMRN }, 'pateint detail fetched');
    } catch (error) {
        console.log(error);
    }
}
module.exports = getMRN;