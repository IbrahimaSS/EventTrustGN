require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Serveur EventTrust GN démarré sur le port ${PORT}`);
  });
}).catch((err) => {
  console.error("Échec de connexion à la base de données", err);
});
