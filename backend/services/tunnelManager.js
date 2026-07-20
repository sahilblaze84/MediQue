const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const dotenv = require('dotenv');

dotenv.config();

const PORT = parseInt(process.env.PORT || process.env.TUNNEL_PORT || 5000, 10);
const SUBDOMAIN = process.env.TUNNEL_SUBDOMAIN || undefined;
const URL_FILE_PATH = path.join(__dirname, '..', '.tunnel-url');

let currentTunnel = null;
let healthCheckInterval = null;
let retryCount = 0;
const MAX_RETRY_DELAY = 30000; // 30s max backoff

async function getLocalTunnelModule() {
  try {
    return require('localtunnel');
  } catch (err) {
    console.warn('[Tunnel Manager] localtunnel package not installed yet. Please run `npm install`.');
    return null;
  }
}

async function startTunnel() {
  const localtunnel = await getLocalTunnelModule();
  if (!localtunnel) {
    console.error('[Tunnel Manager] ERROR: Cannot start tunnel without localtunnel package.');
    process.exit(1);
  }

  console.log(`[Tunnel Manager] Starting persistent tunnel for local port ${PORT}...`);

  try {
    const opts = { port: PORT };
    if (SUBDOMAIN) {
      opts.subdomain = SUBDOMAIN;
    }

    currentTunnel = await localtunnel(opts);
    retryCount = 0; // reset retry counter on success

    const tunnelUrl = currentTunnel.url;
    console.log(`====================================================`);
    console.log(`[Tunnel Manager] TUNNEL LIVE AND ACTIVE: ${tunnelUrl}`);
    console.log(`====================================================`);

    // Save active URL to file
    fs.writeFileSync(URL_FILE_PATH, tunnelUrl, 'utf8');

    // Handle tunnel close / error events
    currentTunnel.on('close', () => {
      console.warn(`[Tunnel Manager] WARNING: Tunnel closed unexpectedly. Reconnecting...`);
      reconnect();
    });

    currentTunnel.on('error', (err) => {
      console.error(`[Tunnel Manager] ERROR in tunnel connection: ${err.message}`);
      reconnect();
    });

    // Start background Watchdog pinging the tunnel every 30 seconds
    startWatchdog(tunnelUrl);

  } catch (err) {
    console.error(`[Tunnel Manager] Failed to create tunnel: ${err.message}`);
    reconnect();
  }
}

function startWatchdog(tunnelUrl) {
  if (healthCheckInterval) clearInterval(healthCheckInterval);

  healthCheckInterval = setInterval(() => {
    if (!tunnelUrl) return;

    const healthUrl = `${tunnelUrl.replace(/\/$/, '')}/api/health`;
    const isHttps = healthUrl.startsWith('https');
    const client = isHttps ? https : http;

    const req = client.get(healthUrl, { headers: { 'Bypass-Tunnel-Reminder': 'true' } }, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 500) {
        console.log(`[Tunnel Watchdog] HEALTH OK - Status: ${res.statusCode}`);
      } else {
        console.warn(`[Tunnel Watchdog] HEALTH WARNING - Status: ${res.statusCode}. Triggering reconnect...`);
        reconnect();
      }
    });

    req.on('error', (err) => {
      console.error(`[Tunnel Watchdog] HEALTH ERROR: ${err.message}. Triggering reconnect...`);
      reconnect();
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.warn(`[Tunnel Watchdog] TIMEOUT. Triggering reconnect...`);
      reconnect();
    });
  }, 30000);
}

function reconnect() {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }

  if (currentTunnel) {
    try {
      currentTunnel.close();
    } catch (e) {
      // ignore cleanup errors
    }
    currentTunnel = null;
  }

  retryCount++;
  const delay = Math.min(1000 * Math.pow(2, Math.min(retryCount, 5)), MAX_RETRY_DELAY);
  console.log(`[Tunnel Manager] Reconnecting in ${delay / 1000} seconds (Attempt #${retryCount})...`);

  setTimeout(() => {
    startTunnel();
  }, delay);
}

// Handle process termination gracefully
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

function cleanup() {
  console.log('[Tunnel Manager] Stopping tunnel service...');
  if (healthCheckInterval) clearInterval(healthCheckInterval);
  if (currentTunnel) currentTunnel.close();
  if (fs.existsSync(URL_FILE_PATH)) fs.unlinkSync(URL_FILE_PATH);
  process.exit(0);
}

startTunnel();
