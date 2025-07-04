const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const util = require('util');

class Database {
  constructor() {
    this.db = new sqlite3.Database(
      path.join(__dirname, '..', 'techmap.db'),
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE | sqlite3.OPEN_FULLMUTEX,
      (err) => {
        if (err) {
          console.error('🚨 Database connection error:', err.message);
          process.exit(1); // Critical failure, exit process
        }
        console.log('✅ Connected to SQLite database');
      }
    );

    // Promisify database methods
    this.run = util.promisify(this.db.run).bind(this.db);
    this.get = util.promisify(this.db.get).bind(this.db);
    this.all = util.promisify(this.db.all).bind(this.db);
    this.exec = util.promisify(this.db.exec).bind(this.db);

    // Initialize database
    this.initialize()
      .then(() => console.log('🛠️ Database initialized'))
      .catch(err => console.error('❌ Database initialization failed:', err));
  }

  async initialize() {
    try {
      // Enable performance optimizations
      await this.run('PRAGMA journal_mode = WAL;');
      await this.run('PRAGMA synchronous = NORMAL;');
      await this.run('PRAGMA foreign_keys = ON;');
      await this.run('PRAGMA busy_timeout = 5000;');
      
      // Create tables if not exists
      await this.exec(`
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
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        
        -- Add other table creation queries here
      `);
      
      // Create indexes
      await this.run('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);');
      await this.run('CREATE INDEX IF NOT EXISTS idx_styles_user ON learning_styles(user_id);');
    } catch (err) {
      throw new Error(`Initialization failed: ${err.message}`);
    }
  }

  // Add custom methods as needed
  async transaction(operations) {
    await this.run('BEGIN TRANSACTION');
    try {
      await operations();
      await this.run('COMMIT');
    } catch (err) {
      await this.run('ROLLBACK');
      throw err;
    }
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close(err => {
        if (err) reject(err);
        else {
          console.log('🔌 Database connection closed');
          resolve();
        }
      });
    });
  }
}

// Singleton pattern for database instance
let dbInstance = null;

function getDB() {
  if (!dbInstance) {
    dbInstance = new Database();
    
    // Cleanup on process exit
    process.on('SIGINT', async () => {
      await dbInstance.close();
      process.exit(0);
    });
    
    process.on('exit', async () => {
      await dbInstance.close();
    });
  }
  return dbInstance;
}

module.exports = getDB();