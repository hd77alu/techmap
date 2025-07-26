const axios = require('axios');
const db = require('../models/database');

class TrendsDataCollector {
  constructor() {
    this.dataSources = {
      github: {
        baseUrl: 'https://api.github.com',
        rateLimit: 5000, // requests per hour
        enabled: true
      },
      stackoverflow: {
        baseUrl: 'https://api.stackexchange.com/2.3',
        rateLimit: 10000,
        enabled: true
      }
    };
    
    this.technologies = [
      'JavaScript', 'Python', 'Java', 'TypeScript', 'C++', 'C#', 'Go', 'Rust',
      'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask',
      'Spring', 'Laravel', 'Ruby on Rails', 'ASP.NET', 'Next.js'
    ];
    
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }
  
  async collectAllTrends() {
    console.log('Starting comprehensive trends data collection...');
    const startTime = Date.now();
    
    try {
      const results = await Promise.allSettled([
        this.collectGitHubTrends(),
        this.collectStackOverflowTrends(),
        this.collectJobMarketTrends()
      ]);
      
      const successfulResults = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
      
      if (successfulResults.length === 0) {
        throw new Error('All data collection sources failed');
      }
      
      const mergedData = this.mergeDataSources(successfulResults);
      await this.storeTrendsData(mergedData);
      
      const duration = Date.now() - startTime;
      console.log(`Trends collection completed in ${duration}ms`);
      
      return mergedData;
    } catch (error) {
      console.error('Trends collection failed:', error);
      return await this.loadFallbackData();
    }
  }
  
  async collectGitHubTrends() {
    const trends = [];
    
    for (const tech of this.technologies) {
      try {
        const repoData = await this.fetchWithRetry(
          `${this.dataSources.github.baseUrl}/search/repositories`,
          {
            params: {
              q: `language:${tech}`,
              sort: 'stars',
              order: 'desc',
              per_page: 100
            }
          }
        );
        
        const languageData = await this.fetchWithRetry(
          `${this.dataSources.github.baseUrl}/search/repositories`,
          {
            params: {
              q: tech,
              sort: 'updated',
              order: 'desc',
              per_page: 50
            }
          }
        );
        
        const totalStars = repoData.data.items.reduce((sum, repo) => sum + repo.stargazers_count, 0);
        const totalRepos = repoData.data.total_count;
        const recentActivity = languageData.data.items.filter(
          repo => new Date(repo.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;
        
        trends.push({
          technology: tech,
          category: this.categorizeTechnology(tech),
          github_stars: totalStars,
          github_repos_count: totalRepos,
          github_weekly_commits: recentActivity,
          data_source: 'github'
        });
        
        // Rate limiting
        await this.delay(100);
        
      } catch (error) {
        console.warn(`Failed to collect GitHub data for ${tech}:`, error.message);
      }
    }
    
    return trends;
  }
  
  async collectStackOverflowTrends() {
    const trends = [];
    
    for (const tech of this.technologies) {
      try {
        const tagData = await this.fetchWithRetry(
          `${this.dataSources.stackoverflow.baseUrl}/tags/${tech.toLowerCase()}/info`,
          {
            params: {
              site: 'stackoverflow'
            }
          }
        );
        
        const questionsData = await this.fetchWithRetry(
          `${this.dataSources.stackoverflow.baseUrl}/search`,
          {
            params: {
              site: 'stackoverflow',
              tagged: tech.toLowerCase(),
              fromdate: Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000),
              todate: Math.floor(Date.now() / 1000)
            }
          }
        );
        
        if (tagData.data.items.length > 0) {
          const tag = tagData.data.items[0];
          trends.push({
            technology: tech,
            category: this.categorizeTechnology(tech),
            stackoverflow_questions: tag.count,
            stackoverflow_weekly_questions: questionsData.data.items.length,
            data_source: 'stackoverflow'
          });
        }
        
        await this.delay(100);
        
      } catch (error) {
        console.warn(`Failed to collect StackOverflow data for ${tech}:`, error.message);
      }
    }
    
    return trends;
  }
  
  mergeDataSources(dataSources) {
    const mergedData = new Map();
    
    // Combine data from all sources for each technology
    dataSources.forEach(sourceData => {
      sourceData.forEach(item => {
        const key = `${item.technology}_${item.category}`;
        
        if (mergedData.has(key)) {
          const existing = mergedData.get(key);
          Object.assign(existing, item);
          existing.data_sources.push(item.data_source);
        } else {
          mergedData.set(key, {
            ...item,
            data_sources: [item.data_source]
          });
        }
      });
    });
    
    // Calculate composite scores
    return Array.from(mergedData.values()).map(item => {
      item.popularity_score = this.calculatePopularityScore(item);
      item.growth_rate = this.calculateGrowthRate(item);
      item.demand_score = this.calculateDemandScore(item);
      item.market_momentum = this.calculateMarketMomentum(item);
      item.data_quality_score = this.calculateDataQuality(item);
      
      return item;
    });
  }
  
  calculatePopularityScore(item) {
    let score = 0;
    let factors = 0;
    
    if (item.github_stars) {
      score += Math.min(item.github_stars / 100000, 1) * 40;
      factors++;
    }
    
    if (item.github_repos_count) {
      score += Math.min(item.github_repos_count / 50000, 1) * 30;
      factors++;
    }
    
    if (item.stackoverflow_questions) {
      score += Math.min(item.stackoverflow_questions / 100000, 1) * 30;
      factors++;
    }
    
    return factors > 0 ? score / factors : 0;
  }
  
  async storeTrendsData(trendsData) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO trending_data_enhanced 
      (technology, category, github_stars, github_repos_count, github_weekly_commits,
       stackoverflow_questions, stackoverflow_weekly_questions, popularity_score,
       growth_rate, demand_score, market_momentum, data_sources, data_quality_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const item of trendsData) {
      stmt.run(
        item.technology,
        item.category,
        item.github_stars || 0,
        item.github_repos_count || 0,
        item.github_weekly_commits || 0,
        item.stackoverflow_questions || 0,
        item.stackoverflow_weekly_questions || 0,
        item.popularity_score,
        item.growth_rate,
        item.demand_score,
        item.market_momentum,
        JSON.stringify(item.data_sources),
        item.data_quality_score
      );
    }
    
    stmt.finalize();
    
    // Store historical snapshot
    await this.storeHistoricalSnapshot(trendsData);
  }
}

module.exports = TrendsDataCollector;