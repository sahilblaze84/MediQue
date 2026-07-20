const http = require('http');
const https = require('https');

/**
 * Start the Keep-Alive service to periodically ping the server and keep it active 24/7.
 * Prevents sleeping on free tier platforms like Render, Railway, Glitch, etc.
 * 
 * @param {number|string} port Default port if SERVER_URL is not set
 */
function startKeepAlive(port = 5000) {
  const isKeepAliveEnabled = process.env.KEEP_ALIVE !== 'false';
  if (!isKeepAliveEnabled) {
    console.log('[Keep-Alive] Service disabled via environment variable KEEP_ALIVE=false');
    return;
  }

  const intervalMinutes = parseInt(process.env.PING_INTERVAL_MINUTES, 10) || 10;
  const intervalMs = intervalMinutes * 60 * 1000;

  // Determine external or local URL
  const serverUrl = process.env.SERVER_URL || `http://localhost:${port}`;
  const healthEndpoint = `${serverUrl.replace(/\/$/, '')}/api/health`;

  console.log(`[Keep-Alive] Service activated.`);
  console.log(`[Keep-Alive] Target URL: ${healthEndpoint}`);
  console.log(`[Keep-Alive] Interval: Every ${intervalMinutes} minute(s)`);

  const pingServer = () => {
    const isHttps = healthEndpoint.startsWith('https');
    const client = isHttps ? https : http;

    const req = client.get(healthEndpoint, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[Keep-Alive Ping] SUCCESS (${new Date().toLocaleTimeString()}) - Status: ${res.statusCode}`);
        } else {
          console.warn(`[Keep-Alive Ping] WARNING (${new Date().toLocaleTimeString()}) - Status: ${res.statusCode}`);
        }
      });
    });

    req.on('error', (err) => {
      console.error(`[Keep-Alive Ping] ERROR (${new Date().toLocaleTimeString()}): ${err.message}`);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.warn(`[Keep-Alive Ping] TIMEOUT (${new Date().toLocaleTimeString()})`);
    });
  };

  // Perform first ping after 30 seconds
  const initialTimeout = setTimeout(pingServer, 30000);

  // Set recurring interval
  const intervalId = setInterval(pingServer, intervalMs);

  return {
    stop: () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
      console.log('[Keep-Alive] Service stopped.');
    }
  };
}

module.exports = { startKeepAlive };
