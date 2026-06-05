const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/', authenticate, scheduleController.getSchedules);
router.get('/upcoming', authenticate, scheduleController.getUpcoming);
router.post('/', authenticate, scheduleController.createSchedule);
router.put('/:id', authenticate, scheduleController.updateSchedule);
router.delete('/:id', authenticate, scheduleController.deleteSchedule);

module.exports = router;
