-- =====================================================
-- ENHANCED TECHMAP DATABASE SCHEMA
-- Version: 2.0
-- Date: July 26, 2025
-- =====================================================

-- Preserve existing tables with enhancements
-- Users table (enhanced with additional fields)
CREATE TABLE IF NOT EXISTS users_enhanced (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  google_id TEXT UNIQUE,
  username TEXT,
  email TEXT UNIQUE,
  display_name TEXT,
  profile_picture_url TEXT,
  
  -- Enhanced user preferences
  preferred_learning_style TEXT CHECK(preferred_learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading')),
  career_goals TEXT, -- JSON array of career objectives
  target_roles TEXT, -- JSON array of target job roles
  experience_level TEXT CHECK(experience_level IN ('entry', 'junior', 'mid', 'senior', 'lead')),
  
  -- Engagement tracking
  last_login_date DATETIME,
  total_login_count INTEGER DEFAULT 0,
  profile_completion_score REAL DEFAULT 0.0,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Privacy and notification settings
  email_notifications BOOLEAN DEFAULT TRUE,
  trend_alerts BOOLEAN DEFAULT TRUE,
  privacy_level TEXT DEFAULT 'standard' CHECK(privacy_level IN ('minimal', 'standard', 'full'))
);

-- Enhanced trending data with comprehensive metrics
CREATE TABLE IF NOT EXISTS trending_data_enhanced (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  technology TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('language', 'framework', 'tool', 'job_role', 'skill', 'methodology')),
  
  -- Data source metrics
  github_stars INTEGER DEFAULT 0,
  github_repos_count INTEGER DEFAULT 0,
  github_weekly_commits INTEGER DEFAULT 0,
  github_contributors INTEGER DEFAULT 0,
  
  stackoverflow_questions INTEGER DEFAULT 0,
  stackoverflow_weekly_questions INTEGER DEFAULT 0,
  stackoverflow_answer_ratio REAL DEFAULT 0.0,
  
  job_postings_count INTEGER DEFAULT 0,
  job_postings_growth REAL DEFAULT 0.0,
  average_salary INTEGER DEFAULT 0,
  salary_growth REAL DEFAULT 0.0,
  
  -- Calculated composite scores (0-100 scale)
  popularity_score REAL DEFAULT 0.0,
  growth_rate REAL DEFAULT 0.0,
  demand_score REAL DEFAULT 0.0,
  market_momentum REAL DEFAULT 0.0,
  learning_curve_score REAL DEFAULT 0.0, -- How easy it is to learn
  
  -- Data quality and metadata
  data_sources TEXT NOT NULL, -- JSON array of source names
  data_quality_score REAL DEFAULT 1.0,
  confidence_interval REAL DEFAULT 0.95,
  collection_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Performance indexes
  UNIQUE(technology, category, collection_date),
  INDEX idx_technology (technology),
  INDEX idx_category (category),
  INDEX idx_popularity (popularity_score DESC),
  INDEX idx_growth (growth_rate DESC),
  INDEX idx_updated (last_updated DESC)
);

-- Historical trends for time-series analysis
CREATE TABLE IF NOT EXISTS trend_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  technology TEXT NOT NULL,
  category TEXT NOT NULL,
  
  -- Historical metrics
  popularity_score REAL,
  growth_rate REAL,
  demand_score REAL,
  job_postings_count INTEGER,
  average_salary INTEGER,
  
  -- Time tracking
  recorded_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_period TEXT DEFAULT 'daily' CHECK(data_period IN ('daily', 'weekly', 'monthly')),
  
  -- Performance indexes
  INDEX idx_tech_date (technology, recorded_date),
  INDEX idx_category_date (category, recorded_date),
  INDEX idx_period (data_period, recorded_date)
);

