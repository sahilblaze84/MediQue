module.exports = {
  apps: [
    {
      name: 'medique-backend',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        KEEP_ALIVE: 'true',
        PING_INTERVAL_MINUTES: 10
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        KEEP_ALIVE: 'true',
        PING_INTERVAL_MINUTES: 10
      },
      restart_delay: 3000,
      max_restarts: 10
    },
    {
      name: 'medique-tunnel',
      script: 'services/tunnelManager.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      restart_delay: 5000,
      max_restarts: 999
    }
  ]
};

