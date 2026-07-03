/**
 * Script pour créer un Super Admin dans la base de données.
 * Usage: node scripts/createSuperAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

const MONGO_URI = process.env.MONGO_URI;

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    const email = 'africode230@gmail.com';
    
    // Vérifier si le user existe déjà
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('⚠️  Un utilisateur avec cet email existe déjà.');
      console.log(`   Rôle actuel: ${existing.role}`);
      // Mettre à jour le rôle en Super Admin si nécessaire
      if (existing.role !== 'Super Admin') {
        existing.role = 'Super Admin';
        await existing.save();
        console.log('✅ Rôle mis à jour en Super Admin !');
      } else {
        console.log('✅ Déjà Super Admin, rien à faire.');
      }
      await mongoose.disconnect();
      return;
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash('Mamann55', 12);

    const superAdmin = await User.create({
      fullName: 'Super Administrateur',
      email: email,
      phone: '+224000000000',
      passwordHash: passwordHash,
      role: 'Super Admin',
      isPhoneVerified: true,
      isActive: true,
      city: 'Conakry'
    });

    console.log('🎉 Super Admin créé avec succès !');
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Mot de passe: Mamann55`);
    console.log(`   Rôle: ${superAdmin.role}`);
    console.log(`   ID: ${superAdmin._id}`);

    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createSuperAdmin();
