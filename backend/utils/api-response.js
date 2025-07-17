const ApiResponse = (res, statusCode, data, message = 'Success') => {
    res.status(statusCode).json({
        success: statusCode >= 200 && statusCode < 300,
        message,
        data,
    });
};

module.exports = { ApiResponse };