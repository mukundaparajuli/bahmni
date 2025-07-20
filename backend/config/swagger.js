const swaggerJsdoc = require('swagger-jsdoc');
const env = require('../config/env');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Bahmni API',
            version: '1.0.0',
            description: 'Bahmni API with Swagger documentation',
        },
        servers: [
            {
                url: `${env.backendUrl}/api/v1` || 'http://localhost:5000/api/v1',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./routes/*.js'],

};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

module.exports = swaggerDocs;