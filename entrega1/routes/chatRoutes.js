// /routes/chatRoutes.js
const express = require('express');
const Message = require('../models/Message');

const router = express.Router();

/**
 * Devuelve el historial de chat (últimos 100 mensajes)
 * Esta ruta ya está protegida con authenticateJWT desde server.js
 */
router.get('/history', async (req, res) => {
  try {
    const history = await Message.find().sort({ createdAt: -1 }).limit(100);
    res.json(history.reverse());
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener historial de chat' });
  }
});

module.exports = router;
