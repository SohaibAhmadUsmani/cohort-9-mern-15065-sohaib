const User = require('../models/user');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const bcrypt = require('bcrypt');

const signup=async(req,res)=>{
    try{
        const name=req.body.name;
        const email=req.body.email;
        const password=req.body.password;
        if(!name || !email || !password){
            return res.status(400).json({message:"All Fields Are Required"});
        }
         const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User Already Exists"});
        }
        const salt = await bcrypt.genSalt(8);
        const hashedPassword=await bcrypt.hash(password,salt);
        const user =new User({name,email,password:hashedPassword});
        await user.save();
        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET,{expiresIn:'5d'}); 
        return res.status(201).json({message:"User Created Successfully", token});
        
    }
    catch(err){
        logger.error("SignUp Failed",err);
        return res.status(500).json({message:"Internal Server Error"}); 
    }

}
const login=async(req,res)=>{
    try{
    const email=req.body.email;
    const password=req.body.password;
    const user = await User.findOne({email:email});
    if(!user){
        return res.status(404).json({message:"User Not Found"});
    }
    const isValid=await bcrypt.compare(password,user.password);
    if(!isValid){
        return res.status(401).json({message:"Invalid Credentials"});
    }

    const token=jwt.sign({id:user._id}, process.env.JWT_SECRET,{expiresIn:'5d'}); 
    return res.status(200).json({message:"User Logged In Successfully", token});
    }
    catch(err){
        logger.error("Login Failed",err);
        return res.status(500).json({message:"Internal Server Error"}); 
    }
}
module.exports = {signup,login};