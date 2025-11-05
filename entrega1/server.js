// server.js
const express = require('express');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const config = require('./config');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const chatRoutes = require('./routes/chatRoutes');
const authenticateJWT = require('./middleware/authenticateJWT');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
// Protección de /api/chat mediante middleware enrutado (chatRoutes espera authenticateJWT)
app.use('/api/chat', authenticateJWT, chatRoutes);

// Ruta pública por defecto sirve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO authentication on handshake using token (in auth payload or query)
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth && (socket.handshake.auth.token || socket.handshake.query.token);
    if (!token) return next(new Error('Authentication error: token missing'));

    const jwt = require('jsonwebtoken');
    const config = require('./config');
    const decoded = jwt.verify(token, config.JWT_SECRET);
    socket.user = { id: decoded.id, username: decoded.username, role: decoded.role };
    return next();
  } catch (err) {
    return next(new Error('Authentication error'));
  }
});

io.on('connection', async (socket) => {
  console.log('Socket connected:', socket.id, 'user:', socket.user && socket.user.username);

  // Enviar historial (últimos 50)
  try {
    const history = await Message.find().sort({ createdAt: -1 }).limit(50).lean();
    socket.emit('history', history.reverse());
  } catch (err) {
    console.error('Error cargando historial:', err);
  }

  socket.on('message', async (payload) => {
    try {
      const msg = new Message({ userId: socket.user.id, username: socket.user.username, text: payload.text });
      await msg.save();
      io.emit('message', { username: socket.user.username, text: payload.text, createdAt: msg.createdAt });
    } catch (err) {
      console.error('Error guardando mensaje:', err);
    }
  });

  socket.on('typing', (isTyping) => {
    socket.broadcast.emit('typing', { username: socket.user.username, isTyping });
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Conexión a MongoDB + levantar servidor
mongoose.connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB conectado');
    server.listen(config.PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${config.PORT}`);
    });
  })
  .catch(err => {
    console.error('Error conectando a MongoDB:', err);
  });
