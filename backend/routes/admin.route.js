const { Router } = require("express");
const { authenticateToken } = require("../middleware/auth-middleware");
const { restrictTo } = require("../middleware/rbac-handler");
const { getAllDocuments, getAllScanners, getAllApprovers, getAllUploaders, getScannerDetails, getApproverDetails, getUploaderDetails, getOverview, replaceDocumentInBahmni } = require("../controllers/admin.controller");
const configureMulter = require("../middleware/multer-config");

const router = Router();

const upload = configureMulter();

router.get('/documents', authenticateToken, restrictTo('Admin'), getAllDocuments);
router.get('/scanners', authenticateToken, restrictTo('Admin'), getAllScanners);
router.get('/approvers', authenticateToken, restrictTo('Admin'), getAllApprovers);
router.get('/uploaders', authenticateToken, restrictTo('Admin'), getAllUploaders);
router.get('/scanner/:id', authenticateToken, restrictTo('Admin'), getScannerDetails);
router.get('/approver/:id', authenticateToken, restrictTo('Admin'), getApproverDetails);
router.get('/uploader/:id', authenticateToken, restrictTo('Admin'), getUploaderDetails);
router.get('/overview', authenticateToken, restrictTo('Admin'), getOverview);
router.post('/replace', authenticateToken, upload.single('file'), restrictTo('Admin'), replaceDocumentInBahmni);

module.exports = router;