const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Chat routes working!', timestamp: new Date().toISOString() });
});

router.get('/messages', (req, res) => {
  res.status(501).json({ message: 'Chat messages endpoint not yet implemented' });
});

module.exports = router;
