const asyncHandler = require('./async-handler');

const restrictTo = (...roles) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user.roles.some((role) => roles.includes(role))) {
            console.log(req.user.roles, roles);
            const error = new Error('Not authorized to access this route');
            error.statusCode = 403;
            throw error;
        }
        next();
    });
};

module.exports = { restrictTo };