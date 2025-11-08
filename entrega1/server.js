const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { PORT, MONGO_URI, JWT_SECRET } = require('./config');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Conexión a MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error en MongoDB:', err));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // authenticateJWT ya aplicado dentro de productRoutes
app.use('/api/chat', chatRoutes); // authenticateJWT ya aplicado dentro de chatRoutes

// ===== SOCKET.IO =====
const Message = require('./models/Message');

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

// Arrancar servidor
server.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));



