const { Router } = require('express');
const router = Router();
const {
    registerUser,
    selfRegister,
    reviewSelfRegistration,
    toggleUserStatus,
    updateUserRoles,
} = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth-middleware');
const { restrictTo } = require('../middleware/rbac-handler');

router.post('/register', authenticateToken, restrictTo('Admin'), registerUser);
router.post('/self-register', selfRegister);
router.post('/review-registration', authenticateToken, restrictTo('Admin'), reviewSelfRegistration);
router.put('/status/:userId', authenticateToken, restrictTo('Admin'), toggleUserStatus);
router.put('/roles/:userId', authenticateToken, restrictTo('Admin'), updateUserRoles);

module.exports = router;