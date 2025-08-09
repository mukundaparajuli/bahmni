const { Router } = require("express");
const { authenticateToken } = require("../middleware/auth-middleware");
const { checkIfDocUnderProcess, searchPatients } = require("../controllers/openrms.controller");

const router = Router();

router.post('/search-patient', authenticateToken, searchPatients);
router.post('/check-status', authenticateToken, checkIfDocUnderProcess);

module.exports = router;