const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Services routes working!', timestamp: new Date().toISOString() });
});

router.get('/', (req, res) => {
  res.status(501).json({ message: 'Services endpoint not yet implemented' });
});

module.exports = router;
