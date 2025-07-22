const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error-handler');
const env = require('./config/env');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./config/swagger');
const seedAdmin = require('./seed');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/v1/', require('./routes/index'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(errorHandler);

const startServer = async () => {
    try {
        await connectDB();       // ✅ Mongoose connects once
        await seedAdmin();       // ✅ Use the same connection
        const server = app.listen(env.port, () => {
            console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
        });

        process.on('unhandledRejection', (err) => {
            console.log('Unhandled Rejection:', err.message);
            server.close(() => process.exit(1));
        });

    } catch (err) {
        console.error("Startup error:", err);
        process.exit(1);
    }
};

startServer();
