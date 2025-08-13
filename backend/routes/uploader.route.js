const { Router } = require("express");
const { authenticateToken } = require("../middleware/auth-middleware");
const { restrictTo } = require("../middleware/rbac-handler");
const { uploadToBahmni, getAllApprovedDocuments } = require("../controllers/uploader.controller");

const router = Router();

router.post('/upload-to-bahmni', authenticateToken, restrictTo('Uploader'), uploadToBahmni);
router.post('/approved-docs', authenticateToken, restrictTo('Uploader'), getAllApprovedDocuments);

module.exports = router;