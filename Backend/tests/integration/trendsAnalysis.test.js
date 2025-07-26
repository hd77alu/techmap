const { expect } = require('chai');
const request = require('supertest');
const app = require('../../app');
const TrendsDataCollector = require('../../services/trendsDataCollector');

describe('Trends Analysis Integration', () => {
  let server;
  
  before(async () => {
    server = app.listen(0);
    // Initialize test database
    await initializeTestDatabase();
  });
  
  after(async () => {
    await cleanupTestDatabase();
    server.close();
  });
  
  describe('GET /api/trends', () => {
    it('should return trending technologies with proper structure', async () => {
      const response = await request(app)
        .get('/api/trends')
        .expect(200);
      
      expect(response.body).to.be.an('array');
      expect(response.body[0]).to.have.property('technology');
      expect(response.body[0]).to.have.property('category');
      expect(response.body[0]).to.have.property('popularity_score');
      expect(response.body[0]).to.have.property('growth_rate');
    });
    
    it('should filter trends by category', async () => {
      const response = await request(app)
        .get('/api/trends?category=language')
        .expect(200);
      
      expect(response.body).to.be.an('array');
      response.body.forEach(trend => {
        expect(trend.category).to.equal('language');
      });
    });
    
    it('should handle invalid category gracefully', async () => {
      const response = await request(app)
        .get('/api/trends?category=invalid')
        .expect(400);
      
      expect(response.body).to.have.property('error');
    });
  });
  
  describe('Trends Data Collection', () => {
    it('should collect data from multiple sources', async () => {
      const collector = new TrendsDataCollector();
      const trends = await collector.collectAllTrends();
      
      expect(trends).to.be.an('array');
      expect(trends.length).to.be.greaterThan(0);
      
      const trend = trends[0];
      expect(trend).to.have.property('technology');
      expect(trend).to.have.property('data_sources');
      expect(trend.data_sources).to.be.an('array');
    });
    
    it('should handle API failures gracefully', async () => {
      const collector = new TrendsDataCollector();
      
      // Mock API failure
      sinon.stub(collector, 'collectGitHubTrends').rejects(new Error('API Error'));
      
      const trends = await collector.collectAllTrends();
      
      // Should still return data from other sources or fallback
      expect(trends).to.be.an('array');
    });
  });
});