const jwt = require('jsonwebtoken');
const config = require('../config');

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado' });
    }

    // Guardamos los datos del usuario (incluido el rol)
    req.user = {
      id: decoded.id,
      role: decoded.role,
      username: decoded.username,
    };

    next();
  });
}

module.exports = authenticateJWT;