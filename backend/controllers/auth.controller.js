const asyncHandler = require('../middleware/async-handler');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const PasswordReset = require('../models/reset-password');
const { sendEmail } = require('../utils/email-service');
const { ApiResponse } = require('../utils/api-response');
const env = require('../config/env');

// Login
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    console.log(user)
    if (!user || !user.isActive || !(await user.comparePassword(password))) {
        const error = new Error('Invalid credentials or inactive user');
        error.statusCode = 401;
        throw error;
    }
    if (user.isSelfRegistered && user.registrationStatus !== 'Approved') {
        const error = new Error('Account pending approval or rejected');
        error.statusCode = 403;
        throw error;
    }

    const token = jwt.sign({ id: user._id }, env.jwtSecret, {
        expiresIn: '1d',
    });
    ApiResponse(res, 200, { token, user: { ...user.toObject(), password: undefined } }, 'Login successful');
});

// Request Password Reset
exports.requestPasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
        const error = new Error('User not found or inactive');
        error.statusCode = 404;
        throw error;
    }

    const token = crypto.randomBytes(32).toString('hex');
    await PasswordReset.create({
        userId: user._id,
        token,
        expiresAt: Date.now() + 3600000, // 1 hour
    });

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
    const resetRecord = await PasswordReset.findOne({ token });
    console.log(resetRecord);
    if (!resetRecord || resetRecord.expiresAt < Date.now()) {
        console.log(resetRecord)
        console.log(Date.now())
        const error = new Error('Invalid or expired token');
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findById(resetRecord.userId).select('+password');
    user.password = newPassword;
    await user.save();
    await PasswordReset.deleteOne({ token });

    ApiResponse(res, 200, null, 'Password reset successful');
});