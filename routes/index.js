// routes/index.js
const express = require('express');
const router  = express.Router();

// Exemplo de rota
router.get('/', (req, res) => {
  res.send('Hello world');
});

module.exports = router;