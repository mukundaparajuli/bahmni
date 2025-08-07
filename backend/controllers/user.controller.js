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
    const { employeeId, fullName, departmentId, email, educationId, professionId, password, employeeIdPhoto, photo, roles } = req.body;

    const file = req.file;
    if (!file) {
        const error = new Error('Employee ID photo is required');
        error.statusCode = 400;
        throw error;
    }

    const employeeIdPhotoPath = `/uploads/employee-id-photos/${file.filename}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.user.create({
        data: {
            employeeId,
            fullName,
            departmentId: parseInt(departmentId),
            email,
            educationId: parseInt(educationId),
            professionId: parseInt(professionId),
            password: hashedPassword,
            employeeIdPhoto: employeeIdPhotoPath,
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
    const { employeeId, fullName, departmentId, email, educationId, professionId, password, employeeIdPhoto, photo } = req.body;
    const file = req.file;

    if (!file) {
        const error = new Error('Employee ID photo is required');
        error.statusCode = 400;
        throw error;
    }

    const employeeIdPhotoPath = `/uploads/employee-id-photos/${file.filename}`;

    const employeeIdExists = await db.user.findUnique({
        where: { employeeId },
    });

    if (employeeIdExists) {
        const error = new Error('This Employee ID or email is already in use. Please log in or use a different Employee ID or email address');
        error.statusCode = 400;
        throw error;
    }

    const emailExists = await db.user.findUnique({
        where: { email },
    });

    if (emailExists) {
        const error = new Error('This Employee ID or email is already in use. Please log in or use a different Employee ID or email address');
        error.statusCode = 400;
        throw error;
    }
    if (!employeeId || !fullName || !departmentId || !email || !educationId || !professionId || !password) {
        console.log(employeeId, fullName, department, email, education, profession, password);
        const error = new Error("Required fields missing");
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
            departmentId: parseInt(departmentId),
            email,
            educationId: parseInt(educationId),
            professionId: parseInt(professionId),
            password: hashedPassword,
            employeeIdPhoto: employeeIdPhotoPath,
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
        include: {
            department: true,
            education: true,
            profession: true,
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
    const { fullName, email, departmentId, professionId, educationId, employeeId, password } = req.body;

    if (!fullName || !email || !departmentId || !professionId || !educationId || !employeeId) {
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

    // Prepare updates object
    const updates = {
        fullName,
        email,
        departmentId: parseInt(departmentId),
        professionId: parseInt(professionId),
        educationId: parseInt(educationId),
        employeeId
    };

    // Handle password update
    if (password) {
        updates.password = await bcrypt.hash(password, 10);
    }

    // Handle profile photo update
    if (req.files && req.files.photo && req.files.photo[0]) {
        // Delete old photo if it exists
        if (user.photo) {
            const oldPhotoPath = path.join(__dirname, '..', user.photo);
            if (fs.existsSync(oldPhotoPath)) {
                fs.unlink(oldPhotoPath, (err) => {
                    if (err) {
                        console.error('Failed to delete old photo:', err);
                    } else {
                        console.log('Old photo deleted successfully');
                    }
                });
            }
        }
        updates.photo = `/uploads/profile-photos/${req.files.photo[0].filename}`;
    }

    // Handle employee ID photo update
    if (req.files && req.files.employeeIdPhoto && req.files.employeeIdPhoto[0]) {
        // Delete old employeeId photo if it exists
        if (user.employeeIdPhoto) {
            const oldEmployeeIdPhotoPath = path.join(__dirname, '..', user.employeeIdPhoto);
            if (fs.existsSync(oldEmployeeIdPhotoPath)) {
                fs.unlink(oldEmployeeIdPhotoPath, (err) => {
                    if (err) {
                        console.error('Failed to delete old employeeId photo:', err);
                    } else {
                        console.log('Old employeeId photo deleted successfully');
                    }
                });
            }
        }
        updates.employeeIdPhoto = `/uploads/employee-id-photos/${req.files.employeeIdPhoto[0].filename}`;
    }

    // Update user
    const updatedUser = await db.user.update({
        where: { id: parseInt(userId) },
        data: updates,
        select: {
            id: true,
            employeeId: true,
            fullName: true,
            departmentId: true,
            email: true,
            educationId: true,
            professionId: true,
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