const express = require('express');
const router = express.Router();

// Example route
router.get('/ping', (req, res) => {
  res.json({ message: 'PixVault API is alive!' });
});

module.exports = router;