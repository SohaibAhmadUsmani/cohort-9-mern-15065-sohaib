const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('./logger');
dotenv.config();//ENV Calling
const connectDB = async () => {
    try{
    const conn = await mongoose.connect(process.env.MONGO_URI);
     logger.info(`Database connected: ${conn.connection.host}`);
    }
    catch(error){
        logger.error({error: error, message:error.message},'Database connection failed');
        process.exit(1);}
}
module.exports=connectDB;