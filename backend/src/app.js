const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Middlewares globaux
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Route de base (Santé)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API EventTrust GN fonctionnelle' });
});

// Importation des routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/otp', require('./routes/otp.routes'));
app.use('/api/institutions', require('./routes/institution.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/events', require('./routes/event.routes'));
app.use('/api/registrations', require('./routes/registration.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/subscriptions', require('./routes/subscription.routes'));
app.use('/api/badges', require('./routes/badge.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/scans', require('./routes/scan.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/moderation', require('./routes/moderation.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/search', require('./routes/search.routes'));
app.use('/api/verify', require('./routes/verify.routes'));
app.use('/api/settings', require('./routes/settings.routes'));

// Middleware d'erreur global (doit être le dernier)
app.use(errorHandler);

module.exports = app;
