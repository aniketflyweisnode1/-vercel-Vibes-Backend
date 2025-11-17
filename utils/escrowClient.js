const axios = require('axios');
const logger = require('./logger');

const DEFAULT_BASE_URL = 'https://api.escrow-sandbox.com/2017-09-01';
const baseURL = (process.env.ESCROW_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
const username = process.env.ESCROW_API_EMAIL;
const password = process.env.ESCROW_API_KEY;
const timeout = parseInt(process.env.ESCROW_API_TIMEOUT || '10000', 10);

const ensureCredentials = () => {
  if (!username || !password) {
    const error = new Error('Escrow API credentials are not configured. Please set ESCROW_API_EMAIL and ESCROW_API_KEY environment variables.');
    error.statusCode = 500;
    throw error;
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
    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Escrow API request failed';

    logger.error('Escrow API error', {
      statusCode,
      message,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data
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

  return client.request({
    method,
    url,
    data,
    params,
    headers: requestHeaders
  });
};

module.exports = {
  callEscrow
};


