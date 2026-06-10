module.exports = {
  apps: [{
    name: 'marconis-barbershop',
    script: 'backend/src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024',
    watch: false,
    ignore_watch: [
      "node_modules",
      "logs",
      "*.log"
    ]
  }],

  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'https://github.com/mkorne/marconis-barbershop.git',
      path: '/var/www/marconis-barbershop',
      'pre-deploy-local': '',
      'post-deploy': 'cd backend && npm install && npx prisma generate && npx prisma migrate deploy && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
