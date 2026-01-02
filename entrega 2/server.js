const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { graphqlHTTP } = require('express-graphql');
const { Server } = require('socket.io');
const { PORT, MONGO_URI } = require('./config');

// Importar las rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');  // Importa las rutas de usuarios

// Importar el esquema GraphQL
const schema = require('./graphql/schema');

// Crear la aplicación y el servidor HTTP
const app = express();
const server = http.createServer(app);

// Configurar Socket.IO
const io = new Server(server, { cors: { origin: '*' } });

// Conexión a MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error en MongoDB:', err));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rutas REST (Autenticación, Productos, Chat y Usuarios)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // authenticateJWT ya aplicado dentro de productRoutes
app.use('/api/chat', chatRoutes); // authenticateJWT ya aplicado dentro de chatRoutes
app.use('/api/users', userRoutes); // Ruta para la gestión de usuarios

// Rutas GraphQL
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true, // Habilita la interfaz de GraphiQL para pruebas
}));

// Configuración de Socket.IO para el chat en tiempo real
const Message = require('./models/Message');

io.on('connection', (socket) => {
  console.log('🟢 Nuevo cliente conectado');

  // Manejo de mensajes de chat
  socket.on('chatMessage', async (data) => {
    const msg = new Message({ username: data.username, message: data.message });
    await msg.save();
    io.emit('chatMessage', msg); // Emitir el mensaje a todos los clientes conectados
  });

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado');
  });
});

// Arrancar el servidor
server.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
