const PDFDocument = require('pdfkit');

const generateBadgePDF = (badgeData, stream) => {
  return new Promise((resolve, reject) => {
    try {
      // Création du document PDF (format badge/carte)
      const doc = new PDFDocument({
        size: [250, 400], // Taille personnalisée type badge
        margins: { top: 20, bottom: 20, left: 20, right: 20 }
      });

      doc.pipe(stream);

      // Fond et bordure
      doc.rect(0, 0, 250, 400).fill('#F8F9FA');
      doc.rect(5, 5, 240, 390).stroke('#0B5ED7');

      // Titre EventTrust GN
      doc.fillColor('#0B5ED7')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('EventTrust GN', { align: 'center' });
      
      doc.moveDown(0.5);

      // Titre de l'événement
      doc.fillColor('#333333')
         .fontSize(12)
         .font('Helvetica')
         .text(badgeData.eventTitle, { align: 'center', height: 40 });

      doc.moveDown(1);

      // Informations du participant
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text(badgeData.participantName, { align: 'center' });

      doc.fontSize(10)
         .font('Helvetica')
         .text(`Billet : ${badgeData.badgeCode}`, { align: 'center' });

      doc.moveDown(1);

      // Insertion du QR Code
      // qrcode.toDataURL renvoie une chaine "data:image/png;base64,..."
      // On doit extraire uniquement la partie base64
      const qrImageBuffer = Buffer.from(badgeData.qrCodeData.split(',')[1], 'base64');
      
      // On centre le QR code (taille 100x100)
      doc.image(qrImageBuffer, (250 - 100) / 2, doc.y, { width: 100, height: 100 });

      doc.moveDown(8);

      // Pied de page
      doc.fontSize(8)
         .fillColor('#666666')
         .text('Ce badge est personnel et non cessible.', { align: 'center' });
      
      doc.text('Présentez le QR Code à l\'entrée.', { align: 'center' });

      doc.end();
      
      stream.on('finish', () => {
        resolve();
      });

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateBadgePDF };
