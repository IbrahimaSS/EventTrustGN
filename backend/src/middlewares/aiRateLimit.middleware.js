const rateLimit = require('express-rate-limit');

// Limite spécifique pour les routes IA (anti-surconsommation de crédits)
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requêtes par minute par utilisateur
  message: {
    message: "Trop de requêtes IA. Veuillez patienter avant de réessayer.",
    retryAfter: "60 secondes"
  },
  keyGenerator: (req) => {
    // Limiter par utilisateur connecté, ou par adresse IP pour les visiteurs
    if (req.user && req.user._id) {
      return req.user._id.toString();
    }
    return req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { aiRateLimiter };
