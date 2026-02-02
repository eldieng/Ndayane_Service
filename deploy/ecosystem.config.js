// Configuration PM2 pour Ndayane Services
// À utiliser avec: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'ndayane-backend',
      cwd: '/var/www/ndayane/backend',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'ndayane-frontend',
      cwd: '/var/www/ndayane/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
