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
      url TEXT,
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
  console.log('✅ Database initialization completed!');
});
