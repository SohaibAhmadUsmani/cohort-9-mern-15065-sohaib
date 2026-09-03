const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        logger.info(`Database connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error({ err: error }, 'Database connection failed');
        process.exit(1);
    }
}

module.exports = connectDB;