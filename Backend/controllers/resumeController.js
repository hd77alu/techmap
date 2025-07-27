const db = require('../models/database');

// Helper function to get trending data
function getTrendingData() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM trending_data ORDER BY trend_score DESC', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Helper function to get projects data
function getProjectsData() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM projects', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Enhanced resume analysis with trending data integration
exports.analyze = async (req, res) => {
    try {
        const { text } = req.body;
        
        // Validate input
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Resume text is required',
                message: 'Please provide resume text for analysis'
            });
        }

        if (text.length > 50000) {
            return res.status(400).json({ 
                error: 'Resume text too long',
                message: 'Resume text must be less than 50,000 characters'
            });
        }

        // Get trending data and projects
        const [trendingData, projectsData] = await Promise.all([
            getTrendingData(),
            getProjectsData()
        ]);

        // Clean and prepare resume text
        const resumeText = text.toLowerCase();
        
        // Enhanced skill extraction with trending data
        const detectedSkills = [];
        const marketAlignment = {};
        let totalMarketScore = 0;
        let marketableSkillsCount = 0;

        // Analyze against trending data
        trendingData.forEach(trend => {
            const trendName = (trend.item_name || trend.category || '').toLowerCase();
            if (trendName && resumeText.includes(trendName)) {
                detectedSkills.push({
                    skill: trend.item_name || trend.category,
                    category: trend.category,
                    marketScore: trend.trend_score || 0,
                    demand: getMarketDemand(trend.trend_score, trend.category),
                    context: extractSkillContext(resumeText, trendName)
                });
                
                marketAlignment[trend.category] = marketAlignment[trend.category] || [];
                marketAlignment[trend.category].push({
                    skill: trend.item_name || trend.category,
                    score: trend.trend_score || 0
                });
                
                totalMarketScore += trend.trend_score || 0;
                marketableSkillsCount++;
            }
        });

        // Calculate overall market alignment percentage
        const maxPossibleScore = Math.min(trendingData.length, 20) * 100; // Top 20 skills max score
        const alignmentPercentage = marketableSkillsCount > 0 
            ? Math.min(Math.round((totalMarketScore / maxPossibleScore) * 100), 100)
            : 0;

        // Generate project recommendations
        const projectRecommendations = generateProjectRecommendations(
            detectedSkills, 
            projectsData, 
            marketAlignment
        );

        // Analyze skill gaps
        const skillGaps = analyzeSkillGaps(detectedSkills, trendingData);

        // Generate learning recommendations
        const learningRecommendations = generateLearningRecommendations(skillGaps, trendingData);

        // Save analysis (optional - only if user is authenticated)
        if (req.user && req.user.id) {
            try {
                db.run(
                    "INSERT INTO resume_data(user_id, resume_text, upload_date) VALUES(?,?,datetime('now'))",
                    [req.user.id, text]
                );
            } catch (dbError) {
                console.warn('Could not save resume data:', dbError.message);
                // Continue with analysis even if saving fails
            }
        }

        // Prepare response
        const analysisResult = {
            summary: {
                totalSkillsDetected: detectedSkills.length,
                marketAlignmentPercentage: alignmentPercentage,
                topCategory: getTopCategory(marketAlignment),
                analysisDate: new Date().toISOString()
            },
            detectedSkills: detectedSkills.sort((a, b) => b.marketScore - a.marketScore),
            marketAlignment: marketAlignment,
            projectRecommendations: projectRecommendations.slice(0, 8), // Top 8 projects
            skillGaps: skillGaps.slice(0, 10), // Top 10 gaps
            learningRecommendations: learningRecommendations.slice(0, 5), // Top 5 recommendations
            insights: generateInsights(detectedSkills, alignmentPercentage, marketAlignment)
        };

        res.json(analysisResult);

    } catch (error) {
        console.error('Resume analysis error:', error);
        res.status(500).json({ 
            error: 'Analysis failed',
            message: 'Unable to process resume. Please try again.'
        });
    }
};

// Helper functions
function getMarketDemand(score, category) {
    // Category-specific thresholds for better accuracy
    const thresholds = {
        'Language': { high: 45, medium: 25 },
        'Framework': { high: 30, medium: 17 },
        'Database': { high: 35, medium: 18 },
        'Developer Tool': { high: 40, medium: 20 },
        'Cloud Platform': { high: 35, medium: 15 },
        'Management Tool': { high: 30, medium: 15 },
        'Job Role': { high: 15, medium: 5 },
        'Software Challenges': { high: 40, medium: 20 }
    };
    
    // Get thresholds for the category, fallback to general thresholds
    const categoryThresholds = thresholds[category] || { high: 40, medium: 20 };
    
    if (score >= categoryThresholds.high) return 'High';
    if (score >= categoryThresholds.medium) return 'Medium';
    return 'Niche/Growing';
}

function getPriority(score, category) {
    // Use the same thresholds as demand for consistency
    const thresholds = {
        'Language': { high: 45, medium: 25 },
        'Framework': { high: 30, medium: 17 },
        'Database': { high: 35, medium: 18 },
        'Developer Tool': { high: 40, medium: 20 },
        'Cloud Platform': { high: 35, medium: 15 },
        'Management Tool': { high: 30, medium: 15 },
        'Job Role': { high: 15, medium: 5 },
        'Software Challenges': { high: 40, medium: 20 }
    };
    
    const categoryThresholds = thresholds[category] || { high: 40, medium: 20 };
    
    if (score >= categoryThresholds.high) return 'High';
    if (score >= categoryThresholds.medium) return 'Medium';
    return 'Low';
}

function extractSkillContext(resumeText, skill) {
    const skillIndex = resumeText.indexOf(skill);
    if (skillIndex === -1) return '';
    
    const start = Math.max(0, skillIndex - 50);
    const end = Math.min(resumeText.length, skillIndex + skill.length + 50);
    return resumeText.substring(start, end).trim();
}

