const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Load env vars (always resolve .env relative to this file, not CWD)
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { setupSocketHandlers } = require('./services/socketService');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');
const chatRoutes = require('./routes/chats');
const meetingRoutes = require('./routes/meetings');
const learnhubRoutes = require('./routes/learnhub');
const notificationRoutes = require('./routes/notifications');
const feedRoutes = require('./routes/feed');
const expertRoutes = require('./routes/experts');
const shopRoutes = require('./routes/shop');
const syncRoutes = require('./routes/sync');
const adminRoutes = require('./routes/admin');
const translateRoutes = require('./routes/translate');

// Initialize Express
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initSocket(server);
setupSocketHandlers(io);

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// Connect to MongoDB
connectDB();

// --------------- Middleware ---------------

// Security headers
app.use(helmet());

// CORS - allow mobile app connections
app.use(cors({
  origin: '*', // In production, restrict to your domain
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// HTTP request logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files (for any locally stored uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --------------- Routes ---------------
// --------------- Routes ---------------

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GoviConnect SL API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/learnhub', learnhubRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/translate', translateRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorHandler);

// --------------- Start Server ---------------

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n🚀 GoviConnect SL Backend Server`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Port: ${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Socket.io: ws://localhost:${PORT}\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥', err.name, err.message);
  // In production, close gracefully. In development, keep server alive.
  if (process.env.NODE_ENV === 'production') {
    server.close(() => {
      process.exit(1);
    });
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

module.exports = { app, server };
