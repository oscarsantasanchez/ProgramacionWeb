const express = require('express');
const Message = require('../models/Message');
const router = express.Router();

router.get('/history', async (req, res) => {
  try {
    const history = await Message.find().sort({ createdAt: -1 }).limit(100);
    res.json(history.reverse());
  } catch {
    res.status(500).json({ message: 'Error al obtener historial del chat.' });
  }
});

module.exports = router;
