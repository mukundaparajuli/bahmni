const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middleware/error-handler');
const env = require('./config/env');
const path = require('path')

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/', routes);

app.use(errorHandler);

const server = app.listen(env.port, () => {
    console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
});

process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection:', err.message);
    server.close(() => process.exit(1));
});