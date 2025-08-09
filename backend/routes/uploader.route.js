const { Router } = require("express");
const { authenticateToken } = require("../middleware/auth-middleware");
const { restrictTo } = require("../middleware/rbac-handler");
const { uploadToBahmni, getAllApprovedDocuments } = require("../controllers/uploader.controller");

const router = Router();

router.post('/upload-to-bahmni', authenticateToken, restrictTo('uploader'), uploadToBahmni);
router.post('/approved-docs', authenticateToken, restrictTo('uploader'), getAllApprovedDocuments);

module.exports = router;