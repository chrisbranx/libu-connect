const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academic.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/', authenticate, academicController.getGrades);
router.get('/summary', authenticate, academicController.getSummary);
router.get('/semesters', authenticate, academicController.getSemesters);
router.post('/', authenticate, academicController.createGrade);
router.put('/:id', authenticate, academicController.updateGrade);
router.delete('/:id', authenticate, academicController.deleteGrade);

module.exports = router;
