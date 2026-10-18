const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const db = require('./db');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const authRoutes = require('./routes/authRoutes');
const { seedData } = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for development
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Campus Event Portal REST API Server is running',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend in production build if dist directory exists
const frontendDistDir = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistDir));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(frontendDistDir, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('Campus Event REST API Server running on port ' + PORT + '. Run React frontend on port 3000.');
  }
});

// Start Server & Seed Initial Data (only when running directly, not on Vercel)
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 [Server] Campus Event REST API listening on http://0.0.0.0:${PORT}`);
    try {
      await db.connectDB();
      await seedData();
    } catch (err) {
      console.error('Error seeding initial data:', err);
    }
  });
}

// Initialize DB connection for serverless environments only. When this file is
// run directly, the app.listen callback below owns initialization so the
// connection and seed process are not started twice.
const initServerless = async () => {
  try {
    await db.connectDB();
    await seedData();
  } catch (err) {
    console.error('Error initializing serverless DB:', err);
  }
};

if (require.main !== module) {
  initServerless();
}

module.exports = app;
