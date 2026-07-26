const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

dotenv.config();

// Require JWT_SECRET in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is missing in production mode!');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

// Security Headers & CORS
app.use(helmet({ contentSecurityPolicy: false })); // Allow WebRTC & media streams
app.use(
  cors({
    origin: '*',
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Database
connectDB();

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
const setupSocket = require('./services/socketHandler');
setupSocket(io);

// Attach io instance to all requests for controller real-time emits
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Auto-seed Demo Data function
const seedDemoData = require('./config/seedData');
seedDemoData();

// API Rate Limiting & Routes (Supporting /api and /api/v1 namespaces)
const { apiLimiter } = require('./middleware/rateLimiter');
app.use('/api', apiLimiter);

const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Mount routes under /api and /api/v1
const mountRoutes = (prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/doctors`, doctorRoutes);
  app.use(`${prefix}/appointments`, appointmentRoutes);
  app.use(`${prefix}/admin`, adminRoutes);
  app.use(`${prefix}/ai`, aiRoutes);
  app.use(`${prefix}/payments`, paymentRoutes);
};

mountRoutes('/api');
mountRoutes('/api/v1');

// Health check endpoint
app.get(['/api/health', '/api/v1/health'], (req, res) => {
  res.json({
    status: 'OK',
    service: 'MediConnect Telehealth API Server v1.0',
    timestamp: new Date()
  });
});

// Centralized Error Handler Middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Production Single-Package Static App Serving
const distPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[MediConnect Server] Running on http://localhost:${PORT}`);
});
