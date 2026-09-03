const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name:{type: String, required: true, trim: true },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Enter a valid email']
    },
    password: { type: String, required: true }
});
module.exports=mongoose.model('User',userSchema);