const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name:{type: String, required: true, trim: true },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: { validator: (v) => {
            const [local, domain] = v.split('@');
            return local?.length > 0 && domain?.includes('.');
        }, message: 'Enter a valid email' }
    },
    password: { type: String, required: true }
});
module.exports=mongoose.model('User',userSchema);