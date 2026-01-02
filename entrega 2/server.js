const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { graphqlHTTP } = require('express-graphql');
const { Server } = require('socket.io');
const { PORT, MONGO_URI } = require('./config');

// Rutas REST
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');

// GraphQL
const schema = require('./graphql/schema');

// Modelos
const Message = require('./models/Message');

// Crear app y servidor HTTP
const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, { cors: { origin: '*' } });

// Conexión a MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error en MongoDB:', err));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rutas REST
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);

// GraphQL
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
}));

// ===============================
// SOCKET.IO — CHAT EN TIEMPO REAL
// ===============================
io.on('connection', (socket) => {
  console.log('🟢 Nuevo cliente conectado');

  socket.on('chatMessage', async (data) => {
    try {
      const { username, message, role, userId } = data;

      if (!message || !message.trim()) return;

      const msg = new Message({
        username,
        message,
        role: role || 'Cliente',
        userId: userId || 'desconocido'
      });

      await msg.save();

      io.emit('chatMessage', {
        username: msg.username,
        message: msg.message,
        role: msg.role,
        userId: msg.userId,
        createdAt: msg.createdAt
      });

    } catch (err) {
      console.error('❌ Error guardando mensaje:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado');
  });
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});
