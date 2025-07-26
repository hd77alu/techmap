const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class BackupService {
  constructor() {
    this.dbPath = process.env.DB_PATH || '/var/lib/techmap/database.db';
    this.backupDir = process.env.BACKUP_DIR || '/var/backups/techmap';
    this.retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;
  }
  
  async performBackup() {
    console.log('Starting database backup...');
    
    try {
      // Ensure backup directory exists
      await fs.mkdir(this.backupDir, { recursive: true });
      
      // Create backup filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupDir, `techmap_backup_${timestamp}.db`);
      
      // Perform SQLite backup
      await this.createSQLiteBackup(backupFile);
      
      // Compress backup
      const compressedFile = await this.compressBackup(backupFile);
      
      // Remove uncompressed backup
      await fs.unlink(backupFile);
      
      // Clean old backups
      await this.cleanOldBackups();
      
      // Verify backup integrity
      await this.verifyBackup(compressedFile);
      
      console.log(`Backup completed successfully: ${compressedFile}`);
      return compressedFile;
      
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  }
  
  async createSQLiteBackup(backupFile) {
    const command = `sqlite3 "${this.dbPath}" ".backup '${backupFile}'"`;
    await execAsync(command);
  }
  
  async compressBackup(backupFile) {
    const compressedFile = `${backupFile}.gz`;
    const command = `gzip "${backupFile}"`;
    await execAsync(command);
    return compressedFile;
  }
  
  async cleanOldBackups() {
    const files = await fs.readdir(this.backupDir);
    const backupFiles = files.filter(file => file.startsWith('techmap_backup_') && file.endsWith('.gz'));
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
    
    for (const file of backupFiles) {
      const filePath = path.join(this.backupDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime < cutoffDate) {
        await fs.unlink(filePath);
        console.log(`Removed old backup: ${file}`);
      }
    }
  }
  
  async verifyBackup(backupFile) {
    // Decompress and verify the backup can be opened
    const tempFile = backupFile.replace('.gz', '.temp');
    
    try {
      await execAsync(`gunzip -c "${backupFile}" > "${tempFile}"`);
      await execAsync(`sqlite3 "${tempFile}" "SELECT COUNT(*) FROM sqlite_master;"`);
      await fs.unlink(tempFile);
      console.log('Backup verification successful');
    } catch (error) {
      await fs.unlink(tempFile).catch(() => {}); // Clean up temp file
      throw new Error(`Backup verification failed: ${error.message}`);
    }
  }
}

module.exports = BackupService;