const Event = require('../models/Event');
const Institution = require('../models/Institution');
const Registration = require('../models/Registration');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Badge = require('../models/Badge');

// @desc    Obtenir les statistiques du tableau de bord Super Admin
// @route   GET /api/dashboard/super-admin
// @access  Private (Super Admin)
const getSuperAdminDashboard = async (req, res) => {
  try {
    // === KPIs ===
    const totalUsers = await User.countDocuments();
    const totalInstitutions = await Institution.countDocuments({ status: { $in: ['active', 'pending'] } });
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const totalPaymentsAmount = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalPaymentsAmount.length > 0 ? totalPaymentsAmount[0].total : 0;

    // === Top Institutions (actives, triées par nombre d'événements) ===
    const activeInstitutions = await Institution.find({ status: 'active' })
      .select('name acronym logoUrl city status createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const topInstitutions = [];
    for (const inst of activeInstitutions) {
      const eventsCount = await Event.countDocuments({ institutionId: inst._id });
      const eventIds = await Event.find({ institutionId: inst._id }).select('_id');
      const ids = eventIds.map(e => e._id);
      const registrationsCount = await Registration.countDocuments({ eventId: { $in: ids } });

      topInstitutions.push({
        _id: inst._id,
        name: inst.name,
        acronym: inst.acronym || inst.name.substring(0, 4).toUpperCase(),
        logoUrl: inst.logoUrl,
        city: inst.city,
        eventsCount,
        registrationsCount
      });
    }
    topInstitutions.sort((a, b) => b.eventsCount - a.eventsCount);

    // === Institutions et Événements en attente ===
    const pendingInstitutions = await Institution.find({ status: 'pending' })
      .select('name type city createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const pendingEvents = await Event.find({ status: 'draft' })
      .select('title institutionId createdAt')
      .populate('institutionId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const pendingItems = [
      ...pendingInstitutions.map(inst => ({
        _id: inst._id,
        name: inst.name,
        type: 'Institution',
        detail: inst.type + ' • ' + inst.city,
        date: inst.createdAt
      })),
      ...pendingEvents.map(evt => ({
        _id: evt._id,
        name: evt.title,
        type: 'Événement',
        detail: evt.institutionId?.name || '',
        date: evt.createdAt
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

    // === Événements actifs (publiés, date future ou en cours) ===
    const now = new Date();
    const activeEvents = await Event.find({
      status: 'published',
      startDate: { $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) } // Prochain 30 jours ou passés récemment
    })
      .select('title startDate endDate maxParticipants institutionId')
      .populate('institutionId', 'name acronym')
      .sort({ startDate: -1 })
      .limit(5)
      .lean();

    const activeEventsFormatted = [];
    for (const evt of activeEvents) {
      const regCount = await Registration.countDocuments({ eventId: evt._id });
      const maxP = evt.maxParticipants || 100;
      activeEventsFormatted.push({
        _id: evt._id,
        title: evt.title,
        institution: evt.institutionId?.acronym || evt.institutionId?.name || 'Inconnu',
        registrations: regCount,
        maxParticipants: maxP,
        percent: Math.min(Math.round((regCount / maxP) * 100), 100)
      });
    }

    // === Activité récente (dernières inscriptions, institutions créées, événements publiés) ===
    const recentRegistrations = await Registration.find()
      .populate('participantId', 'fullName')
      .populate({ path: 'eventId', select: 'title institutionId', populate: { path: 'institutionId', select: 'name' } })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    const recentInstitutions = await Institution.find()
      .select('name status createdAt')
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    const recentEvents = await Event.find()
      .select('title status createdAt')
      .populate('institutionId', 'name')
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    const activityFeed = [
      ...recentRegistrations.map(reg => ({
        text: `${reg.participantId?.fullName || 'Un participant'} s'est inscrit à "${reg.eventId?.title || 'un événement'}"`,
        time: reg.createdAt,
        color: 'emerald'
      })),
      ...recentInstitutions.map(inst => ({
        text: `Nouvelle institution : ${inst.name}${inst.status === 'pending' ? ' (en attente)' : ' (validée)'}`,
        time: inst.createdAt,
        color: 'blue'
      })),
      ...recentEvents.map(evt => ({
        text: `${evt.institutionId?.name || 'Une institution'} a créé "${evt.title}"`,
        time: evt.createdAt,
        color: 'purple'
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

    // Format relative time
    activityFeed.forEach(item => {
      const diffMs = Date.now() - new Date(item.time).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) item.timeLabel = "À l'instant";
      else if (diffMin < 60) item.timeLabel = `Il y a ${diffMin} min`;
      else if (diffMin < 1440) item.timeLabel = `Il y a ${Math.floor(diffMin / 60)}h`;
      else item.timeLabel = `Il y a ${Math.floor(diffMin / 1440)}j`;
    });

    res.json({
      kpis: {
        totalInstitutions,
        totalUsers,
        totalEvents,
        totalRevenue
      },
      topInstitutions: topInstitutions.slice(0, 5),
      pendingItems,
      activeEvents: activeEventsFormatted,
      activityFeed
    });
  } catch (error) {
    console.error('Dashboard Super Admin error:', error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Obtenir les statistiques du tableau de bord Institution
// @route   GET /api/dashboard/institution
// @access  Private (Admin Institution, etc.)
const getInstitutionDashboard = async (req, res) => {
  try {
    const institutionId = req.user.institutionId;
    if (!institutionId) {
      return res.status(403).json({ message: "Vous n'êtes rattaché à aucune institution." });
    }

    const totalEvents = await Event.countDocuments({ institutionId });
    const publishedEvents = await Event.countDocuments({ institutionId, status: 'published' });
    
    // Obtenir tous les événements de cette institution
    const eventIds = await Event.find({ institutionId }).select('_id');
    const ids = eventIds.map(e => e._id);
    
    const totalRegistrations = await Registration.countDocuments({ eventId: { $in: ids } });
    const pendingRegistrations = await Registration.countDocuments({ eventId: { $in: ids }, status: 'pending' });
    
    const institutionPayments = await Payment.aggregate([
      { $match: { eventId: { $in: ids }, status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalEvents,
      publishedEvents,
      totalRegistrations,
      pendingRegistrations,
      totalRevenue: institutionPayments.length > 0 ? institutionPayments[0].total : 0
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Obtenir les statistiques du tableau de bord Participant
// @route   GET /api/dashboard/participant
// @access  Private (Participant)
const getParticipantDashboard = async (req, res) => {
  try {
    const participantId = req.user._id;

    // 1. Stats
    const totalRegistrations = await Registration.countDocuments({ participantId });
    const pendingRegistrations = await Registration.countDocuments({ participantId, status: 'pending' });
    const totalBadges = await Badge.countDocuments({ participantId });
    
    // Inscriptions (populate event info)
    const myRegistrations = await Registration.find({ participantId })
      .populate({
        path: 'eventId',
        select: 'title startDate location status coverImage categoryId',
        populate: [
          { path: 'institutionId', select: 'name' },
          { path: 'categoryId', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 });

    const upcomingEvents = myRegistrations
      .filter(reg => reg.eventId && new Date(reg.eventId.startDate) >= new Date())
      .slice(0, 5)
      .map(reg => ({
        id: reg.eventId._id,
        title: reg.eventId.title,
        institution: reg.eventId.institutionId?.name || 'Inconnu',
        date: reg.eventId.startDate,
        location: reg.eventId.location,
        status: reg.status,
        category: reg.eventId.categoryId?.name || 'Événement',
      }));

    // Badges
    const recentBadges = await Badge.find({ participantId })
      .populate('eventId', 'title')
      .sort({ issuedAt: -1 })
      .limit(3);

    const formattedBadges = recentBadges.map(badge => ({
      id: badge._id,
      event: badge.eventId?.title || 'Événement',
      code: badge.badgeNumber,
      date: badge.issuedAt,
      status: badge.status === 'active' ? 'valid' : 'used'
    }));

    // Recommandations : Événements publiés où l'utilisateur n'est pas inscrit
    const myEventIds = myRegistrations.map(reg => reg.eventId?._id);
    const recommended = await Event.find({
      _id: { $nin: myEventIds },
      status: 'published',
      startDate: { $gte: new Date() }
    })
    .populate('institutionId', 'name')
    .populate('categoryId', 'name')
    .sort({ startDate: 1 })
    .limit(4);

    const formattedRecommended = recommended.map(evt => ({
      id: evt._id,
      title: evt.title,
      institution: evt.institutionId?.name || 'Inconnu',
      date: evt.startDate,
      category: evt.categoryId?.name || 'Divers',
      spots: evt.maxParticipants ? evt.maxParticipants : 'Illimité'
    }));

    res.json({
      stats: {
        totalRegistrations,
        pendingRegistrations,
        totalBadges,
        totalParticipations: totalBadges // Simplification pour l'instant
      },
      upcomingEvents,
      recentBadges: formattedBadges,
      recommendedEvents: formattedRecommended
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Obtenir les statistiques analytiques approfondies (Super Admin)
// @route   GET /api/dashboard/super-admin/analytics
// @access  Private (Super Admin)
const getSuperAdminAnalytics = async (req, res) => {
  try {
    // 1. Inscriptions et Croissance (Mocked time series for now, could be real aggregation)
    // We'll generate dynamic mock data based on the real total numbers to make it look realistic.
    const totalUsers = await User.countDocuments();
    const totalRegistrations = await Registration.countDocuments();

    // 2. Utilisateurs par rôle
    const rolesAggr = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    const roleColors = {
      'Participant': '#3b82f6',
      'Admin Institution': '#8b5cf6',
      'Super Admin': '#ef4444',
      'Agent de Contrôle': '#94a3b8',
      'Responsable Communication': '#f59e0b',
      'Gestionnaire d\'Inscriptions': '#22c55e'
    };
    
    const roleSegments = rolesAggr.map(r => ({
      label: r._id || 'Inconnu',
      value: r.count,
      color: roleColors[r._id] || '#cbd5e1'
    })).sort((a, b) => b.value - a.value);

    // 3. Revenus par plan d'abonnement (Mocked since subscriptions are not fully implemented in models yet)
    const revenueSegments = [
      { value: 12000000, color: '#3b82f6', label: 'Premium' },
      { value: 4500000, color: '#8b5cf6', label: 'Standard' },
      { value: 2000000, color: '#f59e0b', label: 'Ponctuels' },
    ];

    // 4. Top 5 événements par participation
    const activeEvents = await Event.find({ status: 'published' })
      .select('title institutionId')
      .populate('institutionId', 'acronym name')
      .lean();

    const topEvents = [];
    for (const evt of activeEvents) {
      const regCount = await Registration.countDocuments({ eventId: evt._id });
      topEvents.push({
        name: `${evt.title} (${evt.institutionId?.acronym || evt.institutionId?.name || 'Inconnu'})`,
        value: regCount
      });
    }
    topEvents.sort((a, b) => b.value - a.value);
    
    // 5. Couverture géographique (Group by city from Institution)
    const geoAggr = await Institution.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$city', institutions: { $sum: 1 } } }
    ]);
    
    const geoData = [];
    for (const g of geoAggr) {
      if (!g._id) continue;
      // Find events in this city
      const cityEvents = await Event.countDocuments({ city: g._id, status: 'published' });
      // Find users in this city
      const cityUsers = await User.countDocuments({ city: g._id });
      
      geoData.push({
        prefecture: g._id,
        institutions: g.institutions,
        events: cityEvents,
        users: cityUsers
      });
    }
    geoData.sort((a, b) => b.users - a.users);

    const totalEvents = await Event.countDocuments();
    const totalInstitutions = await Institution.countDocuments({ status: { $in: ['active', 'pending'] } });
    const totalPaymentsAmount = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalPaymentsAmount.length > 0 ? totalPaymentsAmount[0].total : 0;

    res.json({
      roleSegments,
      revenueSegments,
      topEvents: topEvents.slice(0, 5),
      geoData: geoData.length > 0 ? geoData : [
        { prefecture: 'Conakry', institutions: 0, events: 0, users: 0 }
      ],
      totalRegistrations,
      totalUsers,
      totalEvents,
      totalInstitutions,
      totalRevenue
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

module.exports = { getSuperAdminDashboard, getInstitutionDashboard, getParticipantDashboard, getSuperAdminAnalytics };
