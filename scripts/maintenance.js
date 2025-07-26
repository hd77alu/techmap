class MaintenanceService {
  constructor() {
    this.tasks = {
      daily: [
        this.cleanupTempFiles,
        this.optimizeDatabase,
        this.checkSystemHealth,
        this.updateTrendsData
      ],
      weekly: [
        this.analyzePerformanceMetrics,
        this.cleanupOldLogs,
        this.validateDataIntegrity,
        this.updateSkillDatabase
      ],
      monthly: [
        this.generateUsageReports,
        this.reviewSecurityLogs,
        this.optimizeIndexes,
        this.planCapacityUpgrades
      ]
    };
  }
  
  async runDailyMaintenance() {
    console.log('Starting daily maintenance tasks...');
    
    for (const task of this.tasks.daily) {
      try {
        await task.call(this);
        console.log(`✓ Completed: ${task.name}`);
      } catch (error) {
        console.error(`✗ Failed: ${task.name} - ${error.message}`);
      }
    }
    
    console.log('Daily maintenance completed');
  }
  
  async cleanupTempFiles() {
    const fs = require('fs').promises;
    const path = require('path');
    
    const tempDirs = ['/tmp/techmap', '/var/tmp/techmap'];
    
    for (const dir of tempDirs) {
      try {
        const files = await fs.readdir(dir);
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
        
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime.getTime() < cutoffTime) {
            await fs.unlink(filePath);
          }
        }
      } catch (error) {
        // Directory might not exist, which is fine
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    }
  }
  
  async optimizeDatabase() {
    const db = require('../Backend/models/database');
    
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('VACUUM', (err) => {
          if (err) reject(err);
        });
        
        db.run('ANALYZE', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }
  
  async updateTrendsData() {
    const TrendsDataCollector = require('../Backend/services/trendsDataCollector');
    const collector = new TrendsDataCollector();
    
    try {
      await collector.collectAllTrends();
      console.log('Trends data updated successfully');
    } catch (error) {
      console.warn('Trends data update failed, using cached data');
    }
  }
  
  async analyzePerformanceMetrics() {
    // Analyze response times, error rates, and resource usage
    const metrics = await this.collectPerformanceMetrics();
    
    // Generate alerts for anomalies
    const anomalies = this.detectAnomalies(metrics);
    
    if (anomalies.length > 0) {
      await this.sendPerformanceAlerts(anomalies);
    }
    
    // Store metrics for trend analysis
    await this.storeMetrics(metrics);
  }
  
  async generateUsageReports() {
    const db = require('../Backend/models/database');
    
    const report = {
      period: 'monthly',
      generated: new Date().toISOString(),
      metrics: {
        totalUsers: await this.queryDatabase('SELECT COUNT(*) as count FROM users_enhanced'),
        activeUsers: await this.queryDatabase('SELECT COUNT(DISTINCT user_id) as count FROM resume_analysis_enhanced WHERE upload_date > datetime("now", "-30 days")'),
        resumeAnalyses: await this.queryDatabase('SELECT COUNT(*) as count FROM resume_analysis_enhanced WHERE upload_date > datetime("now", "-30 days")'),
        trendsRequests: await this.queryDatabase('SELECT COUNT(*) as count FROM system_analytics WHERE metric_name = "trends_request" AND recorded_date > datetime("now", "-30 days")')
      },
      topSkills: await this.queryDatabase(`
        SELECT skill_name, COUNT(*) as frequency 
        FROM extracted_skills_enhanced 
        WHERE extracted_date > datetime("now", "-30 days")
        GROUP BY skill_name 
        ORDER BY frequency DESC 
        LIMIT 10
      `),
      performanceMetrics: await this.getPerformanceMetrics()
    };
    
    // Save report
    await this.saveReport(report);
    
    return report;
  }
}

module.exports = MaintenanceService;