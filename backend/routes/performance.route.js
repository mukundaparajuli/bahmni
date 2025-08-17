const Router = require('express');
const { authenticateToken } = require('../middleware/auth-middleware');
const { restrictTo } = require('../middleware/rbac-handler');
const { getPerformanceSummaries, exportPerformanceSummaries } = require('../controllers/performance.controller');

const router = Router();

router.get('/', authenticateToken, restrictTo('Admin'), getPerformanceSummaries);
router.get('/export', authenticateToken, restrictTo('Admin'), exportPerformanceSummaries);

module.exports = router;