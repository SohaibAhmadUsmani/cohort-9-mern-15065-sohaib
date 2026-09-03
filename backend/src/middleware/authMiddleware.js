const jsonwebtoken = require('jsonwebtoken');
const logger = require('../config/logger');
const User = require('../models/user');

const authMiddleware = async(req,res,next)=>{
    try{
        const token = req.header('Authorization')?.replace('Bearer ','');
        if(!token){
            logger.error('Access Denied');
            return res.status(401).json({message:"Access Denied"});
        }
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if(!user){
            return res.status(401).json({message:"Invalid Token"});
        }
        req.user = user;
        next();
    }
    catch(err){
        if(err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError'){
            return res.status(401).json({message:"Invalid Token"});
        }
        logger.error({err},'Auth failed');
        return res.status(500).json({message:"Internal Server Error"}); 
    }
}
module.exports = authMiddleware;