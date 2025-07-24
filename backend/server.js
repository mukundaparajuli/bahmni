const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const errorHandler = require('./middleware/error-handler');
const env = require('./config/env');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./config/swagger');
const seedAdmin = require('./seed');
const db = require('./config/db');

dotenv.config();
const app = express();



app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));
app.use('/api/v1/', require('./routes/index'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(errorHandler);
app.use((req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

const startServer = async () => {
    console.log(`Starting server in ${env.nodeEnv} mode...`);
    try {
        // Connect to PostgreSQL via Prisma
        await db.$connect();
        console.log('Connected to PostgreSQL database');

        // Run admin seeding
        await seedAdmin();

        const server = app.listen(env.port, '0.0.0.0', () => {
            console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            console.log('Unhandled Rejection:', err.message);
            server.close(() => process.exit(1));
        });

        // Gracefully disconnect Prisma on server shutdown
        process.on('SIGTERM', async () => {
            console.log('Shutting down server...');
            await db.$disconnect();
            server.close(() => process.exit(0));
        });
    } catch (err) {
        console.error('Startup error:', err);
        await db.$disconnect();
        process.exit(1);
    }
};

startServer();