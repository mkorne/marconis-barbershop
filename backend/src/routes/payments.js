const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Payments routes working!', timestamp: new Date().toISOString() });
});

router.post('/process', (req, res) => {
  res.status(501).json({ message: 'Payment processing not yet implemented' });
});

module.exports = router;
