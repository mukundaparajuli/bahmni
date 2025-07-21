const asyncHandler = require('../middleware/async-handler');
const Document = require('../models/document');
const { ApiResponse } = require('../utils/api-response');
const User = require('../models/user');

exports.getClerkDocuments = asyncHandler(async (req, res) => {
    const { scannerClerk } = req.body;
    const clerkId = scannerClerk;
    const clerk = await User.findById(clerkId);
    if (!clerk) {
        return res.status(400).json({ error: "clerk details  not found" });
    }
    const status = clerk.isActive;
    const roles = clerk.roles;
    if (roles.includes("ScannerClerk") || roles.includes("Admin")) {
        const documents = await Document.find({ scannerClerk: clerkId });
        ApiResponse(res, 200, documents, 'these are your documents');
    }
    else {
        ApiResponse(res, 400, "unauthorized", "you are not authorised to upload documents");
    }
})