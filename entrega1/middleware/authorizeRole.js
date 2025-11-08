module.exports = function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      return next();
    }
    return res.status(403).json({ message: 'Acceso denegado. No autorizado.' });
  };
};
