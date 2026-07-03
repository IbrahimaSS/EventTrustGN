const express = require('express');
const router = express.Router();
const {
  chat,
  generateEventDescription,
  improveEventDescription,
  analyzeEvent,
  analyzeInstitution,
  getAdvice,
  composeMessage,
  generateEventReport
} = require('../controllers/ai.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { aiRateLimiter } = require('../middlewares/aiRateLimit.middleware');

// 1. Chat libre (Accessible au public et aux utilisateurs connectés)
router.post('/chat', aiRateLimiter, chat);

// Toutes les autres routes IA nécessitent une authentification
router.use(protect);
router.use(aiRateLimiter);

// 2. Rédaction d'événements
router.post('/event/generate-description', authorize('Admin Institution', 'Responsable Communication'), generateEventDescription);
router.post('/event/improve-description', authorize('Admin Institution', 'Responsable Communication'), improveEventDescription);

// 3. Analyse (données réelles de la plateforme)
router.get('/event/:eventId/analyze', authorize('Admin Institution', 'Responsable Communication'), analyzeEvent);
router.get('/institution/analyze', authorize('Admin Institution'), analyzeInstitution);

// 4. Conseils
router.post('/advice', getAdvice);

// 5. Rédaction de messages (SMS, email, annonce, communiqué)
router.post('/compose-message', authorize('Admin Institution', 'Responsable Communication'), composeMessage);

// 6. Rapport de synthèse
router.get('/event/:eventId/report', authorize('Admin Institution'), generateEventReport);

module.exports = router;
