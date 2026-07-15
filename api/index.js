import {
  initDb,
  getAllRecords,
  createRecord,
  bulkCreateRecords,
  deleteRecord,
  updateRecord,
  getMaster,
  saveMaster,
  clearAllData,
} from '../backend/db.js';

// Initialize database connection
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initDb();
    dbInitialized = true;
  }
}

export default async function handler(req, res) {
  await ensureDbInitialized();

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  try {
    if (path === '/health') {
      res.json({ ok: true });
    } else if (path === '/records' && req.method === 'GET') {
      res.json(await getAllRecords());
    } else if (path === '/records' && req.method === 'POST') {
      const record = await createRecord(req.body);
      res.status(201).json(record);
    } else if (path === '/records/bulk' && req.method === 'POST') {
      const { records } = req.body;
      if (!Array.isArray(records)) {
        return res.status(400).json({ error: 'records must be an array' });
      }
      res.json(await bulkCreateRecords(records));
    } else if (path.startsWith('/records/') && req.method === 'DELETE') {
      const id = Number(path.split('/')[2]);
      if (!id) return res.status(400).json({ error: 'Invalid id' });
      const deleted = await deleteRecord(id);
      if (!deleted) return res.status(404).json({ error: 'Record not found' });
      res.json({ ok: true });
    } else if (path.startsWith('/records/') && req.method === 'PUT') {
      const id = Number(path.split('/')[2]);
      if (!id) return res.status(400).json({ error: 'Invalid id' });
      const updated = await updateRecord(id, req.body);
      res.json(updated);
    } else if (path === '/master' && req.method === 'GET') {
      res.json(await getMaster());
    } else if (path === '/master' && req.method === 'PUT') {
      const data = await saveMaster(req.body);
      res.json(data);
    } else if (path === '/clear' && req.method === 'DELETE') {
      const result = await clearAllData();
      res.json({ ok: true, ...result });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
