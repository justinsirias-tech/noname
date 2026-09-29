require('dotenv').config();

const TLS_API_URL = (process.env.TLS_API_URL || 'https://apptest.thatlaundryshop.com').replace(/\/+$/, '');
const TLS_API_KEY = process.env.TLS_API_KEY || 'nl_api_key_live_9988776655';
const TLS_BRAND = process.env.TLS_BRAND || 'noname_laundry';

console.log(`[TLS-PROXY] Initialized with Target: ${TLS_API_URL} (Brand: ${TLS_BRAND})`);

/**
 * Universal fetch wrapper to call TLS External API
 */
async function callTlsApi(endpointPath, options = {}) {
  const cleanPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
  const url = `${TLS_API_URL}${cleanPath}`;

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': TLS_API_KEY,
    'x-brand': TLS_BRAND,
    ...(options.headers || {})
  };

  const fetchOptions = {
    method: options.method || 'GET',
    headers
  };

  if (options.body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(fetchOptions.method.toUpperCase())) {
    fetchOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, fetchOptions);
    const contentType = res.headers.get('content-type') || '';
    let data = null;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }
    return {
      status: res.status,
      ok: res.ok,
      data
    };
  } catch (err) {
    console.error(`[TLS-PROXY ERROR] ${options.method || 'GET'} ${url}:`, err.message);
    return {
      status: 502,
      ok: false,
      data: { error: `Failed to connect to TLS Backend (${err.message})` }
    };
  }
}

/**
 * Express router that proxies all /api/external/* requests to ${TLS_API_URL}/api/v1/external/*
 */
function createTlsProxyRouter() {
  const express = require('express');
  const router = express.Router();

  // Config status endpoint
  router.get('/status', (req, res) => {
    res.json({
      connected: true,
      targetUrl: TLS_API_URL,
      brand: TLS_BRAND,
      isProduction: !TLS_API_URL.includes('test') && !TLS_API_URL.includes('localhost')
    });
  });

  // Catch-all proxy for /api/external/*
  router.all('/*', async (req, res) => {
    const targetSubPath = req.params[0] ? `/${req.params[0]}` : '';
    const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const targetPath = `/api/v1/external${targetSubPath}${queryString}`;

    const forwardHeaders = {};
    if (req.headers.authorization) {
      forwardHeaders['Authorization'] = req.headers.authorization;
    }

    const result = await callTlsApi(targetPath, {
      method: req.method,
      headers: forwardHeaders,
      body: req.body
    });

    res.status(result.status).json(result.data);
  });

  return router;
}

module.exports = {
  TLS_API_URL,
  TLS_API_KEY,
  TLS_BRAND,
  callTlsApi,
  createTlsProxyRouter
};
