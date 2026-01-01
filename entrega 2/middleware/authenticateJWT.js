const jwt = require('jsonwebtoken');
const config = require('../config');

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Guardamos los datos del usuario (incluido el rol)
    req.user = {
      id: decoded.id,
      role: decoded.role,
      username: decoded.username,
    };

    next();
  } catch (err) {
    console.error('Error al verificar el token:', err);
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
}

module.exports = authenticateJWT;
