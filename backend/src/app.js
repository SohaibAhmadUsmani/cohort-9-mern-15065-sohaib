require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pinoHttp } = require('pino-http');
const rateLimit = require('express-rate-limit');
const logger = require('./config/logger');

if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL) {
    throw new Error('CLIENT_URL environment variable is required in production');
}

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(pinoHttp({ logger }));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: { message: "Too many requests from this IP, please try again later" }
});
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use((err, req, res, next) => {
    logger.error({ err }, 'Unhandled request error');
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;