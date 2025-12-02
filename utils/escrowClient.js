const axios = require('axios');
const logger = require('./logger');

const ESCROW_API_BASE_URL = ('https://api.escrow.com/2017-09-01').replace(/\/+$/, '');
const ESCROW_API_KEY = "node1@flyweis.technology";
const ESCROW_API_SECRET = "18340_qVh8kYZrWgwgN5uBZR7Tl8L4adRKsA49lEyMUaRCyILIlrSnFYu8wfQalWFh60Ph";
const ESCROW_API_TIMEOUT = parseInt('30000', 10);

const ensureCredentials = () => {
  if (!ESCROW_API_KEY || !ESCROW_API_SECRET) {
    const error = new Error('Escrow.com credentials are missing. Please configure ESCROW_API_KEY and ESCROW_API_SECRET.');
    error.statusCode = 500;
    throw error;
  }
};

const client = axios.create({
  baseURL: ESCROW_API_BASE_URL,
  timeout: ESCROW_API_TIMEOUT,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  auth: {
    username: ESCROW_API_KEY || '',
    password: ESCROW_API_SECRET || ''
  }
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'Escrow.com API request failed';

    logger.error('Escrow.com API error', {
      statusCode,
      message,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      data: error.response?.data
    });

    const err = new Error(message);
    err.statusCode = statusCode;
    err.details = error.response?.data;
    throw err;
  }
);

const callEscrow = async ({ method = 'get', url, params, data, headers = {}, idempotencyKey }) => {
  ensureCredentials();

  const requestHeaders = { ...headers };

  if (idempotencyKey) {
    requestHeaders['Idempotency-Key'] = idempotencyKey;
  }

  return client.request({
    method,
    url,
    params,
    data,
    headers: requestHeaders
  });
};

module.exports = {
  callEscrow
};


