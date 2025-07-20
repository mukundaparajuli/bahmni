/**
 * @swagger
 * tags:
 *   - name: Document
 *     description: Document upload and retrieval
 */

/**
 * @swagger
 * /document/uploadDocument:
 *   post:
 *     summary: Upload a document
 *     tags: [Document]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Document file to upload
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 document:
 *                   type: object
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

const Router = require("express");
const { uploadDocument, getAllMyScannedDocs } = require('../controllers/document.controller');
const path = require("path");
const configureMulter = require("../middleware/multer-config");
const uploadDir = path.join(__dirname, '..', 'uploads', 'documents');
const upload = configureMulter(uploadDir);
const { authenticateToken } = require('../middleware/auth-middleware');

const router = Router();
router.post('/uploadDocument', authenticateToken, upload.single('file'), uploadDocument);


module.exports = router;
