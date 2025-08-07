const Router = require('express');
const { getClerkDocuments, scanDocument, deleteDocument, getSearchResult, updateDocument, submitDocument, getRejectedDocuments } = require('../controllers/clerk.controller');
const { authenticateToken } = require('../middleware/auth-middleware');
const { restrictTo } = require('../middleware/rbac-handler');
const configureMulter = require('../middleware/multer-config');
const path = require('path');

const router = Router();
/**
 * @swagger
 * tags:
 *   - name: Clerk
 *     description: Clerk document operations
 */

/**
 * @swagger
 * /clerk/clerkDocs:
 *   post:
 *     summary: Get documents for clerk
 *     tags: [Clerk]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filter:
 *                 type: object
 *                 description: Optional filter criteria
 *     responses:
 *       200:
 *         description: List of documents for the clerk
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid input
 */

const upload = configureMulter();

router.get('/clerkDocs', authenticateToken, restrictTo('ScannerClerk'), getClerkDocuments);
router.get('/deleteDoc/:id', authenticateToken, restrictTo('ScannerClerk'), deleteDocument);
router.post('/uploadDoc', authenticateToken, upload.single('file'), scanDocument);
router.post('/updateDoc', authenticateToken, upload.single('file'), restrictTo('ScannerClerk'), updateDocument);
router.get('/search', authenticateToken, restrictTo('Approver'), getSearchResult);
router.post('/updateStatus', authenticateToken, restrictTo('ScannerClerk'), submitDocument);
router.get('/rejectedDocs', authenticateToken, restrictTo('ScannerClerk'), getRejectedDocuments);

module.exports = router;