CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  google_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

CREATE TABLE IF NOT EXISTS learning_styles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  visual REAL NOT NULL,
  auditory REAL NOT NULL,
  kinesthetic REAL NOT NULL,
  reading REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  style TEXT CHECK(style IN ('visual', 'auditory', 'kinesthetic', 'reading')) NOT NULL,
  technology TEXT NOT NULL
);

-- Seed sample resources
INSERT INTO resources (title, url, style, technology) VALUES
('React Visual Guide', 'https://example.com/react-visual', 'visual', 'React'),
('JavaScript Audio Course', 'https://example.com/js-audio', 'auditory', 'JavaScript'),
('Node.js Hands-On Lab', 'https://example.com/node-kinesthetic', 'kinesthetic', 'Node.js'),
('Python Documentation', 'https://example.com/python-docs', 'reading', 'Python');

-- Add similar CREATE TABLE statements for projects, trending_data, resume_data