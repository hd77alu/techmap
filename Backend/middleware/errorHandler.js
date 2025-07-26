const winston = require('winston');

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'techmap-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

class ErrorHandler {
  static handleAsync(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
  
  static globalErrorHandler(err, req, res, next) {
    // Log the error
    logger.error('Global error handler caught:', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    });
    
    // Determine error type and response
    const errorResponse = ErrorHandler.categorizeError(err);
    
    // Send appropriate response
    res.status(errorResponse.status).json({
      success: false,
      error: {
        message: errorResponse.message,
        code: errorResponse.code,
        timestamp: new Date().toISOString(),
        requestId: req.id || 'unknown'
      },
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
  
  static categorizeError(err) {
    // Database errors
    if (err.code === 'SQLITE_CONSTRAINT') {
      return {
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Data validation failed. Please check your input.'
      };
    }
    
    if (err.code === 'SQLITE_BUSY') {
      return {
        status: 503,
        code: 'DATABASE_BUSY',
        message: 'Database is temporarily unavailable. Please try again.'
      };
    }
    
    // API rate limiting errors
    if (err.name === 'RateLimitError') {
      return {
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.'
      };
    }
    
    // External API errors
    if (err.name === 'ExternalAPIError') {
      return {
        status: 502,
        code: 'EXTERNAL_SERVICE_ERROR',
        message: 'External service temporarily unavailable.'
      };
    }
    
    // Validation errors
    if (err.name === 'ValidationError') {
      return {
        status: 400,
        code: 'VALIDATION_ERROR',
        message: err.message || 'Invalid input data.'
      };
    }
    
    // Authentication errors
    if (err.name === 'UnauthorizedError') {
      return {
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Authentication required.'
      };
    }
    
    // Default server error
    return {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again.'
    };
  }
  
  static notFoundHandler(req, res) {
    res.status(404).json({
      success: false,
      error: {
        message: 'Resource not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Custom error classes
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

class ExternalAPIError extends Error {
  constructor(message, service = null, statusCode = null) {
    super(message);
    this.name = 'ExternalAPIError';
    this.service = service;
    this.statusCode = statusCode;
  }
}

class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

module.exports = {
  ErrorHandler,
  ValidationError,
  ExternalAPIError,
  RateLimitError,
  logger
};