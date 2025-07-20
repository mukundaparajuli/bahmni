require('dotenv').config();

module.exports = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    frontendUrl: process.env.FRONTEND_URL,
    backendUrl: process.env.BACKEND_URL,

    //resend configs
    email: {
        resendApiKey: process.env.RESEND_API_KEY,
        emailFrom: process.env.EMAIL_FROM,
    }
};