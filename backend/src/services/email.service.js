const axios = require('axios');

const sendEmailOTP = async (to, code) => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL || 'contact@eventtrust.gn';

  if (!brevoApiKey) {
    console.error('BREVO_API_KEY non définie dans les variables d\'environnement.');
    return false;
  } 
  
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'EventTrust GN', email: senderEmail },
        to: [{ email: to }],
        subject: 'Votre code de vérification EventTrust GN',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
            <h2>Bienvenue sur EventTrust GN</h2>
            <p>Votre code de vérification est :</p>
            <h1 style="color: #0B5ED7; letter-spacing: 5px; font-size: 32px; background: #f8fafc; padding: 10px; border-radius: 8px; display: inline-block;">${code}</h1>
            <p>Ce code est valable pour 10 minutes. Ne le partagez avec personne.</p>
          </div>
        `,
      },
      {
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
      }
    );
    
    console.log('Email envoyé via Brevo ! ID:', response.data.messageId);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email via Brevo :", error.response?.data || error.message);
    return false;
  }
};

const sendEmailWarning = async (to, subject, message) => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL || 'contact@eventtrust.gn';

  if (!brevoApiKey) {
    console.error('BREVO_API_KEY non définie dans les variables d\'environnement.');
    return false;
  } 
  
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'EventTrust GN Modération', email: senderEmail },
        to: [{ email: to }],
        subject: subject,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; color: #333;">
            <h2 style="color: #dc2626;">Avertissement de Modération</h2>
            <p style="font-size: 16px; margin-bottom: 20px;">${message}</p>
            <p style="font-size: 14px; color: #666;">Veuillez vous connecter à votre espace d'administration pour plus de détails.</p>
            <p style="font-size: 12px; color: #999; margin-top: 30px;">Ceci est un message automatique, merci de ne pas y répondre.</p>
          </div>
        `,
      },
      {
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
      }
    );
    
    console.log('Email avertissement envoyé ! ID:', response.data.messageId);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email d'avertissement :", error.response?.data || error.message);
    return false;
  }
};

module.exports = { sendEmailOTP, sendEmailWarning };
