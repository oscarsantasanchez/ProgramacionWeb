function checkRole(roles = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción.' });
    }
    next();
  };
}

module.exports = checkRole;