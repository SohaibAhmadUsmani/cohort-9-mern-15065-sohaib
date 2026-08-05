const Note = require('../models/note');
const logger = require('../config/logger');
const createNote = async (req,res) => {
    try {
        const {title, content}=req.body;
        if (!title||!content) {
            return res.status(400).json({message:'Title and content are required'});
        }
        const note = new Note({ title, content, user: req.user._id });
        await note.save();
        logger.info(`Note created: ${note._id} by user ${req.user._id}`);
        return res.status(201).json({ message: 'Note created successfully', note });
    } catch (err) {
        logger.error({err},'Create note failed');
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
const getNotes=async(req, res) => {
    try {
        const notes = await Note.find({ user: req.user._id });
        logger.info(`Notes fetched for user ${req.user._id}: ${notes.length} notes`);
        return res.status(200).json({ notes });
    } catch (err) {
        logger.error({err},'Get notes failed');
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
const getNote = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        logger.info(`Note fetched: ${note._id} by user ${req.user._id}`);
        return res.status(200).json({ note });
    } catch (err) {
        logger.error({err},'Get note failed');
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
const updateNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { title, content },
            { new: true, runValidators: true }
        );
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        logger.info(`Note updated: ${note._id} by user ${req.user._id}`);
        return res.status(200).json({ message: 'Note updated successfully', note });
    } catch (err) {
        logger.error({err},'Update note failed');
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        logger.info(`Note deleted: ${note._id} by user ${req.user._id}`);
        return res.status(200).json({ message: 'Note deleted successfully' });
    } catch (err) {
        logger.error({err},'Delete note failed');
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
module.exports = { createNote, getNotes, getNote, updateNote, deleteNote };
