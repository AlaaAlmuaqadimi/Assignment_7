const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

router.post('/', noteController.createNote);
router.put('/replace/:noteId', noteController.replaceNote);
router.patch('/all', noteController.updateAllNotes);
router.patch('/:noteId', noteController.updateNote);
router.get('/paginate-sort', noteController.getPaginatedNotes);
router.get('/note-by-content', noteController.getNoteByContent);
router.get('/note-with-user', noteController.getNotesWithUser);
router.get('/aggregate', noteController.aggregateNotes);
router.get('/:id', noteController.getNoteById);
router.delete('/:noteId', noteController.deleteNote);
router.delete('/', noteController.deleteAllNotes);

module.exports = router;
