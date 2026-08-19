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

if (databaseType === 'postgresql' && databaseUrl) {
  pgPool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000 // ให้ timeout เร็วขึ้นถ้าต่อไม่ได้
  });
  
  // สร้างตารางใน background ไม่ต้องรอ (Fire and forget)
  pgPool.query(`
    CREATE TABLE IF NOT EXISTS records (
      id BIGINT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS master (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data JSONB NOT NULL
    );
    CREATE TABLE IF NOT EXISTS job_counters (
      year INTEGER PRIMARY KEY,
      last_run INTEGER NOT NULL DEFAULT 0
    );
    INSERT INTO job_counters (year, last_run)
    SELECT
      substring(data->>'job_no' from 5 for 4)::int AS year,
      MAX(substring(data->>'job_no' from '[0-9]+$')::int) AS max_run
    FROM records
    WHERE data->>'job_no' IS NOT NULL AND length(data->>'job_no') >= 12
    GROUP BY substring(data->>'job_no' from 5 for 4)
    ON CONFLICT (year) DO UPDATE SET last_run = GREATEST(job_counters.last_run, EXCLUDED.last_run);
  `).catch(err => console.error('DB Init Error:', err.message));
}

function persist() {
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

export async function initDb() {
  if (databaseType === 'postgresql' && databaseUrl) {
    return pgPool;
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

    db.run(`
      CREATE TABLE IF NOT EXISTS job_counters (
        year INTEGER PRIMARY KEY,
        last_run INTEGER NOT NULL DEFAULT 0
      )
    `);

    db.run(`
      INSERT INTO job_counters (year, last_run)
      SELECT
        CAST(substr(json_extract(data, '$.job_no'), 5, 4) AS INTEGER) AS year,
        MAX(CAST(substr(json_extract(data, '$.job_no'), 10) AS INTEGER)) AS max_run
      FROM records
      WHERE json_extract(data, '$.job_no') IS NOT NULL AND length(json_extract(data, '$.job_no')) >= 12
      GROUP BY year
      ON CONFLICT(year) DO UPDATE SET last_run = MAX(last_run, excluded.last_run)
    `);

    persist();
    return db;
  }
}

// Strips the (potentially large, base64-encoded) `imgs` field from a record,
// keeping just a boolean so the UI can still show "this record has photos"
// without shipping the actual image bytes in the list response.
function stripImages(recordData) {
  const { imgs, ...rest } = recordData;
  return { ...rest, hasImages: Array.isArray(imgs) && imgs.length > 0 };
}

export async function getAllRecords() {
  if (databaseType === 'postgresql' && pgPool) {
    const result = await pgPool.query('SELECT id, data, created_at FROM records ORDER BY id DESC');
    return result.rows.map(row => ({
      ...stripImages(row.data),
      // pg returns BIGINT columns as strings to avoid precision loss; cast
      // back to Number so `id` is always the same type as a freshly-created
      // record's id (Date.now()), regardless of where the record came from.
      id: Number(row.id),
      created_at: row.created_at
    }));
  } else {
    const stmt = db.prepare('SELECT id, data, created_at FROM records ORDER BY id DESC');
    const rows = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      rows.push({
        ...stripImages(JSON.parse(row.data)),
        id: Number(row.id),
      });
    }
    stmt.free();
    return rows;
  }
}

export async function getRecordById(id) {
  if (databaseType === 'postgresql' && pgPool) {
    const result = await pgPool.query('SELECT id, data, created_at FROM records WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return { ...row.data, id: Number(row.id), created_at: row.created_at };
  } else {
    const stmt = db.prepare('SELECT id, data FROM records WHERE id = ?');
    stmt.bind([id]);
    if (!stmt.step()) {
      stmt.free();
      return null;
    }
    const row = stmt.getAsObject();
    stmt.free();
    return { ...JSON.parse(row.data), id: Number(row.id) };
  }
}

function getMerCode(merText) {
  if (!merText) return 'X';
  const firstChar = merText.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(firstChar) ? firstChar : 'X';
}

// DDMMYYYY + mer code + running number, e.g. "11082026J004". The running
// number is a per-year counter (not per-day/per-mer), matching the format
// established by the original scanning-based implementation.
function buildJobNoParts(record) {
  const dateObj = record.date ? new Date(record.date) : new Date();
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const yyyy = dateObj.getFullYear();
  const merCode = getMerCode(record.merText);
  return { dd, mm, yyyy, merCode };
}

// Atomically increments (and returns) the running counter for a year via a
// single UPSERT — no advisory lock, no scanning existing records for MAX(),
// so this can't hang waiting on a stuck lock and doesn't slow down as the
// records table grows.
async function nextRunNumberPg(client, yyyy) {
  const result = await client.query(
    `INSERT INTO job_counters (year, last_run) VALUES ($1, 1)
     ON CONFLICT (year) DO UPDATE SET last_run = job_counters.last_run + 1
     RETURNING last_run`,
    [yyyy]
  );
  return result.rows[0].last_run;
}

function nextRunNumberSqlite(yyyy) {
  db.run(
    `INSERT INTO job_counters (year, last_run) VALUES (?, 1)
     ON CONFLICT(year) DO UPDATE SET last_run = last_run + 1`,
    [yyyy]
  );
  const stmt = db.prepare('SELECT last_run FROM job_counters WHERE year = ?');
  stmt.bind([yyyy]);
  stmt.step();
  const row = stmt.getAsObject();
  stmt.free();
  return row.last_run;
}

async function generateJobNumberPg(client, record) {
  if (record.job_no) return record.job_no;
  const { dd, mm, yyyy, merCode } = buildJobNoParts(record);
  const runNum = await nextRunNumberPg(client, yyyy);
  return `${dd}${mm}${yyyy}${merCode}${String(runNum).padStart(3, '0')}`;
}

function generateJobNumberSqlite(record) {
  if (record.job_no) return record.job_no;
  const { dd, mm, yyyy, merCode } = buildJobNoParts(record);
  const runNum = nextRunNumberSqlite(yyyy);
  return `${dd}${mm}${yyyy}${merCode}${String(runNum).padStart(3, '0')}`;
}

export async function createRecord(record) {
  const id = record.id || Date.now();

  if (databaseType === 'postgresql' && pgPool) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const job_no = await generateJobNumberPg(client, record);
      const data = { ...record, id, job_no };

      await client.query(
        'INSERT INTO records (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2',
        [id, data]
      );
      await client.query('COMMIT');
      return data;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } else {
    const job_no = generateJobNumberSqlite(record);
    const data = { ...record, id, job_no };

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
        const job_no = await generateJobNumberPg(client, record);
        const data = { ...record, id, job_no };

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
      const job_no = generateJobNumberSqlite(record);
      const data = { ...record, id, job_no };

      const jsonData = JSON.stringify(data);
      db.run('INSERT OR REPLACE INTO records (id, data) VALUES (?, ?)', [id, jsonData]);
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
