const Payment = require('../models/Payment');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { initiatePayment } = require('../services/lengoPay.service');

// @desc    Initier un paiement pour une inscription
// @route   POST /api/payments/initiate
// @access  Private (Participant)
const startPayment = async (req, res) => {
  try {
    const { registrationId, phone } = req.body;

    const registration = await Registration.findById(registrationId).populate('eventId');
    if (!registration) {
      return res.status(404).json({ message: "Inscription non trouvée." });
    }

    if (registration.participantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Non autorisé." });
    }

    if (registration.paymentStatus === 'paid') {
      return res.status(400).json({ message: "Cette inscription est déjà payée." });
    }

    const event = registration.eventId;
    if (!event.paymentRequired) {
      return res.status(400).json({ message: "Cet événement est gratuit." });
    }

    // Appel à l'API Lengo Pay (simulée)
    const callbackUrl = `${process.env.CLIENT_URL}/api/payments/lengo/webhook`; // Le webhook réel devra être exposé sur internet (ex: ngrok)
    const lengoResponse = await initiatePayment(event.price, event.currency, phone, callbackUrl);

    if (lengoResponse.success) {
      const payment = await Payment.create({
        userId: req.user._id,
        eventId: event._id,
        registrationId: registration._id,
        amount: event.price,
        currency: event.currency,
        phone,
        providerReference: lengoResponse.transactionId,
        status: 'pending'
      });

      // Lier le paiement à l'inscription
      registration.paymentId = payment._id;
      await registration.save();

      res.status(201).json({
        message: "Paiement initié avec succès.",
        paymentUrl: lengoResponse.paymentUrl,
        paymentId: payment._id
      });
    } else {
      res.status(500).json({ message: "Le fournisseur de paiement a rejeté la demande." });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Webhook appelé par Lengo Pay quand le statut change
// @route   POST /api/payments/lengo/webhook
// @access  Public (Appelé par les serveurs Lengo Pay)
const lengoPayWebhook = async (req, res) => {
  try {
    const { transactionId, status, rawData } = req.body;

    // En production : vérifier la signature du webhook avec process.env.LENGO_PAY_WEBHOOK_SECRET

    const payment = await Payment.findOne({ providerReference: transactionId });
    if (!payment) {
      return res.status(404).json({ message: "Transaction inconnue." });
    }

    payment.status = status; // 'success', 'failed'
    payment.rawResponse = rawData || req.body;
    
    if (status === 'success') {
      payment.paidAt = Date.now();
      
      // Mettre à jour l'inscription correspondante
      const registration = await Registration.findById(payment.registrationId);
      if (registration) {
        registration.paymentStatus = 'paid';
        // Si l'événement accepte automatiquement après paiement :
        registration.status = 'accepted'; 
        await registration.save();
      }
    }
    
    await payment.save();
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Erreur Webhook Lengo Pay:", error);
    res.status(500).json({ error: "Erreur traitement webhook" });
  }
};

// @desc    Récupérer les paiements de l'utilisateur
// @route   GET /api/payments/me
// @access  Private
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
                                  .populate('eventId', 'title')
                                  .sort('-createdAt');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

module.exports = { startPayment, lengoPayWebhook, getMyPayments };
