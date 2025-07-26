const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

class RateLimitingService {
  constructor() {
    this.redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    });
  }
  
  createGeneralLimiter() {
    return rateLimit({
      store: new RedisStore({
        client: this.redisClient,
        prefix: 'rl:general:'
      }),
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }
  
  createResumeAnalysisLimiter() {
    return rateLimit({
      store: new RedisStore({
        client: this.redisClient,
        prefix: 'rl:resume:'
      }),
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // Limit resume analysis to 10 per hour per IP
      message: {
        error: 'Resume analysis limit exceeded. Please try again in an hour.',
        retryAfter: '1 hour'
      },
      skip: (req) => {
        // Skip rate limiting for authenticated users with premium accounts
        return req.user && req.user.accountType === 'premium';
      }
    });
  }
  
  createTrendsDataLimiter() {
    return rateLimit({
      store: new RedisStore({
        client: this.redisClient,
        prefix: 'rl:trends:'
      }),
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 50, // Limit trends requests to 50 per 5 minutes
      message: {
        error: 'Trends data request limit exceeded. Please try again in 5 minutes.',
        retryAfter: '5 minutes'
      }
    });
  }
  
  createAuthLimiter() {
    return rateLimit({
      store: new RedisStore({
        client: this.redisClient,
        prefix: 'rl:auth:'
      }),
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // Limit auth attempts to 5 per 15 minutes
      message: {
        error: 'Too many authentication attempts. Please try again later.',
        retryAfter: '15 minutes'
      }
    });
  }
}

module.exports = RateLimitingService;