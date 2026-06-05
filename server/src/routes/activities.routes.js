const express = require('express');
const router = express.Router();
const activitiesController = require('../controllers/activities.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.get('/', authenticate, activitiesController.getActivities);
router.get('/mine', authenticate, activitiesController.getMyActivities);
router.get('/:id', authenticate, activitiesController.getActivity);
router.post('/', authenticate, authorize('ADMIN', 'LECTURER'), activitiesController.createActivity);
router.put('/:id', authenticate, authorize('ADMIN', 'LECTURER'), activitiesController.updateActivity);
router.delete('/:id', authenticate, authorize('ADMIN'), activitiesController.deleteActivity);
router.put('/:id/approve', authenticate, authorize('ADMIN'), activitiesController.approveActivity);
router.post('/:id/join', authenticate, activitiesController.joinActivity);
router.delete('/:id/leave', authenticate, activitiesController.leaveActivity);

module.exports = router;
