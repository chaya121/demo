import 'dotenv/config';
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
const { Pool } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../database');
const databaseType = process.env.DATABASE_TYPE || 'sqlite';
const databaseUrl = process.env.DATABASE_URL;
const isVercel = process.env.VERCEL === '1';

// Prevent SQLite usage on Vercel (serverless environment)
if (isVercel && databaseType !== 'postgresql') {
  throw new Error('SQLite is not supported on Vercel serverless. Please set DATABASE_TYPE=postgresql and provide DATABASE_URL for Supabase.');
}

if (isVercel && !databaseUrl) {
  throw new Error('DATABASE_URL is required on Vercel. Please provide your Supabase connection string.');
}

if (!isVercel && !fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'app.db');
let db;
let pgPool;

function persist() {
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

export async function initDb() {
  if (databaseType === 'postgresql' && databaseUrl) {
    // PostgreSQL setup for Supabase
    try {
      pgPool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
      });
      
      // Test connection
      await pgPool.query('SELECT NOW()');
      console.log('Connected to PostgreSQL/Supabase');
      
      // Create tables if they don't exist
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS records (
          id BIGINT PRIMARY KEY,
          data JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS master (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          data JSONB NOT NULL
        )
      `);
      
      return pgPool;
    } catch (err) {
      console.error('PostgreSQL connection failed, falling back to SQLite:', err.message);
      console.log('Switching to SQLite database...');
      // Fall through to SQLite setup
    }
  }

  if (pgPool) {
    return pgPool;
  } else {
    // SQLite setup
    const SQL = await initSqlJs();

    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }

    db.run(`
      CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS master (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        data TEXT NOT NULL
      )
    `);

    persist();
    return db;
  }
}

export async function getAllRecords() {
  if (databaseType === 'postgresql' && pgPool) {
    const result = await pgPool.query('SELECT id, data, created_at FROM records ORDER BY id DESC');
    return result.rows.map(row => ({
      ...row.data,
      id: row.id,
      created_at: row.created_at
    }));
  } else {
    const stmt = db.prepare('SELECT id, data, created_at FROM records ORDER BY id DESC');
    const rows = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      rows.push({
        ...JSON.parse(row.data),
        id: row.id,
      });
    }
    stmt.free();
    return rows;
  }
}

export async function createRecord(record) {
  const id = record.id || Date.now();
  const data = { ...record, id };
  
  if (databaseType === 'postgresql' && pgPool) {
    await pgPool.query(
      'INSERT INTO records (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2',
      [id, data]
    );
    return data;
  } else {
    const jsonData = JSON.stringify(data);
    db.run('INSERT INTO records (id, data) VALUES (?, ?)', [id, jsonData]);
    persist();
    return data;
  }
}

export async function bulkCreateRecords(records) {
  if (databaseType === 'postgresql' && pgPool) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      for (const record of records) {
        const id = record.id || Date.now();
        const data = { ...record, id };
        await client.query(
          'INSERT INTO records (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2',
          [id, data]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    return getAllRecords();
  } else {
    for (const record of records) {
      const id = record.id || Date.now();
      const data = JSON.stringify({ ...record, id });
      db.run('INSERT OR REPLACE INTO records (id, data) VALUES (?, ?)', [id, data]);
    }
    persist();
    return getAllRecords();
  }
}

export async function deleteRecord(id) {
  if (databaseType === 'postgresql' && pgPool) {
    const result = await pgPool.query('DELETE FROM records WHERE id = $1', [id]);
    return result.rowCount > 0;
  } else {
    db.run('DELETE FROM records WHERE id = ?', [id]);
    const changes = db.getRowsModified();
    if (changes > 0) persist();
    return changes > 0;
  }
}

export async function updateRecord(id, record) {
  const data = { ...record, id };
  
  if (databaseType === 'postgresql' && pgPool) {
    const result = await pgPool.query(
      'UPDATE records SET data = $1 WHERE id = $2 RETURNING data',
      [data, id]
    );
    if (result.rows.length === 0) {
      throw new Error('Record not found');
    }
    return result.rows[0].data;
  } else {
    const jsonData = JSON.stringify(data);
    db.run('UPDATE records SET data = ? WHERE id = ?', [jsonData, id]);
    const changes = db.getRowsModified();
    if (changes === 0) {
      throw new Error('Record not found');
    }
    persist();
    return data;
  }
}

export async function getMaster() {
  if (databaseType === 'postgresql' && pgPool) {
    const result = await pgPool.query('SELECT data FROM master WHERE id = 1');
    return result.rows.length > 0 ? result.rows[0].data : null;
  } else {
    const stmt = db.prepare('SELECT data FROM master WHERE id = 1');
    if (!stmt.step()) {
      stmt.free();
      return null;
    }
    const row = stmt.getAsObject();
    stmt.free();
    return JSON.parse(row.data);
  }
}

export async function saveMaster(data) {
  if (databaseType === 'postgresql' && pgPool) {
    await pgPool.query(
      'INSERT INTO master (id, data) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET data = $1',
      [data]
    );
    return data;
  } else {
    const json = JSON.stringify(data);
    db.run(`
      INSERT INTO master (id, data) VALUES (1, ?)
      ON CONFLICT(id) DO UPDATE SET data = excluded.data
    `, [json]);
    persist();
    return data;
  }
}

export async function clearAllData() {
  if (databaseType === 'postgresql' && pgPool) {
    const recordResult = await pgPool.query('SELECT COUNT(*) FROM records');
    const recordCount = parseInt(recordResult.rows[0].count);
    
    const masterResult = await pgPool.query('SELECT COUNT(*) FROM master');
    const masterCount = parseInt(masterResult.rows[0].count);
    
    await pgPool.query('DELETE FROM records');
    await pgPool.query('DELETE FROM master');
    
    return {
      recordsDeleted: recordCount,
      masterDeleted: masterCount
    };
  } else {
    const recordStmt = db.prepare('SELECT COUNT(*) as count FROM records');
    recordStmt.step();
    const recordCount = recordStmt.getAsObject().count;
    recordStmt.free();
    
    const masterStmt = db.prepare('SELECT COUNT(*) as count FROM master');
    masterStmt.step();
    const masterCount = masterStmt.getAsObject().count;
    masterStmt.free();
    
    db.run('DELETE FROM records');
    db.run('DELETE FROM master');
    persist();
    
    return {
      recordsDeleted: recordCount,
      masterDeleted: masterCount
    };
  }
}
