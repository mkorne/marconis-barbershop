const express = require('express');
const router = express.Router();
const messagesModule = require('./messages');

router.get('/test', (req, res) => {
  res.json({ message: 'Chat routes working!', timestamp: new Date().toISOString() });
});

// Delegate chat messages to the messages route handler
router.get('/messages', (req, res, next) => {
  req.url = '/';
  messagesModule.router(req, res, next);
});

module.exports = router;
