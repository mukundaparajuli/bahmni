const { Router } = require("express");
const { authenticateToken } = require("../middleware/auth-middleware");
const { restrictTo } = require("../middleware/rbac-handler");
const { uploadToBahmni, getAllApprovedDocuments, getALlUploadedDocuments } = require("../controllers/uploader.controller");

const router = Router();

router.post('/upload-to-bahmni', authenticateToken, restrictTo('Uploader'), uploadToBahmni);
router.get('/approved-docs', authenticateToken, restrictTo('Uploader'), getAllApprovedDocuments);
router.get('/uploaded-docs', authenticateToken, restrictTo('Uploader'), getALlUploadedDocuments)

module.exports = router;