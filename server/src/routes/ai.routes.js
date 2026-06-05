const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const authenticate = require('../middleware/auth.middleware');

router.post('/chat', authenticate, aiController.chat);
router.get('/history', authenticate, aiController.getHistory);
router.delete('/history', authenticate, aiController.clearHistory);
router.post('/suggest', authenticate, aiController.getSuggestions);

module.exports = router;
