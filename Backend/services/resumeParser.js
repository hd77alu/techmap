const natural = require('natural');
const { TfIdf, WordTokenizer, SentenceTokenizer } = natural;

class ResumeParser {
  constructor() {
    this.sectionPatterns = {
      contact: {
        patterns: [
          /(?:contact|personal\s+information|details|reach\s+me)/i,
          /(?:phone|email|address|linkedin|github)/i
        ],
        weight: 1.0
      },
      summary: {
        patterns: [
          /(?:summary|objective|profile|about\s+me|career\s+objective)/i,
          /(?:professional\s+summary|executive\s+summary)/i
        ],
        weight: 0.9
      },
      experience: {
        patterns: [
          /(?:experience|employment|work\s+history|professional\s+experience)/i,
          /(?:career\s+history|work\s+experience|employment\s+history)/i
        ],
        weight: 1.0
      },
      education: {
        patterns: [
          /(?:education|academic|qualifications|degrees|schooling)/i,
          /(?:university|college|school|certification)/i
        ],
        weight: 0.8
      },
      skills: {
        patterns: [
          /(?:skills|competencies|technologies|technical\s+skills)/i,
          /(?:programming|languages|frameworks|tools)/i
        ],
        weight: 1.0
      },
      projects: {
        patterns: [
          /(?:projects|portfolio|work\s+samples|personal\s+projects)/i,
          /(?:side\s+projects|open\s+source|github\s+projects)/i
        ],
        weight: 0.9
      },
      certifications: {
        patterns: [
          /(?:certifications|certificates|licenses|credentials)/i,
          /(?:professional\s+certifications|industry\s+certifications)/i
        ],
        weight: 0.7
      }
    };
    
    this.skillDatabase = this.loadSkillDatabase();
    this.experiencePatterns = this.loadExperiencePatterns();
    this.tokenizer = new WordTokenizer();
    this.sentenceTokenizer = new SentenceTokenizer();
  }
  
  async parseResume(resumeText, options = {}) {
    console.log('Starting resume parsing...');
    
    try {
      // Preprocess the text
      const cleanedText = this.preprocessText(resumeText);
      
      // Extract sections
      const sections = this.extractSections(cleanedText);
      
      // Parse each section
      const parsedData = {
        metadata: {
          originalLength: resumeText.length,
          processedLength: cleanedText.length,
          sectionsFound: Object.keys(sections).length,
          parsingDate: new Date().toISOString()
        },
        contact: this.parseContactInfo(sections.contact || ''),
        summary: this.parseSummary(sections.summary || ''),
        experience: this.parseExperience(sections.experience || ''),
        education: this.parseEducation(sections.education || ''),
        skills: this.parseSkills(sections.skills || '', cleanedText),
        projects: this.parseProjects(sections.projects || ''),
        certifications: this.parseCertifications(sections.certifications || ''),
        rawSections: sections
      };
      
      // Enrich with analytics
      const enrichedData = await this.enrichWithAnalytics(parsedData, cleanedText);
      
      console.log('Resume parsing completed successfully');
      return enrichedData;
      
    } catch (error) {
      console.error('Resume parsing failed:', error);
      throw new Error(`Resume parsing failed: ${error.message}`);
    }
  }
  
  preprocessText(text) {
    // Remove excessive whitespace and normalize line endings
    let cleaned = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Remove multiple consecutive spaces
    cleaned = cleaned.replace(/[ \t]+/g, ' ');
    
    // Remove multiple consecutive newlines but preserve section breaks
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // Fix common OCR errors if text appears to be from PDF conversion
    cleaned = this.fixCommonOCRErrors(cleaned);
    
    return cleaned.trim();
  }
  
  extractSections(text) {
    const sections = {};
    const lines = text.split('\n');
    let currentSection = 'unknown';
    let sectionContent = [];
    let confidence = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Check if line is a section header
      const detectedSection = this.detectSectionHeader(line, i, lines);
      
      if (detectedSection.section && detectedSection.confidence > 0.7) {
        // Save previous section if it has content
        if (currentSection !== 'unknown' && sectionContent.length > 0) {
          sections[currentSection] = {
            content: sectionContent.join('\n'),
            confidence: confidence[currentSection] || 0.5,
            startLine: confidence[currentSection + '_start'] || 0,
            endLine: i
          };
        }
        
        currentSection = detectedSection.section;
        confidence[currentSection] = detectedSection.confidence;
        confidence[currentSection + '_start'] = i;
        sectionContent = [];
      } else {
        sectionContent.push(line);
      }
    }
    
