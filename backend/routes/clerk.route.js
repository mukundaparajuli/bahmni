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
const Router = require('express');
const router = Router();
const { getClerkDocuments } = require('../controllers/clerk.document');
router.post('/clerkDocs', getClerkDocuments);
module.exports = router;