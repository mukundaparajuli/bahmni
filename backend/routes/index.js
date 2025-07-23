const { Router } = require('express');
const authRoutes = require("../routes/auth.route");
const userRoutes = require("../routes/user.route");
const clerkRoutes = require("../routes/clerk.route");
const approverRoutes = require("../routes/approver.route");

const router = Router();
router.use('/clerk', clerkRoutes);
router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/approver', approverRoutes)

module.exports = router;