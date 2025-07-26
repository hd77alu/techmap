const autocannon = require('autocannon');
const { expect } = require('chai');

describe('Performance Tests', () => {
  const baseUrl = 'http://localhost:3000';
  
  it('should handle concurrent resume analysis requests', async () => {
    const result = await autocannon({
      url: `${baseUrl}/api/resume`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: 'Sample resume text for performance testing with JavaScript and React skills.'
      }),
      connections: 10,
      duration: 30
    });
    
    expect(result.errors).to.equal(0);
    expect(result.timeouts).to.equal(0);
    expect(result.latency.average).to.be.below(2000); // Average response time under 2 seconds
    expect(result.requests.average).to.be.above(5); // At least 5 requests per second
  });
  
  it('should handle trends data requests efficiently', async () => {
    const result = await autocannon({
      url: `${baseUrl}/api/trends`,
      connections: 20,
      duration: 30
    });
    
    expect(result.errors).to.equal(0);
    expect(result.latency.average).to.be.below(500); // Average response time under 500ms
    expect(result.requests.average).to.be.above(50); // At least 50 requests per second
  });
});