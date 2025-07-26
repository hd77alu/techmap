const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('./errorHandler');

class ValidationMiddleware {
  static validateRequest(req, res, next) {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }));
      
      throw new ValidationError('Validation failed', errorMessages);
    }
    
    next();
  }
  
  static resumeAnalysisValidation() {
    return [
      body('text')
        .isLength({ min: 100, max: 50000 })
        .withMessage('Resume text must be between 100 and 50,000 characters')
        .custom((value) => {
          // Check for suspicious content
          const suspiciousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i
          ];
          
          for (const pattern of suspiciousPatterns) {
            if (pattern.test(value)) {
              throw new Error('Resume contains potentially malicious content');
            }
          }
          
          return true;
        }),
      
      body('targetRole')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Target role must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s\-\/]+$/)
        .withMessage('Target role contains invalid characters'),
      
      body('analysisOptions')
        .optional()
        .isObject()
        .withMessage('Analysis options must be an object'),
      
      ValidationMiddleware.validateRequest
    ];
  }
  
  static trendsQueryValidation() {
    return [
      query('category')
        .optional()
        .isIn(['language', 'framework', 'tool', 'job_role', 'skill', 'all'])
        .withMessage('Invalid category'),
      
      query('timeRange')
        .optional()
        .isIn(['7d', '30d', '90d', '1y'])
        .withMessage('Invalid time range'),
      
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
      
      query('sortBy')
        .optional()
        .isIn(['popularity', 'growth', 'demand', 'alphabetical'])
        .withMessage('Invalid sort parameter'),
      
      ValidationMiddleware.validateRequest
    ];
  }
  
  static userPreferencesValidation() {
    return [
      body('preferredTechnologies')
        .optional()
        .isArray({ max: 20 })
        .withMessage('Preferred technologies must be an array with max 20 items'),
      
      body('preferredTechnologies.*')
        .isLength({ min: 1, max: 50 })
        .withMessage('Each technology name must be between 1 and 50 characters'),
      
      body('targetRoles')
        .optional()
        .isArray({ max: 5 })
        .withMessage('Target roles must be an array with max 5 items'),
      
      body('experienceLevel')
        .optional()
        .isIn(['entry', 'junior', 'mid', 'senior', 'lead'])
        .withMessage('Invalid experience level'),
      
      body('learningStyle')
        .optional()
        .isIn(['visual', 'auditory', 'kinesthetic', 'reading'])
        .withMessage('Invalid learning style'),
      
      ValidationMiddleware.validateRequest
    ];
  }
  
  static sanitizeResumeText(text) {
    // Remove potentially dangerous content
    let sanitized = text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
    
    // Normalize whitespace
    sanitized = sanitized
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/[ ]{2,}/g, ' ')
      .trim();
    
    return sanitized;
  }
  
  static validateSkillName(skillName) {
    const validSkillPattern = /^[a-zA-Z0-9\s\.\-\+\#]+$/;
    
    if (!validSkillPattern.test(skillName)) {
      throw new ValidationError('Invalid skill name format');
    }
    
    if (skillName.length < 1 || skillName.length > 50) {
      throw new ValidationError('Skill name must be between 1 and 50 characters');
    }
    
    return skillName.trim();
  }
}

module.exports = ValidationMiddleware;