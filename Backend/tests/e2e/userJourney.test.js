const { expect } = require('chai');
const puppeteer = require('puppeteer');

describe('User Journey E2E Tests', () => {
  let browser;
  let page;
  
  before(async () => {
    browser = await puppeteer.launch({
      headless: process.env.CI === 'true',
      slowMo: 50
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
  });
  
  after(async () => {
    await browser.close();
  });
  
  describe('Resume Analysis Workflow', () => {
    it('should complete full resume analysis workflow', async () => {
      // Navigate to application
      await page.goto('http://localhost:3000');
      
      // Wait for page to load
      await page.waitForSelector('#nav-resume');
      
      // Navigate to resume analysis section
      await page.click('#nav-resume');
      
      // Input resume text
      const sampleResume = `
        John Doe
        Software Engineer
        
        EXPERIENCE
        Senior Developer at Tech Corp
        - Developed applications using JavaScript and React
        - 5 years of experience
        
        SKILLS
        JavaScript, React, Node.js, Python
      `;
      
      await page.type('#resumeText', sampleResume);
      
      // Click analyze button
      await page.click('button[onclick="analyzeResume()"]');
      
      // Wait for results
      await page.waitForSelector('#resumeResult', { timeout: 10000 });
      
      // Verify results are displayed
      const resultText = await page.$eval('#resumeResult', el => el.textContent);
      expect(resultText).to.include('JavaScript');
      expect(resultText).to.include('React');
    });
    
    it('should handle invalid resume input gracefully', async () => {
      await page.goto('http://localhost:3000');
      await page.waitForSelector('#nav-resume');
      await page.click('#nav-resume');
      
      // Input invalid resume
      await page.type('#resumeText', 'Invalid resume content');
      await page.click('button[onclick="analyzeResume()"]');
      
      // Should show appropriate error or minimal results
      await page.waitForSelector('#resumeResult', { timeout: 5000 });
      const resultText = await page.$eval('#resumeResult', el => el.textContent);
      expect(resultText).to.not.be.empty;
    });
  });
  
  describe('Trends Visualization Workflow', () => {
    it('should display trends dashboard correctly', async () => {
      await page.goto('http://localhost:3000');
      await page.waitForSelector('#nav-trends');
      
      // Navigate to trends section
      await page.click('#nav-trends');
      
      // Click show trends button
      await page.click('button[onclick="fetchTrends()"]');
      
      // Wait for chart to render
      await page.waitForSelector('#trendsChart', { timeout: 10000 });
      
      // Verify chart is visible
      const chartVisible = await page.$eval('#trendsChart', el => {
        return el.offsetWidth > 0 && el.offsetHeight > 0;
      });
      
      expect(chartVisible).to.be.true;
    });
  });
});