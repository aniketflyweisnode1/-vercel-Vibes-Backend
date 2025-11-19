const axios = require('axios');
const logger = require('./logger');

// Get credentials from environment variables or use defaults for development
const ESCROW_API_EMAIL = 'bezeju@yahoo.com';
const ESCROW_API_KEY = 'VVJyo2dcWAaXy6hRlyI9T7QPd54FkaSmCFdFZR4y1pekGtw6OvH11Q';
const ESCROW_API_BASE_URL = 'https://api.escrow-sandbox.com/2017-09-01';

const baseURL = ESCROW_API_BASE_URL.replace(/\/+$/, '');
const username = ESCROW_API_EMAIL;
const password = ESCROW_API_KEY;

const timeout = parseInt(process.env.ESCROW_API_TIMEOUT || '30000', 10);

const ensureCredentials = () => {
  if (!username || !password) {
    const error = new Error('Escrow API credentials are not configured. Please set ESCROW_API_EMAIL and ESCROW_API_KEY environment variables.');
    error.statusCode = 500;
    throw error;
  }
  
  // Log warning if using default credentials (for development)
  if (!process.env.ESCROW_API_EMAIL || !process.env.ESCROW_API_KEY) {
    logger.warn('Using default Escrow API credentials. For production, set ESCROW_API_EMAIL and ESCROW_API_KEY environment variables.');
  }
};

const client = axios.create({
  baseURL,
  timeout,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  auth: {
    username,
    password
  }
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const statusCode = error.response?.status || 500;
    let message = error.response?.data?.message || error.response?.data?.error || error.message || 'Escrow API request failed';

    // Provide more helpful error messages for common issues
    if (statusCode === 401) {
      message = 'Escrow API authentication failed. Please check your ESCROW_API_EMAIL and ESCROW_API_KEY credentials.';
    } else if (statusCode === 403) {
      message = 'Escrow API access forbidden. Please check your API key permissions.';
    } else if (statusCode === 404) {
      message = 'Escrow API resource not found.';
    } else if (statusCode === 422) {
      message = error.response?.data?.message || 'Escrow API validation error. Please check your request data.';
    }

    logger.error('Escrow API error', {
      statusCode,
      message,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      data: error.response?.data,
      // Don't log credentials, but log if they're missing
      hasCredentials: !!(username && password)
    });

    const err = new Error(message);
    err.statusCode = statusCode;
    err.details = error.response?.data;
    throw err;
  }
);

const callEscrow = async ({ method = 'get', url, data, params, asCustomer, headers = {} }) => {
  ensureCredentials();

  const requestHeaders = { ...headers };

  if (asCustomer) {
    requestHeaders['As-Customer'] = asCustomer;
  }

  try {
    const response = await client.request({
      method,
      url,
      data,
      params,
      headers: requestHeaders
    });
    return response;
  } catch (error) {
    // Log additional debugging info for auth errors
    if (error.statusCode === 401) {
      logger.error('Escrow API Authentication Failed', {
        url: `${baseURL}${url}`,
        method,
        hasEmail: !!username,
        hasKey: !!password,
        emailPrefix: username ? username.substring(0, 5) + '...' : 'missing',
        keyPrefix: password ? password.substring(0, 5) + '...' : 'missing'
      });
    }
    throw error;
  }
};

module.exports = {
  callEscrow
};