-- Enhanced resume analysis with comprehensive parsing
CREATE TABLE IF NOT EXISTS resume_analysis_enhanced (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  
  -- Resume content
  original_text TEXT NOT NULL,
  cleaned_text TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  
  -- Parsing results (stored as JSON)
  parsed_sections TEXT, -- JSON object with all parsed sections
  extracted_skills TEXT, -- JSON object with categorized skills
  experience_summary TEXT, -- JSON object with work experience analysis
  education_summary TEXT, -- JSON object with education details
  
  -- Analysis metrics
  completeness_score REAL DEFAULT 0.0,
  ats_compatibility_score REAL DEFAULT 0.0,
  readability_score REAL DEFAULT 0.0,
  keyword_density REAL DEFAULT 0.0,
  
  -- Market alignment
  market_alignment_score REAL DEFAULT 0.0,
  target_role TEXT,
  role_match_percentage REAL DEFAULT 0.0,
  
  -- Timestamps
  upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_analyzed DATETIME DEFAULT CURRENT_TIMESTAMP,
  analysis_version TEXT DEFAULT '2.0',
  
  FOREIGN KEY(user_id) REFERENCES users_enhanced(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, upload_date),
  INDEX idx_target_role (target_role),
  INDEX idx_market_alignment (market_alignment_score DESC)
);

-- Detailed skill extraction and tracking
CREATE TABLE IF NOT EXISTS extracted_skills_enhanced (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resume_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  
  -- Skill details
  skill_name TEXT NOT NULL,
  skill_category TEXT NOT NULL,
  skill_subcategory TEXT,
  
  -- Experience and proficiency
  experience_level TEXT CHECK(experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_experience REAL DEFAULT 0.0,
  mention_count INTEGER DEFAULT 1,
  context_quality REAL DEFAULT 0.0, -- Quality of skill mentions in context
  
  -- Confidence and validation
  confidence_score REAL DEFAULT 0.0,
  validation_source TEXT, -- How the skill was validated
  last_used_date DATE,
  
  -- Market relevance
  market_demand REAL DEFAULT 0.0,
  trend_score REAL DEFAULT 0.0,
  salary_impact REAL DEFAULT 0.0,
  
  -- Timestamps
  extracted_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY(resume_id) REFERENCES resume_analysis_enhanced(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users_enhanced(id) ON DELETE CASCADE,
  UNIQUE(resume_id, skill_name),
  INDEX idx_skill_category (skill_category),
  INDEX idx_experience_level (experience_level),
  INDEX idx_market_demand (market_demand DESC)
);

-- Comprehensive skill recommendations
CREATE TABLE IF NOT EXISTS skill_recommendations_enhanced (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  
  -- Recommendation details
  skill_name TEXT NOT NULL,
  recommendation_type TEXT CHECK(recommendation_type IN ('learn', 'improve', 'certify', 'practice', 'specialize')),
  priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Market context
  market_demand REAL DEFAULT 0.0,
  trend_score REAL DEFAULT 0.0,
  growth_potential REAL DEFAULT 0.0,
  salary_impact INTEGER DEFAULT 0,
  
  -- Learning guidance
  estimated_learning_time INTEGER, -- in hours
  difficulty_level TEXT CHECK(difficulty_level IN ('easy', 'moderate', 'challenging', 'advanced')),
  prerequisites TEXT, -- JSON array of prerequisite skills
  learning_resources TEXT, -- JSON array of recommended resources
  
  -- Progress tracking
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'skipped')),
  progress_percentage REAL DEFAULT 0.0,
  started_date DATETIME,
  target_completion_date DATETIME,
  actual_completion_date DATETIME,
  
  -- Recommendation metadata
  recommendation_reason TEXT,
  confidence_score REAL DEFAULT 0.0,
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY(user_id) REFERENCES users_enhanced(id) ON DELETE CASCADE,
  INDEX idx_user_priority (user_id, priority),
  INDEX idx_status (status),
  INDEX idx_market_demand (market_demand DESC)
);

