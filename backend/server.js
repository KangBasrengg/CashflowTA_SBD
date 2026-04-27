const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDatabase } = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const transactionRoutes = require('./routes/transactions');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Cashflow API berjalan.' });
});

// Start server locally or export for Vercel
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  async function startServer() {
    try {
      await initDatabase();
      app.listen(PORT, () => {
        console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error('❌ Gagal memulai server:', error);
      process.exit(1);
    }
  }
  startServer();
}

module.exports = app;
