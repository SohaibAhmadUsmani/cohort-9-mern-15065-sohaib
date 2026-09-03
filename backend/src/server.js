require('dotenv').config();
const connectDB = require('./config/db');
const logger = require('./config/logger');
const app = require('./app');

for (const key of ['MONGO_URI', 'JWT_SECRET']) {
    if (!process.env[key]) {
        logger.fatal({ key }, 'Missing required environment variable');
        process.exit(1);
    }
}

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    app.listen(PORT, () => { logger.info(`Server is running on port ${PORT}`) });
}).catch(() => {
    process.exit(1);
});
