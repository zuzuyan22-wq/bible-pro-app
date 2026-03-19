import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

class DatabaseManager {
  constructor(dbPath = './database.sqlite') {
    this.dbPath = dbPath;
    this.db = null;
    this.isInitialized = false;
  }

  // Initialize database connection
  async initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Database connection error:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.db.run('PRAGMA foreign_keys = ON', (err) => {
            if (err) reject(err);
            else {
              this.isInitialized = true;
              resolve(true);
            }
          });
        }
      });
    });
  }

  // Create schema
  async createSchema() {
    if (!this.isInitialized) await this.initialize();

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const statements = schema.split(';').filter(s => s.trim());

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        let completed = 0;
        statements.forEach((statement) => {
          if (statement.trim()) {
            this.db.run(statement, (err) => {
              if (err && !err.message.includes('already exists')) {
                console.error('Schema error:', err);
                reject(err);
              } else {
                completed++;
                if (completed === statements.length) {
                  console.log('Schema created successfully');
                  resolve(true);
                }
              }
            });
          }
        });
      });
    });
  }

  // Execute query
  async query(sql, params = []) {
    if (!this.isInitialized) await this.initialize();

    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Execute single row query
  async queryOne(sql, params = []) {
    if (!this.isInitialized) await this.initialize();

    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Execute update/insert/delete
  async execute(sql, params = []) {
    if (!this.isInitialized) await this.initialize();

    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  // Batch insert
  async batchInsert(sql, rows) {
    if (!this.isInitialized) await this.initialize();

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        let inserted = 0;

        rows.forEach((row) => {
          this.db.run(sql, row, (err) => {
            if (err) {
              this.db.run('ROLLBACK');
              reject(err);
            } else {
              inserted++;
              if (inserted === rows.length) {
                this.db.run('COMMIT', (err) => {
                  if (err) reject(err);
                  else resolve(inserted);
                });
              }
            }
          });
        });
      });
    });
  }

  // Transaction
  async transaction(callback) {
    if (!this.isInitialized) await this.initialize();

    return new Promise((resolve, reject) => {
      this.db.run('BEGIN TRANSACTION', async (err) => {
        if (err) reject(err);
        try {
          const result = await callback();
          this.db.run('COMMIT', (err) => {
            if (err) reject(err);
            else resolve(result);
          });
        } catch (error) {
          this.db.run('ROLLBACK', () => reject(error));
        }
      });
    });
  }

  // Close database
  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) reject(err);
          else {
            this.isInitialized = false;
            resolve(true);
          }
        });
      } else {
        resolve(true);
      }
    });
  }

  // Backup database
  async backup(backupPath) {
    return new Promise((resolve, reject) => {
      const source = fs.createReadStream(this.dbPath);
      const destination = fs.createWriteStream(backupPath);

      source.on('error', reject);
      destination.on('error', reject);
      destination.on('finish', () => resolve(true));

      source.pipe(destination);
    });
  }
}

export default DatabaseManager;