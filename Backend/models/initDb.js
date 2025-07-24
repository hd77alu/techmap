const db = require('./database');

db.serialize(() => {
  console.log('🔧 Initializing Techmap Database...');

  // USERS
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      google_id TEXT UNIQUE,
      username TEXT,
      email TEXT UNIQUE,
      last_login_date TEXT
    )
  `);

  // LEARNING STYLES
  db.run(`
    CREATE TABLE IF NOT EXISTS learning_styles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      visual REAL NOT NULL DEFAULT 0,
      auditory REAL NOT NULL DEFAULT 0,
      kinesthetic REAL NOT NULL DEFAULT 0,
      reading REAL NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // STUDY PATTERNS (Optional for extended features)
  db.run(`
    CREATE TABLE IF NOT EXISTS study_patterns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      date TEXT,
      duration_minutes INTEGER,
      tech_subject TEXT,
      activity_type TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // RESOURCES
  db.run(`
    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      type TEXT,
      url TEXT,
      recommended_style TEXT,
      tech_tags TEXT
    )
  `);

  // PROJECTS
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      github_url TEXT,
      industry TEXT,
      required_skills TEXT
    )
  `);

  // TRENDING DATA
  db.run(`
    CREATE TABLE IF NOT EXISTS trending_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT,
      item_name TEXT,
      trend_score REAL,
      update_date TEXT
    )
  `);

  // RESUME DATA
  db.run(`
    CREATE TABLE IF NOT EXISTS resume_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      resume_text TEXT,
      upload_date TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  console.log('✅ Tables created successfully!');

  // SAMPLE DATA
  db.run(`
    INSERT OR IGNORE INTO users (google_id, username, email, last_login_date)
    VALUES ('12345', 'Test User', 'testuser@example.com', datetime('now'))
  `);

  db.run(`
    INSERT OR IGNORE INTO learning_styles (user_id, visual, auditory, kinesthetic, reading, created_at)
    VALUES (1, 40, 30, 20, 10, datetime('now'))
  `);

  db.run(`
    INSERT INTO resources (name, type, url, recommended_style, tech_tags)
    VALUES 
    ('JavaScript Crash Course', 'Video', 'https://youtube.com/jscrashcourse', 'Visual', 'JavaScript,Frontend'),
    ('Python for Beginners', 'Course', 'https://coursera.org/python-course', 'Reading/Writing', 'Python'),
    ('Data Structures Handbook', 'Article', 'https://ds-guide.com', 'Reading/Writing', 'Algorithms,Data Structures')
  `);

  db.run(`
    INSERT INTO projects (name, description, github_url, industry, required_skills)
    VALUES 
    ('Health Tracker App', 'A simple web app to monitor heart rate and steps.', 'https://github.com/example/health-tracker', 'Healthcare', 'JavaScript,HTML,CSS'),
    ('Stock Market Analyzer', 'Analyze stock trends using basic Python logic.', 'https://github.com/example/stock-analyzer', 'Finance', 'Python,Pandas,Matplotlib'),
    ('Football Match Predictor', 'A web app that predicts outcomes of football games.', 'https://github.com/example/football-predictor', 'Sports', 'Python,Machine Learning,Flask')
  `);

  db.run(`
    INSERT INTO trending_data (category, item_name, trend_score, update_date)
    VALUES 
    ('Language', 'Python', 95.6, '2025-07-01'),
    ('Language', 'JavaScript', 93.4, '2025-07-01'),
    ('Framework', 'React', 90.1, '2025-07-01'),
    ('Job Role', 'Full-Stack Developer', 89.2, '2025-07-01')
  `);

  console.log('✅ Sample data inserted successfully!');
});
