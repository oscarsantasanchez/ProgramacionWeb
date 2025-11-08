  const express = require('express');
  const mongoose = require('mongoose');
  const cors = require('cors');
  const jwt = require('jsonwebtoken');
  const { Server } = require('socket.io');
  const http = require('http');
  const { PORT, MONGO_URI, JWT_SECRET } = require('./config');
  const Message = require('./models/Message');

  const authRoutes = require('./routes/authRoutes');
  const productRoutes = require('./routes/productRoutes');
  const chatRoutes = require('./routes/chatRoutes');

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);

  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB conectado'))
    .catch(err => console.error('❌ Error en MongoDB:', err));

  app.use(cors());
  app.use(express.json());
  app.use(express.static('public'));

  // Middleware de autenticación JWT
  function authenticateJWT(req, res, next) {
  const token = req.headers && req.headers.authorization
    ? req.headers.authorization.split(' ')[1]
    : undefined;
    if (!token) return res.status(401).json({ message: 'Token no proporcionado.' });
    try {
      req.user = jwt.verify(token, JWT_SECRET);
      next();
    } catch {
      res.status(403).json({ message: 'Token inválido o expirado.' });
    }
  }

  app.use('/api/auth', authRoutes);
  app.use('/api/products', authenticateJWT, productRoutes);
  app.use('/api/chat', authenticateJWT, chatRoutes);

  // ===== SOCKET.IO =====
  io.on('connection', (socket) => {
    console.log('🟢 Nuevo cliente conectado');

    socket.on('chatMessage', async (data) => {
      const msg = new Message({ username: data.username, message: data.message });
      await msg.save();
      io.emit('chatMessage', msg);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Cliente desconectado');
    });
  });

  server.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
