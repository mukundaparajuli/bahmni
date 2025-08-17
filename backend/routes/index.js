const { Router } = require('express');
const authRoutes = require("../routes/auth.route");
const userRoutes = require("../routes/user.route");
const clerkRoutes = require("../routes/clerk.route");
const approverRoutes = require("../routes/approver.route");
const optionsRoutes = require("../routes/options.route");
const adminRoutes = require("../routes/admin.route")
const uploaderRoutes = require("../routes/uploader.route");

const router = Router();
router.use('/clerk', clerkRoutes);
router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/approver', approverRoutes)
router.use('/options', optionsRoutes)
router.use('/admin', adminRoutes)
router.use('/uploader', uploaderRoutes);
router.use('/performance', require('../routes/performance.route'));
module.exports = router;