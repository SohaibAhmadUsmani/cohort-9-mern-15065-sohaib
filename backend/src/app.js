require('dotenv').config();
const express=require('express');
const cors=require('cors');
const connectDB=require('./config/db');
//const routes_user=require('./routes/userRoutes');
//const routes_notes=require('./routes/noteRoutes');
const logger=require('./config/logger');
 
const app=express();
app.use(cors());
app.use(express.json());
app.use('/api/auth',require('./routes/authRoutes'));
app.use('/api/notes',require('./routes/noteRoutes'));
app.use((err,req,res,next)=>{
    logger.error(err.message);
    res.status(500).json({message:'Internal Server Error'});
});

const PORT=process.env.PORT||5000;
connectDB().then(()=>{
    app.listen(PORT,()=>{logger.info(`Server is running on port ${PORT}`)})
})

