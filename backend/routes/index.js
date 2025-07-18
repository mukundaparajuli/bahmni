const { Router } = require('express');
const authRoutes = require("../routes/auth.route");
const userRoutes = require("../routes/user.route");
const docRoutes = require("../routes/document.route")
const router = Router();

router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/doc', docRoutes)
module.exports = router;