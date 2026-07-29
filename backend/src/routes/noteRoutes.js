const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createNote, getNotes, getNote, updateNote, deleteNote } = require('../controllers/noteController');

router.use(authMiddleware);

router.get('/', getNotes);
router.post('/', createNote);
router.get('/:id', getNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
