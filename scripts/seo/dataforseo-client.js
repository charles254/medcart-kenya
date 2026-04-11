/**
 * DataForSEO API Client
 * Shared client for all SEO scripts
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const https = require('https');

const LOGIN = process.env.DATAFORSEO_LOGIN;
const PASSWORD = process.env.DATAFORSEO_PASSWORD;
const BASE_URL = 'api.dataforseo.com';

if (!LOGIN || !PASSWORD) {
  console.error('ERROR: Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in .env');
  process.exit(1);
}

const AUTH = Buffer.from(`${LOGIN}:${PASSWORD}`).toString('base64');

function apiRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path: `/v3/${path}`,
      method: method,
      headers: {
        'Authorization': `Basic ${AUTH}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status_code === 20000) {
            resolve(json);
          } else {
            reject(new Error(`API Error ${json.status_code}: ${json.status_message}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(60000, () => { req.destroy(); reject(new Error('Request timeout')); });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function get(path) { return apiRequest('GET', path); }
function post(path, body) { return apiRequest('POST', path, body); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

module.exports = { get, post, sleep, LOGIN };
