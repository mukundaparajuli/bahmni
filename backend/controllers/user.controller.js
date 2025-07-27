const asyncHandler = require('../middleware/async-handler');
const { PrismaClient } = require('@prisma/client');
const { ApiResponse } = require('../utils/api-response');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const { sendEmail } = require('../utils/email-service');

const prisma = new PrismaClient();

// Admin: Register a user
exports.registerUser = asyncHandler(async (req, res) => {
    const { employeeId, fullName, department, email, education, profession, password, employeeIdPhoto, photo, roles } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.user.create({
        data: {
            employeeId,
            fullName,
            department,
            email,
            education,
            profession,
            password: hashedPassword,
            employeeIdPhoto,
            photo,
            roles: roles || ['ScannerClerk'],
            isActive: true,
            isSelfRegistered: false,
            registrationStatus: 'Approved',
        },
        select: {
            id: true,
            employeeId: true,
            fullName: true,
            department: true,
            email: true,
            education: true,
            profession: true,
            employeeIdPhoto: true,
            photo: true,
            roles: true,
            isActive: true,
            isSelfRegistered: true,
            registrationStatus: true,
            rejectionReason: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    ApiResponse(res, 201, user, 'User registered successfully');
});

// Self-Registration
exports.selfRegister = asyncHandler(async (req, res) => {
    const { employeeId, fullName, department, email, education, profession, password, employeeIdPhoto, photo } = req.body;


    const employeeIdExists = await db.user.findUnique({
        where: { employeeId },
    });

    if (employeeIdExists) {
        const error = new Error('Employee ID already exists');
        error.statusCode = 400;
        throw error;
    }

    const emailExists = await db.user.findUnique({
        where: { email },
    });

    if (emailExists) {
        const error = new Error('Email already exists');
        error.statusCode = 400;
        throw error;
    }
    if (!employeeId || !fullName || !department || !email || !education || !profession || !password) {
        const error = new Error('Required fields missing');
        error.statusCode = 400;
        throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.user.create({
        data: {
            employeeId,
            fullName,
            department,
            email,
            education,
            profession,
            password: hashedPassword,
            employeeIdPhoto,
            photo,
            isActive: false,
            isSelfRegistered: true,
        },
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

    console.log('Reviewing self-registration for user:', userId, 'with status:', status);
    if (!['Approved', 'Rejected'].includes(status)) {
        const error = new Error('Invalid status');
        error.statusCode = 400;
        throw error;
    }

    // Find user
    const user = await db.user.findUnique({
        where: { id: parseInt(userId) },
    });

    if (!user || !user.isSelfRegistered) {
        const error = new Error('User not found or not self-registered');
        error.statusCode = 404;
        throw error;
    }

    // Update user
    await db.user.update({
        where: { id: parseInt(userId) },
        data: {
            registrationStatus: status,
            isActive: status === 'Approved',
            rejectionReason: status === 'Rejected' ? rejectionReason : null,
        },
    });

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

    if (!userId || typeof isActive !== 'boolean') {
        const error = new Error('Invalid request data');
        error.statusCode = 400;
        throw error;
    }

    // Find user
    const user = await db.user.findUnique({
        where: { id: parseInt(userId) },
    });

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    // Update user status
    await db.user.update({
        where: { id: parseInt(userId) },
        data: { isActive },
    });

    ApiResponse(res, 200, null, `User ${isActive ? 'activated' : 'deactivated'}`);
});

// Admin: Update User Roles
exports.updateUserRoles = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { roles } = req.body;

    // Find user
    const user = await db.user.findUnique({
        where: { id: parseInt(userId) },
        select: {
            id: true,
            employeeId: true,
            fullName: true,
            department: true,
            email: true,
            education: true,
            profession: true,
            employeeIdPhoto: true,
            photo: true,
            roles: true,
            isActive: true,
            isSelfRegistered: true,
            registrationStatus: true,
            rejectionReason: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throwHorizontalAlignmentError;
    }

    // Update roles
    const updatedUser = await db.user.update({
        where: { id: parseInt(userId) },
        data: { roles },
        select: {
            id: true,
            employeeId: true,
            fullName: true,
            department: true,
            email: true,
            education: true,
            profession: true,
            employeeIdPhoto: true,
            photo: true,
            roles: true,
            isActive: true,
            isSelfRegistered: true,
            registrationStatus: true,
            rejectionReason: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    ApiResponse(res, 200, updatedUser, 'User roles updated');
});

// Get All Users
exports.getUsers = asyncHandler(async (req, res) => {
    const users = await db.user.findMany({
        select: {
            id: true,
            employeeId: true,
            fullName: true,
            department: true,
            email: true,
            education: true,
            profession: true,
            employeeIdPhoto: true,
            photo: true,
            roles: true,
            isActive: true,
            isSelfRegistered: true,
            registrationStatus: true,
            rejectionReason: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!users || users.length === 0) {
        const error = new Error('No users found');
        error.statusCode = 404;
        throw error;
    }

    return ApiResponse(res, 200, { users }, 'All users are here');
});

// Update User
exports.updateUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { fullName, email, department, employeeId, password } = req.body;

    if (!fullName || !email || !department || !employeeId) {
        const error = new Error('Required fields missing');
        error.statusCode = 400;
        throw error;
    }

    // check if email already exists
    const emailExists = await db.user.findUnique({
        where: { email },
    });
    if (emailExists && emailExists.id !== parseInt(userId)) {
        const error = new Error('Email already exists');
        error.statusCode = 400;
        throw error;
    }

    // check if employeeId already exists
    const employeeIdExists = await db.user.findUnique({
        where: {
            employeeId
        },
    });
    if (employeeIdExists && employeeIdExists.id !== parseInt(userId)) {
        const error = new Error('Employee ID already exists');
        error.statusCode = 400;
        throw error;
    }

    // Find user
    const user = await db.user.findUnique({
        where: { id: parseInt(userId) },
    });

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    // Delete old photo if it exists and a new file is uploaded
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

    // Prepare updates
    const updates = { fullName, email, department, employeeId };
    if (password) updates.password = await bcrypt.hash(password, 10);
    if (req.file) updates.photo = `/uploads/profile-photos/${req.file.filename}`;

    // Update user
    const updatedUser = await db.user.update({
        where: { id: parseInt(userId) },
        data: updates,
        select: {
            id: true,
            employeeId: true,
            fullName: true,
            department: true,
            email: true,
            education: true,
            profession: true,
            employeeIdPhoto: true,
            photo: true,
            roles: true,
            isActive: true,
            isSelfRegistered: true,
            registrationStatus: true,
            rejectionReason: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return ApiResponse(res, 200, updatedUser, 'User updated successfully');
});