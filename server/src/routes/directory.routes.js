const express = require('express');
const router = express.Router();
const directoryController = require('../controllers/directory.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/', authenticate, directoryController.getDirectory);
router.get('/:id', authenticate, directoryController.getUserProfile);

module.exports = router;
