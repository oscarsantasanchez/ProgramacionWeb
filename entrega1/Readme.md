# Portal de Productos - Entrega 1

Este proyecto es un portal de productos desarrollado con Node.js, Express, MongoDB y Socket.IO. Incluye autenticación JWT, chat en tiempo real y gestión de productos.

## 🚀 Características

- Autenticación de usuarios con JWT
- CRUD de productos
- Chat en tiempo real
- Roles de usuario (admin/usuario)
- API RESTful
- Persistencia en MongoDB

## 📋 Requisitos Previos

- Node.js >= 12
- MongoDB
- npm o yarn

## 🛠️ Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/oscarsantasanchez/ProgramacionWeb.git
cd entrega1
```

2. Instalar dependencias:
```bash
npm install
```
3. Iniciar el servidor:
```bash
npm start
```

Para desarrollo:
```bash
npm run dev
```

## 🗄️ Estructura del Proyecto

```
entrega1/
├── config.js           # Configuración del proyecto
├── server.js          # Punto de entrada principal
├── middleware/        # Middlewares personalizados
│   ├── authenticateJWT.js
│   └── authorizeRole.js
├── models/           # Modelos de MongoDB
│   ├── Message.js
│   ├── Product.js
│   └── User.js
├── public/          # Archivos estáticos
│   ├── chat.html
│   ├── client.js
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   └── styles.css
└── routes/         # Rutas de la API
    ├── authRoutes.js
    ├── chatRoutes.js
    └── productRoutes.js
```

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión

### Productos
- `GET /api/products` - Obtener todos los productos
- `POST /api/products` - Crear nuevo producto (requiere auth)
- `PUT /api/products/:id` - Actualizar producto (requiere auth)
- `DELETE /api/products/:id` - Eliminar producto (requiere auth)

### Chat
- `GET /api/chat/messages` - Obtener historial de mensajes
- `POST /api/chat/messages` - Enviar nuevo mensaje (requiere auth)

## 🔌 WebSocket Events

### Cliente a Servidor
- `chatMessage` - Enviar mensaje de chat
```javascript
socket.emit('chatMessage', { username: 'user', message: 'Hello!' });
```

### Servidor a Cliente
- `chatMessage` - Recibir mensaje de chat
```javascript
socket.on('chatMessage', (msg) => {
  console.log(msg.username + ': ' + msg.message);
});
```

## 🔒 Seguridad

- Autenticación mediante JWT (JSON Web Tokens)
- Contraseñas hasheadas con bcrypt
- Middleware de autorización por roles
- CORS habilitado
- Validación de datos en endpoints

## 🛡️ Middleware de Autenticación

El proyecto utiliza middleware personalizado para proteger rutas:

```javascript
// Ejemplo de ruta protegida
app.use('/api/products', authenticateJWT, productRoutes);
```

## 💾 Modelos de Datos

### Usuario
```javascript
{
  username: String,
  password: String, // Hasheado
  role: String     // 'admin' o 'user'
}
```

### Producto
```javascript
{
  name: String,
  description: String,
  price: Number,
  createdBy: ObjectId
}
```

### Mensaje
```javascript
{
  username: String,
  message: String,
  timestamp: Date
}
```

## 🔧 Configuración

El archivo `config.js` maneja la configuración del proyecto:

```javascript
{
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/portalproductos',
  JWT_SECRET: process.env.JWT_SECRET || 'clave_secreta_por_defecto',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h'
}
```

## 📦 Dependencias Principales

- express: Framework web
- mongoose: ODM para MongoDB
- socket.io: Comunicación en tiempo real
- jsonwebtoken: Autenticación JWT
- bcrypt: Hashing de contraseñas
- cors: Middleware CORS

## 🤔 Decisiones tomadas durante el desarrollo

### 1. Arquitectura y Estructura
- **Patrón MVC**: Se implementó una arquitectura Modelo-Vista-Controlador para mantener una separación clara de responsabilidades.
- **Estructura modular**: Se organizó el código en directorios específicos (routes, models, middleware) para mejorar la mantenibilidad.
- **API RESTful**: Se eligió un diseño REST para la API por su simplicidad y amplia adopción en la industria.

### 2. Tecnologías Seleccionadas
- **MongoDB**: Elegido por su flexibilidad con datos JSON y excelente integración con Node.js.
- **Express**: Framework seleccionado por su madurez, documentación y gran ecosistema de middleware.
- **Socket.IO**: Implementado para el chat en tiempo real por su robustez y facilidad de uso.
- **JWT**: Elegido para autenticación por ser stateless y escalable.

### 3. Decisiones de Seguridad
- **Hashing de Contraseñas**: Se utiliza bcrypt con salt rounds configurables para máxima seguridad.
- **CORS Configurado**: Habilitado para permitir peticiones desde el frontend en desarrollo.
- **Middleware de Autenticación**: Implementado a nivel de ruta para proteger endpoints sensibles.
- **Validación de Datos**: Implementada en cada endpoint para prevenir inyecciones y datos malformados.

### 4. Optimizaciones
- **Conexión MongoDB Persistente**: Uso de conexión persistente para mejor rendimiento.
- **Índices en MongoDB**: Creados en campos frecuentemente consultados.
- **Paginación**: Implementada en endpoints que devuelven listas para optimizar rendimiento.

### 5. Decisiones de Frontend
- **Archivos Estáticos**: Servidos directamente por Express para simplificar el despliegue.
- **JavaScript Vanilla**: Usado en el cliente para minimizar dependencias.
- **Diseño Responsive**: CSS implementado con flexbox y grid para adaptabilidad.

### 6. Gestión de Errores
- **Middleware de Errores**: Centralizado para manejo consistente de errores.
- **Logging**: Implementado para facilitar debugging y monitoreo.
- **Validación de Entrada**: Middleware personalizado para validar datos de entrada.

### 7. Escalabilidad
- **Configuración Externalizada**: Variables de entorno para facilitar el despliegue.
- **Estructura Modular**: Diseño que permite agregar nuevas características fácilmente.
- **Websockets Optimizados**: Implementación eficiente para manejar múltiples conexiones.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## ✍️ Autor

Oscar Santamaria Sánchez