    // Save the last section
    if (currentSection !== 'unknown' && sectionContent.length > 0) {
      sections[currentSection] = {
        content: sectionContent.join('\n'),
        confidence: confidence[currentSection] || 0.5,
        startLine: confidence[currentSection + '_start'] || 0,
        endLine: lines.length
      };
    }
    
    return sections;
  }
  
  detectSectionHeader(line, lineIndex, allLines) {
    let bestMatch = { section: null, confidence: 0 };
    
    for (const [sectionName, sectionData] of Object.entries(this.sectionPatterns)) {
      for (const pattern of sectionData.patterns) {
        if (pattern.test(line)) {
          let confidence = sectionData.weight;
          
          // Boost confidence for standalone headers
          if (line.length < 50 && line.split(' ').length <= 4) {
            confidence += 0.2;
          }
          
          // Boost confidence for headers with formatting indicators
          if (/^[A-Z\s]+$/.test(line) || line.includes(':') || line.includes('---')) {
            confidence += 0.1;
          }
          
          // Check context for additional confidence
          const context = this.analyzeHeaderContext(lineIndex, allLines);
          confidence += context.boost;
          
          if (confidence > bestMatch.confidence) {
            bestMatch = { section: sectionName, confidence };
          }
        }
      }
    }
    
    return bestMatch;
  }
  
  parseSkills(skillsSection, fullText) {
    const extractedSkills = {
      technical: {
        programming_languages: [],
        frameworks: [],
        databases: [],
        cloud_platforms: [],
        tools: [],
        methodologies: []
      },
      soft: [],
      certifications: [],
      experience_levels: {},
      confidence_scores: {}
    };
    
    // Combine skills section with full text analysis for better coverage
    const textToAnalyze = skillsSection + '\n' + fullText;
    
    // Extract technical skills with context analysis
    for (const [category, skills] of Object.entries(this.skillDatabase.technical)) {
      for (const skill of skills) {
        const mentions = this.findSkillMentions(textToAnalyze, skill);
        
        if (mentions.length > 0) {
          const experienceLevel = this.estimateExperienceLevel(mentions, skill);
          const confidenceScore = this.calculateSkillConfidence(mentions, skill);
          
          extractedSkills.technical[category].push({
            skill: skill,
            mentions: mentions.length,
            experience_level: experienceLevel,
            confidence: confidenceScore,
            contexts: mentions.map(m => m.context),
            years_experience: this.extractYearsOfExperience(mentions, skill)
          });
          
          extractedSkills.experience_levels[skill] = experienceLevel;
          extractedSkills.confidence_scores[skill] = confidenceScore;
        }
      }
    }
    
    // Extract soft skills
    extractedSkills.soft = this.extractSoftSkills(textToAnalyze);
    
    // Sort skills by confidence and relevance
    for (const category of Object.keys(extractedSkills.technical)) {
      extractedSkills.technical[category].sort((a, b) => b.confidence - a.confidence);
    }
    
    return extractedSkills;
  }
  
  findSkillMentions(text, skill) {
    const mentions = [];
    const skillVariations = this.generateSkillVariations(skill);
    
    for (const variation of skillVariations) {
      const regex = new RegExp(`\\b${this.escapeRegex(variation)}\\b`, 'gi');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        const contextStart = Math.max(0, match.index - 100);
        const contextEnd = Math.min(text.length, match.index + variation.length + 100);
        const context = text.substring(contextStart, contextEnd);
        
        mentions.push({
          variation: variation,
          position: match.index,
          context: context.trim(),
          sentence: this.extractSentence(text, match.index),
          surrounding: this.extractSurroundingInfo(text, match.index)
        });
      }
    }
    
    return this.deduplicateMentions(mentions);
  }
  
  estimateExperienceLevel(mentions, skill) {
    const contexts = mentions.map(m => m.context.toLowerCase());
    const sentences = mentions.map(m => m.sentence.toLowerCase());
    
    // Look for explicit experience indicators
    const expertIndicators = ['expert', 'senior', 'lead', 'architect', 'principal', 'advanced'];
    const intermediateIndicators = ['intermediate', 'proficient', 'experienced', 'solid'];
    const beginnerIndicators = ['beginner', 'basic', 'learning', 'familiar', 'exposure'];
    
    let expertScore = 0;
    let intermediateScore = 0;
    let beginnerScore = 0;
    
    for (const context of contexts) {
      expertScore += expertIndicators.filter(indicator => context.includes(indicator)).length;
      intermediateScore += intermediateIndicators.filter(indicator => context.includes(indicator)).length;
      beginnerScore += beginnerIndicators.filter(indicator => context.includes(indicator)).length;
    }
    
    // Analyze years of experience
    const yearsExperience = this.extractYearsOfExperience(mentions, skill);
    if (yearsExperience >= 5) expertScore += 2;
    else if (yearsExperience >= 2) intermediateScore += 2;
    else if (yearsExperience > 0) beginnerScore += 1;
    
    // Analyze project complexity and responsibility indicators
    const complexityScore = this.analyzeProjectComplexity(contexts);
    if (complexityScore > 0.7) expertScore += 1;
    else if (complexityScore > 0.4) intermediateScore += 1;
    
    // Determine level based on scores
    if (expertScore > intermediateScore && expertScore > beginnerScore) {
      return 'expert';
    } else if (intermediateScore > beginnerScore) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  }
  
  async enrichWithAnalytics(parsedData, fullText) {
    // Calculate overall resume metrics
    const analytics = {
      completeness: this.calculateCompleteness(parsedData),
      readability: this.calculateReadability(fullText),
      keyword_density: this.calculateKeywordDensity(fullText),
      ats_compatibility: this.assessATSCompatibility(parsedData, fullText),
      skill_diversity: this.calculateSkillDiversity(parsedData.skills),
      experience_consistency: this.assessExperienceConsistency(parsedData.experience),
      recommendations: []
    };
    
    // Generate improvement recommendations
    analytics.recommendations = this.generateImprovementRecommendations(parsedData, analytics);
    
    return {
      ...parsedData,
      analytics: analytics
    };
  }
  
  calculateCompleteness(parsedData) {
    const requiredSections = ['contact', 'experience', 'skills'];
    const optionalSections = ['summary', 'education', 'projects', 'certifications'];
    
    let score = 0;
    let maxScore = 0;
    
    // Check required sections (weighted more heavily)
    for (const section of requiredSections) {
      maxScore += 3;
      if (parsedData[section] && this.hasContent(parsedData[section])) {
        score += 3;
      }
    }
    
    // Check optional sections
    for (const section of optionalSections) {
      maxScore += 1;
      if (parsedData[section] && this.hasContent(parsedData[section])) {
        score += 1;
      }
    }
    
    return {
      score: score / maxScore,
      missing_sections: this.findMissingSections(parsedData),
      recommendations: this.getCompletenessRecommendations(parsedData)
    };
  }
  
  loadSkillDatabase() {
    return {
      technical: {
        programming_languages: [
          'JavaScript', 'Python', 'Java', 'TypeScript', 'C++', 'C#', 'Go', 'Rust',
          'PHP', 'Ruby', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl'
        ],
        frameworks: [
          'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask',
          'Spring', 'Laravel', 'Ruby on Rails', 'ASP.NET', 'Next.js', 'Nuxt.js',
          'Svelte', 'Ember.js', 'Backbone.js', 'jQuery'
        ],
        databases: [
          'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle',
          'SQL Server', 'Cassandra', 'DynamoDB', 'Elasticsearch', 'Neo4j'
        ],
        cloud_platforms: [
          'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Heroku',
          'DigitalOcean', 'Vercel', 'Netlify', 'Firebase'
        ],
        tools: [
          'Git', 'Jenkins', 'Jira', 'Slack', 'VS Code', 'IntelliJ', 'Eclipse',
          'Webpack', 'Babel', 'ESLint', 'Prettier', 'Postman', 'Figma'
        ],
        methodologies: [
          'Agile', 'Scrum', 'Kanban', 'DevOps', 'CI/CD', 'TDD', 'BDD',
          'Microservices', 'REST API', 'GraphQL', 'Serverless'
        ]
      },
      soft: [
        'Leadership', 'Communication', 'Problem Solving', 'Team Work',
        'Project Management', 'Critical Thinking', 'Creativity', 'Adaptability',
        'Time Management', 'Attention to Detail', 'Customer Service'
      ]
    };
  }
}

module.exports = ResumeParser;