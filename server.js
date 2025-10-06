require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const app = express();
// Import database connection
const connectDB = require('./config/database');

// Import routes
const routes = require('./src');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import logger
const logger = require('./utils/logger');

// Initialize Express app


// Connect to database
connectDB();


// CORS configuration
app.use(cors());

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if ('development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// // Rate limiting
// const limiter = rateLimit({
//   windowMs:  15 * 60 * 1000, // 15 minutes
//   max:  100, // limit each IP to 100 requests per windowMs
//   message: {
//     success: false,
//     message: 'Too many requests from this IP, please try again later.',
//     timestamp: new Date().toISOString()
//   },
//   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// });

app.use('/api/');

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Request received', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// API routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Node.js API Structure',
    version: '1.0.0',
    documentation: '/api',
    health: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on(3009, () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection', {
    error: err.message,
    stack: err.stack,
    promise: promise
  });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

// Start server
const PORT = 3009;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${'development'} mode on port ${PORT}`);
  logger.info(`API Documentation: http://localhost:${PORT}/api`);
  logger.info(`Health Check: http://localhost:${PORT}/api/health`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

module.exports = app;
