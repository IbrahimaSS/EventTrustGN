const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Le rôle ${req.user ? req.user.role : 'inconnu'} n'est pas autorisé à accéder à cette ressource` 
      });
    }
    next();
  };
};

module.exports = { authorize };
