const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notes.controller');
const authenticate = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', authenticate, notesController.getNotes);
router.get('/shared', authenticate, notesController.getSharedNotes);
router.get('/:id', authenticate, notesController.getNote);
router.post('/', authenticate, notesController.createNote);
router.post('/upload', authenticate, upload.single('file'), notesController.uploadAttachment);
router.put('/:id', authenticate, notesController.updateNote);
router.delete('/:id', authenticate, notesController.deleteNote);
router.post('/:id/pin', authenticate, notesController.togglePin);

module.exports = router;
