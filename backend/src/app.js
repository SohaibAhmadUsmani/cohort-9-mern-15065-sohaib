require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pinoHttp } = require('pino-http');
const rateLimit = require('express-rate-limit');
const logger = require('./config/logger');

const app = express();
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: { message: "Too many requests from this IP, please try again later" }
});
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use((err, req, res, next) => {
    logger.error({ err }, 'Unhandled request error');
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;