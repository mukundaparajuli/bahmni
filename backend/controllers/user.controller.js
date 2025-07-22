const asyncHandler = require('../middleware/async-handler');
const User = require('../models/user');
const { sendEmail } = require('../utils/email-service');
const { ApiResponse } = require('../utils/api-response');
const path = require("path")
const fs = require("fs")
const bcrypt = require("bcrypt")
// Admin: Register a user
exports.registerUser = asyncHandler(async (req, res) => {
    console.log(req.body);
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
    // await sendEmail({
    //     to: email,
    //     subject: 'Self-Registration Submitted',
    //     html: `<p>Your registration is pending admin approval. You'll be notified once reviewed.</p>`,
    // });
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

    // await sendEmail({
    //     to: user.email,
    //     subject: `Registration ${status}`,
    //     html: status === 'Approved'
    //         ? `<p>Your registration has been approved. You can now log in.</p>`
    //         : `<p>Your registration was rejected. Reason: ${rejectionReason}</p>`,
    // });

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

exports.getUsers = asyncHandler(async (req, res) => {
    const users = await User.find();
    if (!users) {
        const error = new Error('No users found');
        error.statusCode = 404;
        throw error;
    }

    return ApiResponse(res, 200, { users }, 'All users are here');
})

exports.updateUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { fullName, email, department, employeeId, password } = req.body;
    if (!fullName || !email || !department || !employeeId) {
        return res.status(400).json({ message: 'Required fields missing' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete old photo if it exists
    if (user.photo && req.file) {
        const oldPhotoPath = path.join(__dirname, '..', user.photo);
        if (fs.existsSync(oldPhotoPath)) {
            fs.unlink(oldPhotoPath, (err) => {
                if (err) {
                    console.error('Failed to delete file:', err);
                } else {
                    console.log('Old photo deleted successfully');
                }
            });
        }
    }

    const updates = { fullName, email, department, employeeId };
    if (password) updates.password = bcrypt.hashSync(password, 10);
    if (req.file) updates.photo = `/uploads/profile-photos/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
    return ApiResponse(res, 200, updatedUser, "User updated successfully")
});