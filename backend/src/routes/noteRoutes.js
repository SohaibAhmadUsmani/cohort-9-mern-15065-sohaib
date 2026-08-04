const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createNote, getNotes, getNote, updateNote, deleteNote } = require('../controllers/noteController');
const mongoose=require('mongoose');
router.use(authMiddleware)
router.param('id',(req,res,next,id)=>{
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message:"Invalid Note ID"});
    }
    next();
})

router.get('/', getNotes);
router.post('/', createNote);
router.get('/:id', getNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
