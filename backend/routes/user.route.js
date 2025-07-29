const { Router } = require('express');
const path = require("path")
const configureMulter = require("../middleware/multer-config");
const router = Router();
const {
    registerUser,
    selfRegister,
    reviewSelfRegistration,
    toggleUserStatus,
    updateUserRoles,
    getUsers,
    updateUser,
} = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth-middleware');
const { restrictTo } = require('../middleware/rbac-handler');

const uploadDir = path.join(__dirname, '..', 'uploads', 'profile-photos');
const upload = configureMulter(uploadDir);


/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and registration
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - fullName
 *               - department
 *               - email
 *               - education
 *               - profession
 *               - password
 *             properties:
 *               employeeId:
 *                 type: string
 *               fullName:
 *                 type: string
 *               department:
 *                 type: string
 *               email:
 *                 type: string
 *               education:
 *                 type: string
 *               profession:
 *                 type: string
 *               password:
 *                 type: string
 *               employeeIdPhoto:
 *                 type: string
 *               photo:
 *                 type: string
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 employeeId:
 *                   type: string
 *                 fullName:
 *                   type: string
 *                 department:
 *                   type: string
 *                 email:
 *                   type: string
 *                 education:
 *                   type: string
 *                 profession:
 *                   type: string
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: string
 *                 isActive:
 *                   type: boolean
 *                 isSelfRegistered:
 *                   type: boolean
 *                 registrationStatus:
 *                   type: string
 *                 rejectionReason:
 *                   type: string
 *                 photo:
 *                   type: string
 *                 employeeIdPhoto:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users/self-register:
 *   post:
 *     summary: Self-register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - fullName
 *               - department
 *               - email
 *               - education
 *               - profession
 *               - password
 *             properties:
 *               employeeId:
 *                 type: string
 *               fullName:
 *                 type: string
 *               department:
 *                 type: string
 *               email:
 *                 type: string
 *               education:
 *                 type: string
 *               profession:
 *                 type: string
 *               password:
 *                 type: string
 *               employeeIdPhoto:
 *                 type: string
 *               photo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration request submitted
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /users/review-registration:
 *   post:
 *     summary: Review a self-registration request (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - status
 *             properties:
 *               userId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Approved, Rejected]
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registration reviewed
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users/status/{userId}:
 *   put:
 *     summary: Toggle user status (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users/roles/{userId}:
 *   put:
 *     summary: Update user roles (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roles
 *             properties:
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Admin, ScannerClerk, Approver, Uploader]
 *     responses:
 *       200:
 *         description: User roles updated
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       employeeId:
 *                         type: string
 *                       fullName:
 *                         type: string
 *                       department:
 *                         type: string
 *                       email:
 *                         type: string
 *                       education:
 *                         type: string
 *                       profession:
 *                         type: string
 *                       roles:
 *                         type: array
 *                         items:
 *                           type: string
 *                       isActive:
 *                         type: boolean
 *                       isSelfRegistered:
 *                         type: boolean
 *                       registrationStatus:
 *                         type: string
 *                       rejectionReason:
 *                         type: string
 *                       photo:
 *                         type: string
 *                       employeeIdPhoto:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     summary: Update user profile (with optional photo upload)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               department:
 *                 type: string
 *               employeeId:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       401:
 *         description: Unauthorized
 */

// ...existing code...
router.post('/register', authenticateToken, restrictTo('Admin'), registerUser);
router.post('/self-register', selfRegister);
router.post('/review-registration', authenticateToken, restrictTo('Admin'), reviewSelfRegistration);
router.put('/status/:userId', authenticateToken, restrictTo('Admin'), toggleUserStatus);
router.put('/roles/:userId', authenticateToken, restrictTo('Admin'), updateUserRoles);
router.get('/', authenticateToken, getUsers);
router.put('/:userId', authenticateToken, upload.single('photo'), updateUser);

module.exports = router;