-- Enhanced job role requirements with detailed specifications
CREATE TABLE IF NOT EXISTS job_role_requirements_enhanced (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Role identification
  role_name TEXT NOT NULL,
  role_category TEXT,
  seniority_level TEXT CHECK(seniority_level IN ('entry', 'junior', 'mid', 'senior', 'lead', 'principal')),
  
  -- Skill requirements (stored as JSON for flexibility)
  required_skills TEXT NOT NULL, -- JSON array with skill levels
  preferred_skills TEXT, -- JSON array with skill levels
  soft_skills TEXT, -- JSON array of soft skills
  
  -- Experience requirements
  min_years_experience INTEGER DEFAULT 0,
  max_years_experience INTEGER,
  education_requirements TEXT, -- JSON array of education requirements
  certification_requirements TEXT, -- JSON array of certifications
  
  -- Market data
  average_salary INTEGER,
  salary_range_min INTEGER,
  salary_range_max INTEGER,
  job_growth_rate REAL DEFAULT 0.0,
  market_demand_score REAL DEFAULT 0.0,
  
  -- Geographic and industry data
  common_industries TEXT, -- JSON array of industries
  remote_friendly BOOLEAN DEFAULT FALSE,
  location_flexibility REAL DEFAULT 0.0,
  
  -- Metadata
  data_source TEXT,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(role_name, seniority_level),
  INDEX idx_role_name (role_name),
  INDEX idx_seniority (seniority_level),
  INDEX idx_salary (average_salary DESC)
);

-- User learning progress and achievements
CREATE TABLE IF NOT EXISTS user_learning_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  
  -- Learning activity
  skill_name TEXT NOT NULL,
  activity_type TEXT CHECK(activity_type IN ('course', 'project', 'certification', 'practice', 'reading')),
  activity_name TEXT,
  activity_url TEXT,
  
  -- Progress tracking
  status TEXT CHECK(status IN ('not_started', 'in_progress', 'completed', 'paused')),
  progress_percentage REAL DEFAULT 0.0,
  time_spent_hours REAL DEFAULT 0.0,
  
  -- Dates
  started_date DATETIME,
  last_activity_date DATETIME,
  completed_date DATETIME,
  target_completion_date DATETIME,
  
  -- Quality metrics
  completion_quality REAL DEFAULT 0.0, -- Self-assessed or system-calculated quality
  knowledge_retention REAL DEFAULT 0.0, -- Based on follow-up assessments
  practical_application REAL DEFAULT 0.0, -- Based on project work
  
  -- Metadata
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY(user_id) REFERENCES users_enhanced(id) ON DELETE CASCADE,
  INDEX idx_user_skill (user_id, skill_name),
  INDEX idx_status (status),
  INDEX idx_activity_date (last_activity_date DESC)
);

-- User trend preferences and notifications
CREATE TABLE IF NOT EXISTS user_trend_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  
  -- Tracking preferences
  preferred_technologies TEXT, -- JSON array of technologies to track
  preferred_categories TEXT, -- JSON array of categories to focus on
  notification_threshold REAL DEFAULT 0.8, -- Minimum trend score for notifications
  
  -- Notification settings
  email_notifications BOOLEAN DEFAULT FALSE,
  push_notifications BOOLEAN DEFAULT TRUE,
  weekly_digest BOOLEAN DEFAULT TRUE,
  trend_alerts BOOLEAN DEFAULT TRUE,
  
  -- Frequency settings
  notification_frequency TEXT DEFAULT 'weekly' CHECK(notification_frequency IN ('daily', 'weekly', 'monthly')),
  digest_day TEXT DEFAULT 'monday' CHECK(digest_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  
  -- Last notification tracking
  last_notification_date DATETIME,
  last_digest_date DATETIME,
  
  -- Timestamps
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY(user_id) REFERENCES users_enhanced(id) ON DELETE CASCADE,
  UNIQUE(user_id)
);

-- System analytics and performance tracking
CREATE TABLE IF NOT EXISTS system_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Analytics type and data
  metric_name TEXT NOT NULL,
  metric_category TEXT NOT NULL,
  metric_value REAL NOT NULL,
  metric_unit TEXT,
  
  -- Dimensions
  user_id INTEGER,
  session_id TEXT,
  feature_name TEXT,
  
  -- Context data (stored as JSON)
  context_data TEXT,
  
  -- Timestamps
  recorded_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_metric_name (metric_name),
  INDEX idx_category_date (metric_category, recorded_date),
  INDEX idx_user_date (user_id, recorded_date)
);

-- Data migration and versioning
CREATE TABLE IF NOT EXISTS schema_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT NOT NULL UNIQUE,
  description TEXT,
  migration_sql TEXT,
  applied_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  rollback_sql TEXT
);

-- Insert initial migration record
INSERT OR IGNORE INTO schema_migrations (version, description) 
VALUES ('2.0.0', 'Enhanced schema with comprehensive trends and resume analysis');