const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.get('/', authenticate, notificationController.getNotifications);
router.put('/:id', authenticate, notificationController.markAsRead);
router.put('/read-all', authenticate, notificationController.markAllAsRead);
router.delete('/:id', authenticate, notificationController.deleteNotification);
router.put('/preferences', authenticate, notificationController.updatePreferences);
router.post('/broadcast', authenticate, authorize('ADMIN'), notificationController.broadcast);

module.exports = router;
