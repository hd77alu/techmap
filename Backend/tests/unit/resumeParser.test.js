const { expect } = require('chai');
const sinon = require('sinon');
const ResumeParser = require('../../services/resumeParser');

describe('ResumeParser', () => {
  let parser;
  
  beforeEach(() => {
    parser = new ResumeParser();
  });
  
  afterEach(() => {
    sinon.restore();
  });
  
  describe('parseResume', () => {
    it('should successfully parse a well-formatted resume', async () => {
      const sampleResume = `
        JOHN DOE
        Software Engineer
        john.doe@email.com | (555) 123-4567
        
        SUMMARY
        Experienced full-stack developer with 5 years of experience in JavaScript and React.
        
        EXPERIENCE
        Senior Developer at Tech Corp (2020-2025)
        - Developed React applications using JavaScript and Node.js
        - Led team of 3 developers
        
        SKILLS
        JavaScript, React, Node.js, Python, SQL
        
        EDUCATION
        Bachelor of Computer Science, University of Technology (2018)
      `;
      
      const result = await parser.parseResume(sampleResume);
      
      expect(result).to.be.an('object');
      expect(result.contact).to.exist;
      expect(result.skills).to.exist;
      expect(result.experience).to.exist;
      expect(result.skills.technical.programming_languages).to.include.deep.members([
        { skill: 'JavaScript', experience_level: 'intermediate' }
      ]);
    });
    
    it('should handle malformed resume text gracefully', async () => {
      const malformedResume = 'This is not a proper resume format.';
      
      const result = await parser.parseResume(malformedResume);
      
      expect(result).to.be.an('object');
      expect(result.analytics.completeness.score).to.be.below(0.5);
    });
    
    it('should extract skills with correct confidence scores', async () => {
      const skillsText = `
        I have extensive experience with JavaScript for 5 years.
        I'm proficient in React and have built multiple applications.
        I have basic knowledge of Python.
      `;
      
      const skills = parser.parseSkills(skillsText, skillsText);
      
      const jsSkill = skills.technical.programming_languages.find(s => s.skill === 'JavaScript');
      const reactSkill = skills.technical.frameworks.find(s => s.skill === 'React');
      const pythonSkill = skills.technical.programming_languages.find(s => s.skill === 'Python');
      
      expect(jsSkill.experience_level).to.equal('expert');
      expect(reactSkill.experience_level).to.equal('intermediate');
      expect(pythonSkill.experience_level).to.equal('beginner');
    });
  });
  
  describe('extractSections', () => {
    it('should correctly identify resume sections', () => {
      const resumeText = `
        CONTACT INFORMATION
        John Doe
        
        PROFESSIONAL SUMMARY
        Experienced developer
        
        WORK EXPERIENCE
        Software Engineer at Company
        
        TECHNICAL SKILLS
        JavaScript, Python
      `;
      
      const sections = parser.extractSections(resumeText);
      
      expect(sections).to.have.property('contact');
      expect(sections).to.have.property('summary');
      expect(sections).to.have.property('experience');
      expect(sections).to.have.property('skills');
    });
  });
  
  describe('estimateExperienceLevel', () => {
    it('should correctly estimate experience levels from context', () => {
      const expertMentions = [
        { context: 'Senior JavaScript developer with expert knowledge' },
        { context: 'Led JavaScript architecture decisions' }
      ];
      
      const beginnerMentions = [
        { context: 'Basic understanding of JavaScript' },
        { context: 'Learning JavaScript fundamentals' }
      ];
      
      expect(parser.estimateExperienceLevel(expertMentions, 'JavaScript')).to.equal('expert');
      expect(parser.estimateExperienceLevel(beginnerMentions, 'JavaScript')).to.equal('beginner');
    });
  });
});