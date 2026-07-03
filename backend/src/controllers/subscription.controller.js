const Subscription = require('../models/Subscription');
const Institution = require('../models/Institution');
const Log = require('../models/Log');

// @desc    Lister tous les abonnements (Super Admin)
// @route   GET /api/subscriptions/admin/all
// @access  Private (Super Admin)
const getAllSubscriptionsAdmin = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('institutionId', 'name type email phone')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = subscriptions.map(sub => ({
      id: sub._id,
      institution: sub.institutionId?.name || 'Institution Inconnue',
      type: sub.institutionId?.type || 'N/A',
      email: sub.institutionId?.email || 'N/A',
      phone: sub.institutionId?.phone || 'N/A',
      plan: sub.plan,
      amount: sub.amount,
      date: new Date(sub.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: sub.status,
      nextBilling: sub.nextBilling ? new Date(sub.nextBilling).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
      method: sub.method,
      autoRenew: sub.autoRenew
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Créer un nouvel abonnement manuellement
// @route   POST /api/subscriptions/admin
// @access  Private (Super Admin)
const createSubscriptionAdmin = async (req, res) => {
  try {
    const { institutionName, plan, method, amount } = req.body;
    
    // We would normally look up the institution by ID. 
    // For manual creation with a name, we can try to find it or create a placeholder.
    let inst = await Institution.findOne({ name: { $regex: new RegExp(`^${institutionName}$`, 'i') } });
    if (!inst) {
      // Create a placeholder institution if it doesn't exist
      inst = await Institution.create({
        name: institutionName,
        type: 'Non spécifié',
        city: 'Non spécifié',
        email: 'contact@nouveau.gn',
        phone: '+224 600 00 00 00',
        status: 'active'
      });
    }

    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const subscription = await Subscription.create({
      institutionId: inst._id,
      plan,
      amount,
      method,
      status: 'paid',
      autoRenew: plan !== 'Gratuit',
      nextBilling: plan !== 'Gratuit' ? nextBillingDate : null
    });

    res.status(201).json({ message: "Transaction créée.", subscription });
  } catch (error) {
    if(error.code === 11000) return res.status(400).json({ message: "Cette institution a déjà un abonnement. Utilisez le bouton 'Modifier'."});
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Mettre à jour le statut/plan d'un abonnement
// @route   PATCH /api/subscriptions/admin/:id
// @access  Private (Super Admin)
const updateSubscriptionAdmin = async (req, res) => {
  try {
    const { action, plan, amount } = req.body; // action can be 'suspend', 'mark_paid', 'change_plan'
    const subscription = await Subscription.findById(req.params.id).populate('institutionId', 'name');
    
    if (!subscription) return res.status(404).json({ message: "Abonnement introuvable." });

    if (action === 'suspend') {
      subscription.status = 'failed';
    } else if (action === 'mark_paid') {
      subscription.status = 'paid';
    } else if (action === 'change_plan') {
      subscription.plan = plan;
      subscription.amount = amount;
      subscription.autoRenew = plan !== 'Gratuit';
    }

    await subscription.save();

    await Log.create({
      userId: req.user._id,
      institutionId: subscription.institutionId._id,
      action: `Mise à jour abonnement`,
      description: `Action: ${action} sur l'abonnement de ${subscription.institutionId.name}`,
      ipAddress: req.ip || 'Inconnue'
    });

    res.json({ message: "Abonnement mis à jour.", subscription });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Supprimer un abonnement
// @route   DELETE /api/subscriptions/admin/:id
// @access  Private (Super Admin)
const deleteSubscriptionAdmin = async (req, res) => {
  try {
    await Subscription.findByIdAndDelete(req.params.id);
    res.json({ message: "Abonnement supprimé." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Envoyer un rappel
// @route   POST /api/subscriptions/admin/:id/remind
// @access  Private (Super Admin)
const remindSubscriptionAdmin = async (req, res) => {
  try {
    // Fausse route d'envoi d'email
    res.json({ message: "Rappel envoyé avec succès à l'institution." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

module.exports = { getAllSubscriptionsAdmin, createSubscriptionAdmin, updateSubscriptionAdmin, deleteSubscriptionAdmin, remindSubscriptionAdmin };
