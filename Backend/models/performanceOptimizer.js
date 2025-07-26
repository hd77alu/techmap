class DatabasePerformanceOptimizer {
  constructor(database) {
    this.db = database;
    this.cacheSize = 1000;
    this.queryCache = new Map();
  }
  
  async optimizeDatabase() {
    console.log('Starting database performance optimization...');
    
    // Analyze table statistics
    await this.analyzeTableStatistics();
    
    // Create additional indexes for common queries
    await this.createPerformanceIndexes();
    
    // Optimize SQLite settings
    await this.optimizeSQLiteSettings();
    
    // Set up query caching
    this.setupQueryCaching();
    
    console.log('Database optimization completed');
  }
  
  async createPerformanceIndexes() {
    const indexes = [
      // Composite indexes for common query patterns
      'CREATE INDEX IF NOT EXISTS idx_user_skills_composite ON extracted_skills_enhanced(user_id, skill_category, experience_level)',
      'CREATE INDEX IF NOT EXISTS idx_trends_market_composite ON trending_data_enhanced(category, market_momentum DESC, popularity_score DESC)',
      'CREATE INDEX IF NOT EXISTS idx_recommendations_priority ON skill_recommendations_enhanced(user_id, priority, status)',
      
      // Partial indexes for active records
      'CREATE INDEX IF NOT EXISTS idx_active_recommendations ON skill_recommendations_enhanced(user_id, created_date) WHERE status IN ("pending", "in_progress")',
      'CREATE INDEX IF NOT EXISTS idx_recent_trends ON trending_data_enhanced(technology, last_updated) WHERE last_updated > datetime("now", "-30 days")',
      
      // Full-text search indexes
      'CREATE INDEX IF NOT EXISTS idx_resume_text_fts ON resume_analysis_enhanced(original_text)',
      'CREATE INDEX IF NOT EXISTS idx_skill_name_fts ON extracted_skills_enhanced(skill_name)'
    ];
    
    for (const indexSql of indexes) {
      await this.executeQuery(indexSql);
    }
    
    console.log('Performance indexes created');
  }
  
  async optimizeSQLiteSettings() {
    const optimizations = [
      'PRAGMA journal_mode = WAL',
      'PRAGMA synchronous = NORMAL',
      'PRAGMA cache_size = 10000',
      'PRAGMA temp_store = MEMORY',
      'PRAGMA mmap_size = 268435456', // 256MB
      'PRAGMA optimize'
    ];
    
    for (const pragma of optimizations) {
      await this.executeQuery(pragma);
    }
    
    console.log('SQLite settings optimized');
  }
  
  setupQueryCaching() {
    // Implement intelligent query caching for frequently accessed data
    this.cachedQueries = {
      'trending_technologies': {
        sql: 'SELECT * FROM trending_data_enhanced WHERE last_updated > datetime("now", "-24 hours") ORDER BY popularity_score DESC LIMIT 20',
        ttl: 3600000 // 1 hour
      },
      'popular_skills': {
        sql: 'SELECT skill_name, COUNT(*) as frequency FROM extracted_skills_enhanced GROUP BY skill_name ORDER BY frequency DESC LIMIT 50',
        ttl: 7200000 // 2 hours
      }
    };
  }
  
  async getCachedQuery(queryKey, params = []) {
    const cacheKey = `${queryKey}_${JSON.stringify(params)}`;
    const cached = this.queryCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    
    // Execute query and cache result
    const queryConfig = this.cachedQueries[queryKey];
    if (queryConfig) {
      const result = await this.executeQuery(queryConfig.sql, params);
      
      this.queryCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        ttl: queryConfig.ttl
      });
      
      // Cleanup old cache entries
      if (this.queryCache.size > this.cacheSize) {
        this.cleanupCache();
      }
      
      return result;
    }
    
    throw new Error(`Unknown cached query: ${queryKey}`);
  }
  
  cleanupCache() {
    const entries = Array.from(this.queryCache.entries());
    const now = Date.now();
    
    // Remove expired entries
    for (const [key, value] of entries) {
      if (now - value.timestamp > value.ttl) {
        this.queryCache.delete(key);
      }
    }
    
    // If still too large, remove oldest entries
    if (this.queryCache.size > this.cacheSize) {
      const sortedEntries = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = sortedEntries.slice(0, this.queryCache.size - this.cacheSize);
      
      for (const [key] of toRemove) {
        this.queryCache.delete(key);
      }
    }
  }
}

module.exports = DatabasePerformanceOptimizer;