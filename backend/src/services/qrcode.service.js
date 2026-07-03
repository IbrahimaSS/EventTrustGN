const QRCode = require('qrcode');

const generateEventQRCode = async (eventCode) => {
  try {
    const url = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify/event/${eventCode}`;
    // Génère une image en Data URI (base64)
    const qrCodeDataURI = await QRCode.toDataURL(url);
    return qrCodeDataURI;
  } catch (err) {
    console.error("Erreur lors de la génération du QR Code:", err);
    throw new Error("Génération de QR Code impossible.");
  }
};

module.exports = { generateEventQRCode };
