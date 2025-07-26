const db = require('./database');
const fs = require('fs').promises;
const path = require('path');

class MigrationManager {
  constructor() {
    this.currentVersion = '1.0.0';
    this.targetVersion = '2.0.0';
    this.backupPath = path.join(__dirname, '../../backups');
  }
  
  async performMigration() {
    console.log('Starting database migration to enhanced schema...');
    
    try {
      // Create backup
      await this.createBackup();
      
      // Check current schema version
      const currentVersion = await this.getCurrentSchemaVersion();
      console.log(`Current schema version: ${currentVersion}`);
      
      if (currentVersion === this.targetVersion) {
        console.log('Database is already at target version');
        return true;
      }
      
      // Begin transaction
      await this.beginTransaction();
      
      // Migrate existing data
      await this.migrateExistingData();
      
      // Create new tables
      await this.createEnhancedTables();
      
      // Update schema version
      await this.updateSchemaVersion();
      
      // Commit transaction
      await this.commitTransaction();
      
      console.log('Migration completed successfully');
      return true;
      
    } catch (error) {
      console.error('Migration failed:', error);
      await this.rollbackTransaction();
      await this.restoreBackup();
      throw error;
    }
  }
  
  async migrateExistingData() {
    console.log('Migrating existing data...');
    
    // Migrate users table
    await this.migrateUsers();
    
    // Migrate trending data
    await this.migrateTrendingData();
    
    // Migrate resume data
    await this.migrateResumeData();
    
    // Migrate learning styles
    await this.migrateLearningStyles();
    
    console.log('Data migration completed');
  }
  
  async migrateUsers() {
    const existingUsers = await this.query('SELECT * FROM users');
    
    for (const user of existingUsers) {
      await this.query(`
        INSERT INTO users_enhanced (
          id, google_id, username, email, display_name, last_login_date, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        user.id,
        user.google_id,
        user.username,
        user.email,
        user.display_name || user.username,
        user.last_login_date,
        user.created_at || new Date().toISOString()
      ]);
    }
    
    console.log(`Migrated ${existingUsers.length} users`);
  }
  
  async migrateTrendingData() {
    const existingTrends = await this.query('SELECT * FROM trending_data');
    
    for (const trend of existingTrends) {
      // Determine category based on item name
      const category = this.categorizeTechnology(trend.item_name);
      
      await this.query(`
        INSERT INTO trending_data_enhanced (
          technology, category, popularity_score, data_sources, collection_date
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        trend.item_name,
        category,
        trend.trend_score || 0,
        JSON.stringify(['legacy_data']),
        trend.update_date || new Date().toISOString()
      ]);
    }
    
    console.log(`Migrated ${existingTrends.length} trend records`);
  }
  
  async migrateResumeData() {
    const existingResumes = await this.query('SELECT * FROM resume_data');
    
    for (const resume of existingResumes) {
      await this.query(`
        INSERT INTO resume_analysis_enhanced (
          user_id, original_text, upload_date, analysis_version
        ) VALUES (?, ?, ?, ?)
      `, [
        resume.user_id,
        resume.resume_text,
        resume.upload_date,
        '1.0'
      ]);
    }
    
    console.log(`Migrated ${existingResumes.length} resume records`);
  }
  
  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupPath, `techmap_backup_${timestamp}.db`);
    
    // Ensure backup directory exists
    await fs.mkdir(this.backupPath, { recursive: true });
    
    // Create backup using SQLite backup API
    await this.query('.backup ?', [backupFile]);
    
    console.log(`Database backup created: ${backupFile}`);
    return backupFile;
  }
  
  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (sql.startsWith('.')) {
        // Handle SQLite commands
        db.exec(sql, (err) => {
          if (err) reject(err);
          else resolve();
        });
      } else if (params.length > 0) {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        db.all(sql, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }
    });
  }
  
  categorizeTechnology(technology) {
    const languages = ['JavaScript', 'Python', 'Java', 'TypeScript', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby'];
    const frameworks = ['React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring'];
    const tools = ['Git', 'Docker', 'Kubernetes', 'Jenkins', 'Webpack'];
    
    if (languages.includes(technology)) return 'language';
    if (frameworks.includes(technology)) return 'framework';
    if (tools.includes(technology)) return 'tool';
    
    return 'skill'; // Default category
  }
}

module.exports = MigrationManager;