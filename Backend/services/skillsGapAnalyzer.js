const TrendsDataCollector = require('./trendsDataCollector');

class SkillsGapAnalyzer {
  constructor() {
    this.trendsCollector = new TrendsDataCollector();
    this.jobRoleRequirements = this.loadJobRoleRequirements();
    this.skillWeights = this.loadSkillWeights();
    this.learningTimeEstimates = this.loadLearningTimeEstimates();
  }
  
  async analyzeSkillsGap(extractedSkills, targetRole = 'Full Stack Developer', userPreferences = {}) {
    console.log(`Analyzing skills gap for role: ${targetRole}`);
    
    try {
      // Get current market trends
      const currentTrends = await this.getCurrentTrends();
      
      // Get role requirements
      const roleRequirements = this.getRoleRequirements(targetRole);
      
      // Flatten user skills for analysis
      const userSkills = this.flattenSkills(extractedSkills);
      
      // Perform comprehensive analysis
      const analysis = {
        target_role: targetRole,
        analysis_date: new Date().toISOString(),
        user_skills_summary: this.summarizeUserSkills(userSkills),
        strengths: this.identifyStrengths(userSkills, roleRequirements, currentTrends),
        gaps: this.identifyGaps(userSkills, roleRequirements, currentTrends),
        recommendations: [],
        market_alignment: 0,
        career_progression: this.analyzeCareerProgression(userSkills, targetRole),
        learning_roadmap: [],
        priority_matrix: {}
      };
      
      // Generate personalized recommendations
      analysis.recommendations = await this.generateRecommendations(analysis, userPreferences);
      
      // Calculate market alignment score
      analysis.market_alignment = this.calculateMarketAlignment(analysis, currentTrends);
      
      // Create learning roadmap
      analysis.learning_roadmap = this.createLearningRoadmap(analysis.gaps, userPreferences);
      
      // Generate priority matrix
      analysis.priority_matrix = this.createPriorityMatrix(analysis.gaps, currentTrends);
      
      console.log('Skills gap analysis completed successfully');
      return analysis;
      
    } catch (error) {
      console.error('Skills gap analysis failed:', error);
      throw new Error(`Skills gap analysis failed: ${error.message}`);
    }
  }
  
  identifyStrengths(userSkills, roleRequirements, trends) {
    const strengths = [];
    
    for (const userSkill of userSkills) {
      // Check if skill is required for the role
      const isRequired = roleRequirements.required.includes(userSkill.name);
      const isPreferred = roleRequirements.preferred.includes(userSkill.name);
      
      if (isRequired || isPreferred) {
        const trendData = trends.find(t => t.technology === userSkill.name);
        const marketDemand = this.getMarketDemand(userSkill.name, trends);
        
        strengths.push({
          skill: userSkill.name,
          category: userSkill.category,
          experience_level: userSkill.experience_level,
          confidence: userSkill.confidence,
          role_relevance: isRequired ? 'required' : 'preferred',
          market_demand: marketDemand,
          trend_score: trendData?.popularity_score || 0,
          growth_rate: trendData?.growth_rate || 0,
          competitive_advantage: this.calculateCompetitiveAdvantage(userSkill, trendData),
          improvement_potential: this.assessImprovementPotential(userSkill)
        });
      }
    }
    
    // Sort by overall value (combination of role relevance, market demand, and user proficiency)
    return strengths.sort((a, b) => {
      const scoreA = this.calculateStrengthScore(a);
      const scoreB = this.calculateStrengthScore(b);
      return scoreB - scoreA;
    });
  }
  
