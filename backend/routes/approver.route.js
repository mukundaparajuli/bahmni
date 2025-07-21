/**
 * @swagger
 * tags:
 *   - name: Approver
 *     description: Document approval and rejection
 */

/**
 * @swagger
 * /approver/approve/{id}:
 *   post:
 *     summary: Approve a document
 *     tags: [Approver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 document:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Document not found
 */

/**
 * @swagger
 * /approver/reject/{id}:
 *   post:
 *     summary: Reject a document
 *     tags: [Approver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *     responses:
 *       200:
 *         description: Document rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 document:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Document not found
 */
const Router = require("express");
const { restrictTo } = require("../middleware/rbac-handler");
const { authenticateToken } = require("../middleware/auth-middleware");
const { approveDocument, rejectDocument, getScannedDocuments, getAllMyApprovedDocuments, getAllMyRejectedDocuments } = require("../controllers/approver.controller");

const router = Router();

router.post('/approve/:id', authenticateToken, restrictTo('Approver'), approveDocument);
router.post('/reject/:id', authenticateToken, restrictTo('Approver'), rejectDocument);
router.get('/scannedDocs', authenticateToken, restrictTo('Approver'), getScannedDocuments);
router.get('/approvedDocs', authenticateToken, restrictTo('Approver'), getAllMyApprovedDocuments);
router.get('/rejectedDocs', authenticateToken, restrictTo('Approver'), getAllMyRejectedDocuments);

module.exports = router;