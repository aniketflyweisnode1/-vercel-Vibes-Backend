require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const app = express();

// Database
const connectDB = require('./config/database');

// Routes
const routes = require('./src');

// Middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Connect DB
connectDB();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
}));

// Security
app.use(helmet());

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('dev'));

// Routes
app.use('/api', routes);

// Root
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Node.js API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404
app.use(notFound);

// Error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received');
  process.exit(0);
});

// Unhandled promise rejection
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection', err);
  process.exit(1);
});

// Uncaught exception
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', err);
  process.exit(1);
});

// Server
const PORT = 3009;
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} already in use`);
    process.exit(1);
  }
  throw error;
});

module.exports = app;