  identifyGaps(userSkills, roleRequirements, trends) {
    const gaps = [];
    const userSkillNames = userSkills.map(s => s.name);
    
    // Check required skills
    for (const requiredSkill of roleRequirements.required) {
      if (!userSkillNames.includes(requiredSkill)) {
        const trendData = trends.find(t => t.technology === requiredSkill);
        const marketDemand = this.getMarketDemand(requiredSkill, trends);
        
        gaps.push({
          skill: requiredSkill,
          gap_type: 'missing_required',
          importance: 'critical',
          market_demand: marketDemand,
          trend_score: trendData?.popularity_score || 0,
          growth_rate: trendData?.growth_rate || 0,
          learning_difficulty: this.assessLearningDifficulty(requiredSkill),
          estimated_learning_time: this.estimateLearningTime(requiredSkill),
          prerequisites: this.getPrerequisites(requiredSkill, userSkillNames),
          learning_resources: this.findLearningResources(requiredSkill)
        });
      }
    }
    
    // Check preferred skills
    for (const preferredSkill of roleRequirements.preferred) {
      if (!userSkillNames.includes(preferredSkill)) {
        const trendData = trends.find(t => t.technology === preferredSkill);
        const marketDemand = this.getMarketDemand(preferredSkill, trends);
        
        gaps.push({
          skill: preferredSkill,
          gap_type: 'missing_preferred',
          importance: 'high',
          market_demand: marketDemand,
          trend_score: trendData?.popularity_score || 0,
          growth_rate: trendData?.growth_rate || 0,
          learning_difficulty: this.assessLearningDifficulty(preferredSkill),
          estimated_learning_time: this.estimateLearningTime(preferredSkill),
          prerequisites: this.getPrerequisites(preferredSkill, userSkillNames),
          learning_resources: this.findLearningResources(preferredSkill)
        });
      }
    }
    
    // Check for skills that need improvement (user has basic level but market demands higher)
    for (const userSkill of userSkills) {
      if (userSkill.experience_level === 'beginner' && 
          (roleRequirements.required.includes(userSkill.name) || 
           roleRequirements.preferred.includes(userSkill.name))) {
        
        const trendData = trends.find(t => t.technology === userSkill.name);
        
        gaps.push({
          skill: userSkill.name,
          gap_type: 'needs_improvement',
          current_level: userSkill.experience_level,
          target_level: 'intermediate',
          importance: roleRequirements.required.includes(userSkill.name) ? 'high' : 'medium',
          market_demand: this.getMarketDemand(userSkill.name, trends),
          trend_score: trendData?.popularity_score || 0,
          improvement_areas: this.identifyImprovementAreas(userSkill),
          learning_resources: this.findAdvancedLearningResources(userSkill.name)
        });
      }
    }
    
    return gaps.sort((a, b) => this.calculateGapPriority(b) - this.calculateGapPriority(a));
  }
  
  async generateRecommendations(analysis, userPreferences) {
    const recommendations = [];
    
    // High-priority skill gaps
    const criticalGaps = analysis.gaps.filter(gap => gap.importance === 'critical').slice(0, 3);
    
    for (const gap of criticalGaps) {
      recommendations.push({
        type: 'critical_skill_development',
        priority: 'critical',
        skill: gap.skill,
        reason: `${gap.skill} is required for ${analysis.target_role} and has high market demand (${gap.market_demand}%)`,
        action_items: [
          `Complete comprehensive course in ${gap.skill}`,
          `Build 2-3 projects showcasing ${gap.skill}`,
          `Obtain industry certification in ${gap.skill}`,
          `Join ${gap.skill} community and contribute to discussions`
        ],
        estimated_time: gap.estimated_learning_time,
        resources: gap.learning_resources,
        success_metrics: this.defineSuccessMetrics(gap.skill),
        milestones: this.createLearningMilestones(gap.skill, gap.estimated_learning_time)
      });
    }
    
    // Trending skills opportunities
    const trendingOpportunities = analysis.gaps
      .filter(gap => gap.growth_rate > 0.2)
      .sort((a, b) => b.growth_rate - a.growth_rate)
      .slice(0, 2);
    
    for (const opportunity of trendingOpportunities) {
      recommendations.push({
        type: 'trending_opportunity',
        priority: 'high',
        skill: opportunity.skill,
        reason: `${opportunity.skill} is trending with ${(opportunity.growth_rate * 100).toFixed(1)}% growth and increasing job demand`,
        market_data: {
          growth_rate: opportunity.growth_rate,
          trend_score: opportunity.trend_score,
          market_demand: opportunity.market_demand
        },
        action_items: [
          `Start with ${opportunity.skill} fundamentals course`,
          `Follow ${opportunity.skill} thought leaders and blogs`,
          `Experiment with ${opportunity.skill} in side projects`,
          `Attend ${opportunity.skill} meetups or conferences`
        ],
        competitive_advantage: `Early adoption of ${opportunity.skill} will position you ahead of the curve`,
        timeline: this.createTrendingSkillTimeline(opportunity)
      });
    }
    
    // Skill improvement recommendations
    const improvementOpportunities = analysis.strengths
      .filter(strength => strength.improvement_potential > 0.6)
      .slice(0, 2);
    
    for (const improvement of improvementOpportunities) {
      recommendations.push({
        type: 'skill_enhancement',
        priority: 'medium',
        skill: improvement.skill,
        current_level: improvement.experience_level,
        target_level: this.getNextLevel(improvement.experience_level),
        reason: `Advancing your ${improvement.skill} skills will increase your market value and role readiness`,
        action_items: [
          `Take advanced ${improvement.skill} course`,
          `Mentor others in ${improvement.skill}`,
          `Contribute to open source ${improvement.skill} projects`,
          `Speak about ${improvement.skill} at local meetups`
        ],
        impact: this.calculateImprovementImpact(improvement),
        resources: this.findAdvancedLearningResources(improvement.skill)
      });
    }
    
    // Portfolio and project recommendations
    const portfolioRecommendations = this.generatePortfolioRecommendations(analysis);
    recommendations.push(...portfolioRecommendations);
    
    return recommendations.sort((a, b) => this.calculateRecommendationPriority(b) - this.calculateRecommendationPriority(a));
  }
  
