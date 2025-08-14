require('dotenv').config();

module.exports = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5555,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    frontendUrl: process.env.FRONTEND_URL,
    backendUrl: process.env.BACKEND_URL,

    //mail configs
    email: {
        emailFrom: process.env.EMAIL_FROM,
        emailFromName: process.env.EMAIL_FROM_NAME,
        gmailUser: process.env.GMAIL_USER,
        gmailAppPassword: process.env.GMAIL_APP_PASSWORD,
    },

    bahmni: {
        // Authentication
        baseUrl: process.env.BAHMNI_BASE_URL.replace(/\/$/, ''),
        bahmniUsername: process.env.BAHMNI_USERNAME,
        bahmniPassword: process.env.BAHMNI_PASSWORD,

        // API Endpoints (relative paths)
        endpoints: {
            uploadDoc: '/ws/rest/v1/bahmnicore/visitDocument/uploadDocument',
            linkDoc: '/ws/rest/v1/bahmnicore/visitDocument',
            provider: '/ws/rest/v1/session',
            searchPatient: '/ws/rest/v1/patient',
            visit: '/ws/rest/v1/visit',
            visitTypes: '/ws/rest/v1/bahmnicore/config/bahmniencounter',
            verifyDetails: 'ws/rest/v1/bahmnicore/visitDocument'
        },

        // Defaults
        defaultLocationUuid: process.env.BAHMNI_DEFAULT_LOCATION_UUID,
        defaultVisitType: 'OPD',
        defaultEncounterType: 'Patient Document',

        // API Behavior
        timeout: parseInt(process.env.BAHMNI_API_TIMEOUT || '10000', 10),
        retryAttempts: parseInt(process.env.BAHMNI_RETRY_ATTEMPTS || '3', 10),
        retryDelay: parseInt(process.env.BAHMNI_RETRY_DELAY || '1000', 10)
    },
};