const { callGrokAPI } = require('../services/grok.service');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Institution = require('../models/Institution');
const Badge = require('../models/Badge');

// ============================================================
// 1. ASSISTANCE GÉNÉRALE (Chat libre avec Grok)
// ============================================================

// @desc    Chat libre avec l'assistant IA
// @route   POST /api/ai/chat
// @access  Private
const chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Le message est requis." });
    }

    const result = await callGrokAPI(message);
    res.json({ response: result.response, usage: result.usage, simulated: result.simulated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// 2. RÉDACTION D'ÉVÉNEMENTS
// ============================================================

// @desc    Générer une description complète pour un événement
// @route   POST /api/ai/event/generate-description
// @access  Private (Admin Institution, Responsable Communication)
const generateEventDescription = async (req, res) => {
  try {
    const { title, type, audience, date, location, details } = req.body;

    const prompt = `Rédige une description professionnelle et engageante pour un événement institutionnel.

Informations fournies :
- Titre : ${title}
- Type : ${type || 'Non précisé'}
- Public cible : ${audience || 'Grand public'}
- Date : ${date || 'À confirmer'}
- Lieu : ${location || 'À confirmer'}
- Détails supplémentaires : ${details || 'Aucun'}

La description doit :
1. Être professionnelle et adaptée au contexte institutionnel guinéen
2. Comporter un paragraphe d'accroche captivant
3. Détailler les objectifs de l'événement
4. Préciser le public cible
5. Inclure un appel à l'action pour l'inscription
6. Faire entre 150 et 300 mots`;

    const result = await callGrokAPI(prompt);
    res.json({ description: result.response, usage: result.usage, simulated: result.simulated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Améliorer une description existante
// @route   POST /api/ai/event/improve-description
// @access  Private
const improveEventDescription = async (req, res) => {
  try {
    const { currentDescription, tone } = req.body;

    const prompt = `Améliore et reformule cette description d'événement. 
Ton souhaité : ${tone || 'professionnel et engageant'}

Description actuelle :
"${currentDescription}"

Améliore la en gardant les informations clés mais en rendant le texte plus percutant, mieux structuré et plus professionnel. Corrige les éventuelles fautes.`;

    const result = await callGrokAPI(prompt);
    res.json({ improvedDescription: result.response, usage: result.usage, simulated: result.simulated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// 3. ANALYSE ET STATISTIQUES
// ============================================================

// @desc    Analyser les performances d'un événement
// @route   GET /api/ai/event/:eventId/analyze
// @access  Private (Admin Institution)
const analyzeEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate('institutionId', 'name');
    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé." });
    }

    // Vérifier l'accès
    if (event.institutionId._id.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({ message: "Non autorisé." });
    }

    // Collecter les données réelles
    const totalRegistrations = await Registration.countDocuments({ eventId: event._id });
    const acceptedRegistrations = await Registration.countDocuments({ eventId: event._id, status: 'accepted' });
    const rejectedRegistrations = await Registration.countDocuments({ eventId: event._id, status: 'rejected' });
    const pendingRegistrations = await Registration.countDocuments({ eventId: event._id, status: 'pending' });
    const paidRegistrations = await Registration.countDocuments({ eventId: event._id, paymentStatus: 'paid' });
    const badgesGenerated = await Badge.countDocuments({ eventId: event._id });
    const badgesUsed = await Badge.countDocuments({ eventId: event._id, status: 'used' });

    const contextData = {
      evenement: {
        titre: event.title,
        institution: event.institutionId.name,
        dateDebut: event.startDate,
        dateFin: event.endDate,
        lieu: event.location,
        placesMax: event.maxParticipants,
        prix: event.price,
        statut: event.status
      },
      statistiques: {
        totalInscriptions: totalRegistrations,
        inscriptionsAcceptees: acceptedRegistrations,
        inscriptionsRefusees: rejectedRegistrations,
        inscriptionsEnAttente: pendingRegistrations,
        paiementsRecus: paidRegistrations,
        badgesGeneres: badgesGenerated,
        badgesScannes: badgesUsed,
        tauxOccupation: event.maxParticipants > 0 
          ? `${((acceptedRegistrations / event.maxParticipants) * 100).toFixed(1)}%` 
          : 'Illimité',
        tauxPresence: badgesGenerated > 0 
          ? `${((badgesUsed / badgesGenerated) * 100).toFixed(1)}%`
          : 'Pas encore de données'
      }
    };

    const prompt = `Analyse les performances de cet événement et fournis un rapport détaillé avec :
1. Un résumé exécutif (3-4 lignes)
2. Points forts identifiés
3. Points d'amélioration
4. Recommandations concrètes pour les prochains événements
5. Score de performance global sur 10

Sois précis et base-toi uniquement sur les données fournies.`;

    const result = await callGrokAPI(prompt, contextData);

    res.json({
      analysis: result.response,
      rawStats: contextData.statistiques,
      usage: result.usage,
      simulated: result.simulated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Analyser les performances globales de l'institution
// @route   GET /api/ai/institution/analyze
// @access  Private (Admin Institution)
const analyzeInstitution = async (req, res) => {
  try {
    const institutionId = req.user.institutionId;
    const institution = await Institution.findById(institutionId);

    if (!institution) {
      return res.status(404).json({ message: "Institution non trouvée." });
    }

    // Statistiques globales
    const totalEvents = await Event.countDocuments({ institutionId });
    const publishedEvents = await Event.countDocuments({ institutionId, status: 'published' });
    const draftEvents = await Event.countDocuments({ institutionId, status: 'draft' });
    
    const eventIds = await Event.find({ institutionId }).select('_id');
    const eventIdArray = eventIds.map(e => e._id);
    
    const totalRegistrations = await Registration.countDocuments({ eventId: { $in: eventIdArray } });
    const totalAccepted = await Registration.countDocuments({ eventId: { $in: eventIdArray }, status: 'accepted' });
    const totalBadges = await Badge.countDocuments({ eventId: { $in: eventIdArray } });
    const totalScanned = await Badge.countDocuments({ eventId: { $in: eventIdArray }, status: 'used' });

    const contextData = {
      institution: {
        nom: institution.name,
        type: institution.type,
        ville: institution.city,
        statut: institution.status,
        verifie: institution.isVerified
      },
      statistiquesGlobales: {
        totalEvenements: totalEvents,
        evenementsPublies: publishedEvents,
        brouillons: draftEvents,
        totalInscriptions: totalRegistrations,
        inscriptionsAcceptees: totalAccepted,
        totalBadges,
        badgesScannes: totalScanned
      }
    };

    const prompt = `Analyse les performances globales de cette institution sur la plateforme EventTrust GN.

Fournis :
1. Bilan général de l'activité
2. Tendances observées
3. Forces de l'institution dans l'organisation d'événements
4. Axes d'amélioration prioritaires
5. 3 recommandations stratégiques concrètes
6. Score d'activité global sur 10`;

    const result = await callGrokAPI(prompt, contextData);

    res.json({
      analysis: result.response,
      rawStats: contextData.statistiquesGlobales,
      usage: result.usage,
      simulated: result.simulated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// 4. CONSEILS ET SUGGESTIONS
// ============================================================

// @desc    Obtenir des conseils pour organiser un type d'événement
// @route   POST /api/ai/advice
// @access  Private
const getAdvice = async (req, res) => {
  try {
    const { topic, context } = req.body;

    const prompt = `En tant qu'expert en organisation d'événements institutionnels en Guinée, donne des conseils détaillés sur le sujet suivant :

Sujet : ${topic}
${context ? `Contexte additionnel : ${context}` : ''}

Structure ta réponse avec :
- Des conseils pratiques numérotés
- Des exemples concrets adaptés au contexte guinéen
- Les erreurs courantes à éviter
- Une checklist actionnable`;

    const result = await callGrokAPI(prompt);
    res.json({ advice: result.response, usage: result.usage, simulated: result.simulated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// 5. RÉDACTION DE MESSAGES (SMS / Email / Communication)
// ============================================================

// @desc    Générer un message de communication
// @route   POST /api/ai/compose-message
// @access  Private
const composeMessage = async (req, res) => {
  try {
    const { type, purpose, audience, eventTitle, details } = req.body;

    const prompt = `Rédige un message de type "${type}" (ex: SMS, email, annonce, communiqué).

Objectif : ${purpose}
Public cible : ${audience || 'Participants'}
${eventTitle ? `Événement concerné : ${eventTitle}` : ''}
${details ? `Détails : ${details}` : ''}

Contraintes :
${type === 'sms' ? '- Maximum 160 caractères, direct et percutant' : ''}
${type === 'email' ? '- Inclure un objet, un corps structuré et une signature professionnelle' : ''}
${type === 'annonce' ? '- Ton officiel et institutionnel, adapté aux réseaux sociaux' : ''}
${type === 'communique' ? '- Format communiqué de presse officiel avec en-tête, corps et pied' : ''}

Le message doit être en français et adapté au contexte guinéen.`;

    const result = await callGrokAPI(prompt);
    res.json({ message: result.response, usage: result.usage, simulated: result.simulated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// 6. RÉSUMÉ ET RAPPORT
// ============================================================

// @desc    Générer un rapport de synthèse pour un événement
// @route   GET /api/ai/event/:eventId/report
// @access  Private (Admin Institution)
const generateEventReport = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate('institutionId', 'name type city');
    
    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé." });
    }

    if (event.institutionId._id.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({ message: "Non autorisé." });
    }

    const totalReg = await Registration.countDocuments({ eventId: event._id });
    const accepted = await Registration.countDocuments({ eventId: event._id, status: 'accepted' });
    const rejected = await Registration.countDocuments({ eventId: event._id, status: 'rejected' });
    const badgesUsed = await Badge.countDocuments({ eventId: event._id, status: 'used' });

    const contextData = {
      evenement: event.toObject(),
      stats: { totalReg, accepted, rejected, badgesUsed }
    };

    const prompt = `Génère un rapport de synthèse officiel et complet pour cet événement, prêt à être présenté à la direction de l'institution.

Le rapport doit contenir :
1. EN-TÊTE : Titre du rapport, institution, date
2. RÉSUMÉ EXÉCUTIF : 4-5 lignes résumant l'événement
3. DONNÉES CLÉS : Chiffres importants sous forme de tableau textuel
4. DÉROULEMENT : Résumé basé sur les données disponibles
5. BILAN : Points positifs et négatifs
6. RECOMMANDATIONS : Pour les futures éditions
7. CONCLUSION

Format professionnel, ton institutionnel.`;

    const result = await callGrokAPI(prompt, contextData, { maxTokens: 4096 });

    res.json({
      report: result.response,
      usage: result.usage,
      simulated: result.simulated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  chat,
  generateEventDescription,
  improveEventDescription,
  analyzeEvent,
  analyzeInstitution,
  getAdvice,
  composeMessage,
  generateEventReport
};
