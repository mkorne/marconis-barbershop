const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const { connectDatabase } = require('./config/database');
const logger = require('./config/logger');
const { socketHandler } = require('./services/socketService');
const chatbotService = require('./services/chatbotService');

// Import routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const serviceRoutes = require('./routes/services');
const paymentRoutesModule = require('./routes/payments');
const messagesRoutesModule = require('./routes/messages');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const imageRoutes = require('./routes/images');
const chatbotRoutes = require('./routes/chatbot');

const app = express();
const server = createServer(app);
// Allow multiple frontend origins (3000 for dev frontend, 3001 when served by backend)
const allowedOriginsEnv = process.env.FRONTEND_URL || process.env.FRONTEND_URLS || '';
const allowedOrigins = allowedOriginsEnv
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
if (allowedOrigins.length === 0) {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:3001');
}

console.log('✅ Configured CORS for origins:', allowedOrigins);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdn.socket.io", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "ws:", "wss:"],
      imgSrc: ["'self'", "data:", "https:", "http://res.cloudinary.com"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration supporting multiple origins
app.use(cors({
  origin: function(origin, callback) {
    // Allow non-browser clients with no Origin header (like curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Pass Socket.io instance to route modules that need real-time functionality
paymentRoutesModule.setSocketIO(io);
messagesRoutesModule.setSocketIO(io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutesModule.router);
app.use('/api/messages', messagesRoutesModule.router);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve static files from frontend/public
const frontendPath = path.join(__dirname, '../../frontend/public');
app.use(express.static(frontendPath));

// Serve main HTML file for all non-API routes
app.get('*', (req, res) => {
  // Don't serve HTML for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  
  // Check if index.html exists before serving
  const indexPath = path.join(frontendPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      logger.error('Error serving index.html:', err);
      res.status(404).json({ message: 'Frontend not found' });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ message: 'Internal server error' });
  } else {
    res.status(500).json({ 
      message: err.message,
      stack: err.stack 
    });
  }
});

// Socket.io connection handling
socketHandler(io);

// Database connection and server startup
const startServer = async () => {
  try {
    await connectDatabase();
    logger.info('Database connected successfully');
    
    // Initialize chatbot service
    await chatbotService.initialize();
    logger.info('Chatbot service initialized successfully');
    
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

startServer();

module.exports = app;