  createLearningRoadmap(gaps, userPreferences) {
    const roadmap = {
      total_estimated_time: 0,
      phases: [],
      parallel_tracks: [],
      prerequisites_map: {}
    };
    
    // Group skills by prerequisites and dependencies
    const skillGroups = this.groupSkillsByDependencies(gaps);
    
    // Create learning phases
    let phaseNumber = 1;
    for (const group of skillGroups) {
      const phase = {
        phase: phaseNumber,
        title: `Phase ${phaseNumber}: ${this.getPhaseTitle(group)}`,
        duration_weeks: Math.max(...group.map(skill => skill.estimated_learning_time || 4)),
        skills: group.map(skill => ({
          skill: skill.skill,
          priority: skill.importance,
          estimated_hours: (skill.estimated_learning_time || 4) * 10,
          learning_approach: this.recommendLearningApproach(skill, userPreferences),
          resources: skill.learning_resources,
          assessment_criteria: this.defineAssessmentCriteria(skill.skill)
        })),
        deliverables: this.definePhaseDeliverables(group),
        success_criteria: this.definePhaseSuccessCriteria(group)
      };
      
      roadmap.phases.push(phase);
      roadmap.total_estimated_time += phase.duration_weeks;
      phaseNumber++;
    }
    
    // Identify skills that can be learned in parallel
    roadmap.parallel_tracks = this.identifyParallelTracks(gaps);
    
    return roadmap;
  }
  
  calculateMarketAlignment(analysis, trends) {
    let alignmentScore = 0;
    let totalWeight = 0;
    
    // Score based on required skills coverage
    const requiredSkillsCoverage = analysis.strengths.filter(s => s.role_relevance === 'required').length / 
                                  this.getRoleRequirements(analysis.target_role).required.length;
    alignmentScore += requiredSkillsCoverage * 40;
    totalWeight += 40;
    
    // Score based on trending skills
    const trendingSkillsScore = analysis.strengths.reduce((score, strength) => {
      return score + (strength.trend_score / 100) * 20;
    }, 0) / Math.max(analysis.strengths.length, 1);
    alignmentScore += trendingSkillsScore;
    totalWeight += 20;
    
    // Score based on market demand
    const marketDemandScore = analysis.strengths.reduce((score, strength) => {
      return score + (strength.market_demand / 100) * 20;
    }, 0) / Math.max(analysis.strengths.length, 1);
    alignmentScore += marketDemandScore;
    totalWeight += 20;
    
    // Score based on skill levels
    const skillLevelScore = analysis.strengths.reduce((score, strength) => {
      const levelMultiplier = strength.experience_level === 'expert' ? 1 : 
                             strength.experience_level === 'intermediate' ? 0.7 : 0.4;
      return score + levelMultiplier * 20;
    }, 0) / Math.max(analysis.strengths.length, 1);
    alignmentScore += skillLevelScore;
    totalWeight += 20;
    
    return Math.min(alignmentScore / totalWeight, 1);
  }
  
  loadJobRoleRequirements() {
    return {
      'Full Stack Developer': {
        required: ['JavaScript', 'HTML', 'CSS', 'Node.js', 'React', 'SQL', 'Git'],
        preferred: ['TypeScript', 'MongoDB', 'Express.js', 'Docker', 'AWS', 'Jest'],
        experience_level: 'intermediate',
        soft_skills: ['Problem Solving', 'Communication', 'Team Work']
      },
      'Frontend Developer': {
        required: ['JavaScript', 'HTML', 'CSS', 'React', 'Git'],
        preferred: ['TypeScript', 'Vue.js', 'Webpack', 'SASS', 'Jest'],
        experience_level: 'intermediate',
        soft_skills: ['Attention to Detail', 'Creativity', 'User Experience']
      },
      'Backend Developer': {
        required: ['Python', 'SQL', 'REST API', 'Git'],
        preferred: ['Django', 'PostgreSQL', 'Docker', 'Redis', 'Microservices'],
        experience_level: 'intermediate',
        soft_skills: ['Problem Solving', 'System Thinking', 'Performance Optimization']
      },
      'Data Scientist': {
        required: ['Python', 'SQL', 'Statistics', 'Machine Learning'],
        preferred: ['R', 'TensorFlow', 'Pandas', 'Jupyter', 'Tableau'],
        experience_level: 'intermediate',
        soft_skills: ['Analytical Thinking', 'Communication', 'Business Acumen']
      }
    };
  }
}

module.exports = SkillsGapAnalyzer;