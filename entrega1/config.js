module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/portalproductos',
  JWT_SECRET: process.env.JWT_SECRET || 'cambiame_por_una_clave_segura',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h'
};