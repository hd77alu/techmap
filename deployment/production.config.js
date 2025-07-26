module.exports = {
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    environment: 'production'
  },
  
  database: {
    path: process.env.DB_PATH || '/var/lib/techmap/database.db',
    backup: {
      enabled: true,
      interval: '0 2 * * *', // Daily at 2 AM
      retention: 30, // Keep 30 days of backups
      location: '/var/backups/techmap'
    },
    optimization: {
      wal_mode: true,
      cache_size: 20000,
      mmap_size: 536870912, // 512MB
      synchronous: 'NORMAL'
    }
  },
  
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
          scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://api.github.com", "https://api.stackexchange.com"]
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true
    }
  },
  
  logging: {
    level: 'info',
    format: 'json',
    transports: [
      {
        type: 'file',
        filename: '/var/log/techmap/app.log',
        maxsize: 10485760, // 10MB
        maxFiles: 5
      },
      {
        type: 'file',
        level: 'error',
        filename: '/var/log/techmap/error.log',
        maxsize: 10485760,
        maxFiles: 5
      }
    ]
  },
  
  monitoring: {
    healthCheck: {
      enabled: true,
      endpoint: '/health',
      interval: 30000
    },
    metrics: {
      enabled: true,
      endpoint: '/metrics',
      collectDefaultMetrics: true
    }
  },
  
  cache: {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: 0,
      keyPrefix: 'techmap:',
      ttl: 3600 // Default TTL of 1 hour
    }
  }
};