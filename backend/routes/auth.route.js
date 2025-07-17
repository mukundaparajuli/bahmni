const { Router } = require("express")
const { login, requestPasswordReset, resetPassword } = require('../controllers/auth.controller');

const router = Router();

router.post('/login', login);
router.post('/password-reset', requestPasswordReset);
router.post('/password-reset/:token', resetPassword);

module.exports = router;