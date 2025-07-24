const jwt = require('jsonwebtoken');
const asyncHandler = require('./async-handler');
const env = require('../config/env');
const db = require('../config/db');

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
        const user = await db.user.findUnique({
            where: { id: parseInt(decoded.id) },
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

        if (!user || !user.isActive) {
            const error = new Error('User not found or inactive');
            error.statusCode = 401;
            throw error;
        }

        req.user = user;
        next();
    } catch (error) {
        error.statusCode = 401;
        throw error;
    }
});

module.exports = { authenticateToken };