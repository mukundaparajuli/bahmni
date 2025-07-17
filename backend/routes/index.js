const { Router } = require('express');
const authRoutes = require("../routes/auth.route");
const userRoutes = require("../routes/user.route");

const router = Router();

router.use('/auth', authRoutes)
router.use('/user', userRoutes)

module.exports = router;