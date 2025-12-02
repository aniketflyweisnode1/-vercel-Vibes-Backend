const axios = require('axios');
const logger = require('./logger');

// Infura / MetaMask credentials (https://docs.metamask.io/services/reference/gas-api/api-reference/)
const METAMASK_API_KEY = 'c4d44b1c0c964f27a98fee7372bddc81';
const INFURA_PROJECT_SECRET = 'VVJyo2dcWAaXy6hRlyI9T7QPd54FkaSmCFdFZR4y1pekGtw6OvH11Q';
const INFURA_NETWORK = 'mainnet';
const METAMASK_SERVICE = ('rpc').toLowerCase();
const RPC_API_BASE_URL = (`https://${INFURA_NETWORK}.infura.io/v3`).replace(/\/+$/, '');
const GAS_API_BASE_URL = ('https://gas.api.infura.io/v3').replace(/\/+$/, '');

const timeout = parseInt('30000', 10);

const ensureCredentials = () => {
  if (!METAMASK_API_KEY) {
    const error = new Error('Infura credentials are not configured. Please set INFURA_PROJECT_ID (and INFURA_PROJECT_SECRET if required).');
    error.statusCode = 500;
    throw error;
  }
};

const baseURL = (
  (METAMASK_SERVICE === 'gas'
    ? `${GAS_API_BASE_URL}/${METAMASK_API_KEY}`
    : `${RPC_API_BASE_URL}/${METAMASK_API_KEY}`)
).replace(/\/+$/, '');

const client = axios.create({
  baseURL,
  timeout,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  auth: METAMASK_API_KEY
    ? {
        username: METAMASK_API_KEY,
        password: INFURA_PROJECT_SECRET
      }
    : undefined
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const statusCode = error.response?.status || 500;
    let message = error.response?.data?.message || error.response?.data?.error || error.message || 'Infura (MetaMask) API request failed';

    // Provide more helpful error messages for common issues
    if (statusCode === 401) {
      message = 'Infura authentication failed. Please check your INFURA_PROJECT_ID and INFURA_PROJECT_SECRET.';
    } else if (statusCode === 403) {
      message = 'Infura access forbidden. Please check your project permissions.';
    } else if (statusCode === 404) {
      message = 'Infura resource not found.';
    } else if (statusCode === 422) {
      message = error.response?.data?.message || 'Infura API validation error. Please check your request data.';
    }

    logger.error('Infura (MetaMask) API error', {
      statusCode,
      message,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      data: error.response?.data,
      hasCredentials: !!METAMASK_API_KEY
    });

    const err = new Error(message);
    err.statusCode = statusCode;
    err.details = error.response?.data;
    throw err;
  }
);

const callMetamask = async ({ method = 'get', url, data, params, asCustomer, headers = {} }) => {
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
      logger.error('Infura (MetaMask) API Authentication Failed', {
        url: `${baseURL}${url}`,
        method,
        hasProjectId: !!METAMASK_API_KEY,
        hasSecret: !!INFURA_PROJECT_SECRET,
        projectIdPrefix: METAMASK_API_KEY ? METAMASK_API_KEY.substring(0, 5) + '...' : 'missing'
      });
    }
    throw error;
  }
};

module.exports = {
  callMetamask
};


