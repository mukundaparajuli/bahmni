const asyncHandler = require('../middleware/async-handler');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { ApiResponse } = require('../utils/api-response');
const env = require('../config/env');
const db = require('../config/db');
const { sendEmail } = require('../utils/email-service');


// Login
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user by email, including password for comparison
    const user = await db.user.findUnique({
        where: { email, isActive: true },
    });

    // Validate user existence, activity, and password
    if (!user || !user.isActive || !(await bcrypt.compare(password, user.password))) {
        const error = new Error('Invalid credentials or inactive user');
        error.statusCode = 401;
        throw error;
    }

    // Check registration status for self-registered users
    if (user.isSelfRegistered && user.registrationStatus !== 'Approved') {
        const error = new Error('Account pending approval or rejected');
        error.statusCode = 403;
        throw error;
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id }, env.jwtSecret, {
        expiresIn: '1d',
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    ApiResponse(res, 200, { token, user: userWithoutPassword }, 'Login successful');
});

// Request Password Reset
exports.requestPasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Find user by email
    const user = await db.user.findUnique({
        where: { email },
        select: { id: true, email: true, isActive: true },
    });

    if (!user || !user.isActive) {
        const error = new Error('User not found or inactive');
        error.statusCode = 404;
        throw error;
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');

    // Create password reset record
    await db.passwordReset.create({
        data: {
            userId: user.id,
            token,
            expiresAt: new Date(Date.now() + 3600000), // 1 hour
        },
    });

    // Send reset email
    const resetUrl = `${env.frontendUrl}/reset-password/${token}`;
    await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: `
      <h2>Password Reset</h2>
      <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
    });

    ApiResponse(res, 200, null, 'Password reset link sent to email');
});

// Reset Password
exports.resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Find password reset record
    const resetRecord = await db.passwordReset.findFirst({
        where: { token },
    });

    // Validate token and expiration
    if (!resetRecord || resetRecord.expiresAt < new Date()) {
        const error = new Error('Invalid or expired token');
        error.statusCode = 400;
        throw error;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await db.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword },
    });

    // Delete reset record
    await db.passwordReset.delete({
        where: { id: resetRecord.id },
    });

    ApiResponse(res, 200, null, 'Password reset successful');
});