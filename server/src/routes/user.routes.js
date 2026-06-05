const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.put('/privacy', authenticate, userController.updatePrivacy);
router.put('/settings', authenticate, userController.updateSettings);
router.put('/password', authenticate, userController.changePassword);
router.delete('/account', authenticate, userController.deleteAccount);

module.exports = router;
