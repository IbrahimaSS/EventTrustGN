const axios = require('axios');

// Simulation de l'intégration Lengo Pay pour le MVP (mode développement)
const initiatePayment = async (amount, currency, phone, callbackUrl) => {
  // Si nous avions l'API réelle Lengo Pay :
  /*
  const response = await axios.post(`${process.env.LENGO_PAY_BASE_URL}/initiate`, {
    amount,
    currency,
    phone,
    callbackUrl
  }, {
    headers: { 'Authorization': `Bearer ${process.env.LENGO_PAY_API_KEY}` }
  });
  return response.data;
  */

  // Pour le MVP : Simulation immédiate
  console.log(`[SIMULATION LENGO PAY] Initiation paiement de ${amount} ${currency} pour ${phone}`);
  return {
    success: true,
    transactionId: `LENGO-${Date.now().toString(36).toUpperCase()}`,
    paymentUrl: "https://sandbox.lengo.pay/simulate-payment", // URL factice
    status: "pending"
  };
};

module.exports = { initiatePayment };
