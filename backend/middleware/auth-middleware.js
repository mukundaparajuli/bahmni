const jwt = require('jsonwebtoken');
const User = require('../models/user');
const asyncHandler = require('./async-handler');
const env = require('../config/env');

const authenticateToken = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null;

    if (!token) {
        const error = new Error('Not authorized, no token');
        error.statusCode = 401;
        throw error;
    }


    try {
        const decoded = jwt.verify(token, env.jwtSecret);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user || !req.user.isActive) {
            const error = new Error('User not found or inactive');
            error.statusCode = 401;
            throw error;
        }
        next();
    } catch (error) {
        error.statusCode = 401;
        throw error;
    }
});

module.exports = { authenticateToken };