const express=require('express');
const router=express.Router();
router.post('/signup',(req,res)=>{
    res.json({message:'Signed Up'})
});
router.post('/login',(req,res)=>{
    res.json({message:'Logged In'})
});
module.exports=router;
