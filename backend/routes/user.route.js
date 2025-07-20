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

router.post('/register', authenticateToken, restrictTo('Admin'), registerUser);
router.post('/self-register', selfRegister);
router.post('/review-registration', authenticateToken, restrictTo('Admin'), reviewSelfRegistration);
router.put('/status/:userId', authenticateToken, restrictTo('Admin'), toggleUserStatus);
router.put('/roles/:userId', authenticateToken, restrictTo('Admin'), updateUserRoles);
router.get('/', authenticateToken, getUsers);
router.put('/:userId', authenticateToken, upload.single('photo'), updateUser);

module.exports = router;