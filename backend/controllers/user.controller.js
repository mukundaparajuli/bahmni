const asyncHandler = require('../middleware/async-handler');
const User = require('../models/user');
const { sendEmail } = require('../utils/email-service');
const { ApiResponse } = require('../utils/api-response');

// Admin: Register a user
exports.registerUser = asyncHandler(async (req, res) => {
    const { employeeId, fullName, department, email, education, profession, password, employeeIdPhoto, photo, roles } = req.body;
    const user = await User.create({
        employeeId,
        fullName,
        department,
        email,
        education,
        profession,
        password,
        employeeIdPhoto,
        photo,
        roles: roles || ['ScannerClerk'],
        isActive: true,
        isSelfRegistered: false,
        registrationStatus: 'Approved',
    });
    ApiResponse(res, 201, { ...user.toObject(), password: undefined }, 'User registered successfully');
});

// Self-Registration
exports.selfRegister = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { employeeId, fullName, department, email, education, profession, password, employeeIdPhoto, photo } = req.body;
    const user = await User.create({
        employeeId,
        fullName,
        department,
        email,
        education,
        profession,
        password,
        employeeIdPhoto,
        photo,
        roles: ['ScannerClerk'],
        isActive: false,
        isSelfRegistered: true,
        registrationStatus: 'Pending',
    });
    await sendEmail({
        to: email,
        subject: 'Self-Registration Submitted',
        html: `<p>Your registration is pending admin approval. You'll be notified once reviewed.</p>`,
    });
    ApiResponse(res, 201, null, 'Registration submitted, pending approval');
});

// Admin: Approve/Reject Self-Registration
exports.reviewSelfRegistration = asyncHandler(async (req, res) => {
    const { userId, status, rejectionReason } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
        const error = new Error('Invalid status');
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findById(userId);
    if (!user || !user.isSelfRegistered) {
        const error = new Error('User not found or not self-registered');
        error.statusCode = 404;
        throw error;
    }

    user.registrationStatus = status;
    user.isActive = status === 'Approved';
    user.rejectionReason = status === 'Rejected' ? rejectionReason : null;
    await user.save();

    await sendEmail({
        to: user.email,
        subject: `Registration ${status}`,
        html: status === 'Approved'
            ? `<p>Your registration has been approved. You can now log in.</p>`
            : `<p>Your registration was rejected. Reason: ${rejectionReason}</p>`,
    });

    ApiResponse(res, 200, null, `User registration ${status.toLowerCase()}`);
});

// Admin: Activate/Deactivate User
exports.toggleUserStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { isActive } = req.body;
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    user.isActive = isActive;
    await user.save();

    ApiResponse(res, 200, null, `User ${isActive ? 'activated' : 'deactivated'}`);
});

// Admin: Update User Roles
exports.updateUserRoles = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { roles } = req.body;
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    user.roles = roles;
    await user.save();

    ApiResponse(res, 200, { ...user.toObject(), password: undefined }, 'User roles updated');
});