function generateProjectRecommendations(detectedSkills, projectsData, marketAlignment) {
    const skillNames = detectedSkills.map(s => s.skill.toLowerCase());
    
    return projectsData
        .map(project => {
            const projectSkills = (project.required_skills || '').toLowerCase();
            const matchingSkills = skillNames.filter(skill => 
                projectSkills.includes(skill)
            );
            
            const matchScore = matchingSkills.length / Math.max(1, skillNames.length);
            const marketScore = detectedSkills
                .filter(skill => projectSkills.includes(skill.skill.toLowerCase()))
                .reduce((sum, skill) => sum + skill.marketScore, 0) / 100;
            
            // Cap the final score at 100% for better UX
            const rawScore = (matchScore + Math.min(marketScore, 1.0)) * 50;
            const relevanceScore = Math.min(Math.round(rawScore), 100);
            
            return {
                ...project,
                matchingSkills: matchingSkills,
                relevanceScore: relevanceScore,
                recommendationReason: `Matches ${matchingSkills.length} of your skills`
            };
        })
        .filter(project => project.matchingSkills.length > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function analyzeSkillGaps(detectedSkills, trendingData) {
    const detectedSkillNames = detectedSkills.map(s => s.skill.toLowerCase());
    
    return trendingData
        .filter(trend => {
            const trendName = (trend.item_name || trend.category || '').toLowerCase();
            return trendName && !detectedSkillNames.includes(trendName) && trend.trend_score > 30;
        })
        .map(trend => ({
            skill: trend.item_name || trend.category,
            category: trend.category,
            marketScore: trend.trend_score || 0,
            demand: getMarketDemand(trend.trend_score, trend.category),
            priority: getPriority(trend.trend_score, trend.category),
            reason: `High market demand (${trend.trend_score}% usage) in ${trend.category} category`
        }))
        .sort((a, b) => b.marketScore - a.marketScore);
}

function generateLearningRecommendations(skillGaps, trendingData) {
    const highPriorityGaps = skillGaps.filter(gap => gap.priority === 'High');
    
    return highPriorityGaps.map(gap => ({
        skill: gap.skill,
        category: gap.category,
        priority: gap.priority,
        marketScore: gap.marketScore,
        learningPath: getLearningPath(gap.skill, gap.category),
        estimatedTime: getEstimatedLearningTime(gap.skill),
        resources: getRecommendedResources(gap.skill, gap.category)
    }));
}

function getLearningPath(skill, category) {
    const paths = {
        'Language': `Start with ${skill} fundamentals → Practice coding exercises → Build projects → Advanced concepts`,
        'Framework': `Learn prerequisites → ${skill} basics → Practice projects → Advanced patterns`,
        'Database': `Database fundamentals → ${skill} basics → Query optimization → Data modeling`,
        'Developer Tool': `Installation & setup → Basic usage → Advanced features → Integration`,
        'Cloud Platform': `Cloud concepts → ${skill} basics → Services & deployment → Best practices`
    };
    
    return paths[category] || `Learn ${skill} fundamentals → Practice → Advanced topics → Real projects`;
}

function getEstimatedLearningTime(skill) {
    const timeEstimates = {
        'Language': '3-6 months',
        'Framework': '2-4 months',
        'Database': '2-3 months',
        'Developer Tool': '2-4 weeks',
        'Cloud Platform': '1-3 months'
    };
    
    return timeEstimates[skill] || '1-3 months';
}

function getRecommendedResources(skill, category) {
    return [
        'Official documentation',
        'Interactive coding platforms',
        'Project-based tutorials',
        'Community forums'
    ];
}

function getTopCategory(marketAlignment) {
    const categoryScores = {};
    
    Object.keys(marketAlignment).forEach(category => {
        const totalScore = marketAlignment[category].reduce((sum, skill) => sum + skill.score, 0);
        categoryScores[category] = totalScore;
    });
    
    const topCategory = Object.keys(categoryScores).reduce((a, b) => 
        categoryScores[a] > categoryScores[b] ? a : b, 
        'General'
    );
    
    return topCategory;
}

function generateInsights(detectedSkills, alignmentPercentage, marketAlignment) {
    const insights = [];
    
    // Market alignment insight
    if (alignmentPercentage >= 70) {
        insights.push({
            type: 'positive',
            title: 'Strong Market Alignment',
            message: `Your skills are highly aligned with current market demands (${alignmentPercentage}%).`
        });
    } else if (alignmentPercentage >= 40) {
        insights.push({
            type: 'warning',
            title: 'Moderate Market Alignment',
            message: `Your skills have moderate market alignment (${alignmentPercentage}%). Consider learning trending technologies.`
        });
    } else {
        insights.push({
            type: 'info',
            title: 'Skill Development Opportunity',
            message: `Focus on learning high-demand skills to improve market alignment (currently ${alignmentPercentage}%).`
        });
    }
    
    // Skills diversity insight
    const categories = Object.keys(marketAlignment);
    if (categories.length >= 3) {
        insights.push({
            type: 'positive',
            title: 'Diverse Skill Set',
            message: `You have skills across ${categories.length} different technology categories.`
        });
    } else {
        insights.push({
            type: 'info',
            title: 'Skill Diversification',
            message: 'Consider expanding your skills to other technology areas for better opportunities.'
        });
    }
    
    // Top skills insight
    const topSkills = detectedSkills.slice(0, 3).map(s => s.skill);
    if (topSkills.length > 0) {
        insights.push({
            type: 'info',
            title: 'Your Strongest Skills',
            message: `Your top market-aligned skills are: ${topSkills.join(', ')}.`
        });
    }
    
    return insights;
}