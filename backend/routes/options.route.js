const Router = require('express');
const {
    // Education controllers
    getEducations,
    getAllEducations,
    createEducation,
    updateEducation,
    deleteEducation,

    // Profession controllers
    getProfessions,
    getAllProfessions,
    createProfession,
    updateProfession,
    deleteProfession,

    // Department controllers
    getDepartments,
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require('../controllers/options.controller');

const { authenticateToken } = require('../middleware/auth-middleware');
const { restrictTo } = require('../middleware/rbac-handler');

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Options
 *     description: Management of dropdown options (Education, Profession, Department)
 */

// =============== EDUCATION ROUTES ===============

/**
 * @swagger
 * /options/educations:
 *   get:
 *     summary: Get all active education options
 *     tags: [Options]
 *     responses:
 *       200:
 *         description: List of active education options
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 */
router.get('/educations', getEducations);

/**
 * @swagger
 * /options/educations/all:
 *   get:
 *     summary: Get all education options (including inactive) - Admin only
 *     tags: [Options]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all education options with user count
 */
router.get('/educations/all', restrictTo('Admin'), getAllEducations);

/**
 * @swagger
 * /options/educations:
 *   post:
 *     summary: Create new education option - Admin only
 *     tags: [Options]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Education option created successfully
 */
router.post('/educations', authenticateToken, restrictTo('Admin'), createEducation);

/**
 * @swagger
 * /options/educations/{id}:
 *   put:
 *     summary: Update education option - Admin only
 *     tags: [Options]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Education option updated successfully
 */
router.put('/educations/:id', authenticateToken, restrictTo('Admin'), updateEducation);

/**
 * @swagger
 * /options/educations/{id}:
 *   delete:
 *     summary: Delete education option - Admin only
 *     tags: [Options]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Education option deleted successfully
 *       400:
 *         description: Cannot delete - option is in use
 */
router.delete('/educations/:id', authenticateToken, restrictTo('Admin'), deleteEducation);

// =============== PROFESSION ROUTES ===============

/**
 * @swagger
 * /options/professions:
 *   get:
 *     summary: Get all active profession options
 *     tags: [Options]
 *     responses:
 *       200:
 *         description: List of active profession options
 */
router.get('/professions', getProfessions);

router.get('/professions/all', authenticateToken, restrictTo('Admin'), getAllProfessions);
router.post('/professions', authenticateToken, restrictTo('Admin'), createProfession);
router.put('/professions/:id', authenticateToken, restrictTo('Admin'), updateProfession);
router.delete('/professions/:id', authenticateToken, restrictTo('Admin'), deleteProfession);

// =============== DEPARTMENT ROUTES ===============

/**
 * @swagger
 * /options/departments:
 *   get:
 *     summary: Get all active department options
 *     tags: [Options]
 *     responses:
 *       200:
 *         description: List of active department options
 */
router.get('/departments', getDepartments);

router.get('/departments/all', authenticateToken, restrictTo('Admin'), getAllDepartments);
router.post('/departments', authenticateToken, restrictTo('Admin'), createDepartment);
router.put('/departments/:id', authenticateToken, restrictTo('Admin'), updateDepartment);
router.delete('/departments/:id', authenticateToken, restrictTo('Admin'), deleteDepartment);

module.exports = router;