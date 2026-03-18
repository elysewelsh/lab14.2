import express from 'express'

const router = express.Router()

import Note from '../models/Notes.js'
import { authMiddleware } from '../utils/auth.js'
 
// Apply authMiddleware to all routes in this file
router.use(authMiddleware);
 
// GET /api/notes - Get all notes for the logged-in user
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find(
        {user: { $eq: req.user._id}});
    res.json(notes);
  } catch (err) {
    res.status(500).json(err);
  }
});
 
// POST /api/notes - Create a new note
router.post('/', async (req, res) => {
  try {
    const note = new Note({
      ...req.body,
      user: req.user._id
    });
    console.log("inside the note:" + note)
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(400).json(err);
  }
});
 
// PUT /api/notes/:id - Update a note
router.put('/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, {new: true});
    if (req.user._id != note.user) {
        return res.status(403).json({ message: 'User forbidden from updating this note' });
    }
    if (!note) {
      return res.status(404).json({ message: 'No note found with this id!' });
    }
    res.json(note);
  } catch (err) {
    res.status(500).json(err);
  }
});
 
// DELETE /api/notes/:id - Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (req.user._id != note.user) {
        return res.status(403).json({ message: 'User forbidden from deleting this note' });
    }
    if (!note) {
      return res.status(404).json({ message: 'No note found with this id!' });
    }
    const deleteNote = await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted!' });
  } catch (err) {
    res.status(500).json(err);
  }
});
 
export default router