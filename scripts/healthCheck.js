const express = require('express');
const db = require('../Backend/models/database');
const redis = require('redis');

class HealthCheckService {
  constructor() {
    this.redisClient = redis.createClient();
    this.checks = {
      database: this.checkDatabase.bind(this),
      redis: this.checkRedis.bind(this),
      diskSpace: this.checkDiskSpace.bind(this),
      memory: this.checkMemory.bind(this),
      externalAPIs: this.checkExternalAPIs.bind(this)
    };
  }
  
  async performHealthCheck() {
    const results = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {},
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    };
    
    for (const [checkName, checkFunction] of Object.entries(this.checks)) {
      try {
        const checkResult = await checkFunction();
        results.checks[checkName] = {
          status: 'healthy',
          ...checkResult
        };
      } catch (error) {
        results.checks[checkName] = {
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date().toISOString()
        };
        results.status = 'unhealthy';
      }
    }
    
    return results;
  }
  
  async checkDatabase() {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      db.get('SELECT 1 as test', (err, row) => {
        if (err) {
          reject(new Error(`Database check failed: ${err.message}`));
        } else {
          resolve({
            responseTime: Date.now() - startTime,
            result: row.test === 1
          });
        }
      });
    });
  }
  
  async checkRedis() {
    const startTime = Date.now();
    
    try {
      await this.redisClient.ping();
      return {
        responseTime: Date.now() - startTime,
        connected: true
      };
    } catch (error) {
      throw new Error(`Redis check failed: ${error.message}`);
    }
  }
  
  async checkDiskSpace() {
    const fs = require('fs').promises;
    
    try {
      const stats = await fs.stat('/var/lib/techmap');
      const freeSpace = await this.getFreeDiskSpace('/var/lib/techmap');
      
      if (freeSpace < 1024 * 1024 * 1024) { // Less than 1GB
        throw new Error('Low disk space warning');
      }
      
      return {
        freeSpace: freeSpace,
        usedSpace: stats.size
      };
    } catch (error) {
      throw new Error(`Disk space check failed: ${error.message}`);
    }
  }
  
  async checkMemory() {
    const memUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const freeMemory = require('os').freemem();
    
    const memoryUsagePercent = (memUsage.rss / totalMemory) * 100;
    
    if (memoryUsagePercent > 90) {
      throw new Error('High memory usage detected');
    }
    
    return {
      rss: memUsage.rss,
      heapTotal: memUsage.heapTotal,
      heapUsed: memUsage.heapUsed,
      external: memUsage.external,
      usagePercent: memoryUsagePercent,
      systemFree: freeMemory,
      systemTotal: totalMemory
    };
  }
  
  async checkExternalAPIs() {
    const axios = require('axios');
    const checks = [];
    
    // Check GitHub API
    try {
      const response = await axios.get('https://api.github.com/rate_limit', {
        timeout: 5000
      });
      checks.push({
        service: 'GitHub API',
        status: 'healthy',
        rateLimit: response.data.rate
      });
    } catch (error) {
      checks.push({
        service: 'GitHub API',
        status: 'unhealthy',
        error: error.message
      });
    }
    
    // Check StackOverflow API
    try {
      const response = await axios.get('https://api.stackexchange.com/2.3/info?site=stackoverflow', {
        timeout: 5000
      });
      checks.push({
        service: 'StackOverflow API',
        status: 'healthy',
        quota: response.data.quota_remaining
      });
    } catch (error) {
      checks.push({
        service: 'StackOverflow API',
        status: 'unhealthy',
        error: error.message
      });
    }
    
    return { externalServices: checks };
  }
  
  getFreeDiskSpace(path) {
    return new Promise((resolve, reject) => {
      require('child_process').exec(`df -k ${path}`, (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          const lines = stdout.trim().split('\n');
          const data = lines[1].split(/\s+/);
          const freeSpace = parseInt(data[3]) * 1024; // Convert from KB to bytes
          resolve(freeSpace);
        }
      });
    });
  }
}

module.exports = HealthCheckService;