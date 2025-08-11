const { Router } = require("express");
const { authenticateToken } = require("../middleware/auth-middleware");
const { restrictTo } = require("../middleware/rbac-handler");
const { getAllDocuments, getAllScanners, getAllApprovers, getAllUploaders } = require("../controllers/admin.controller");

const router = Router();

router.get('/documents', authenticateToken, restrictTo('Admin'), getAllDocuments);
router.get('/scanners', authenticateToken, restrictTo('Admin'), getAllScanners);
router.get('/approvers', authenticateToken, restrictTo('Admin'), getAllApprovers);
router.get('/uploaders', authenticateToken, restrictTo('Admin'), getAllUploaders);

module.exports = router;