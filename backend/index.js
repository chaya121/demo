import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
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
} from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/records', async (_req, res) => {
  try {
    res.json(await getAllRecords());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

app.post('/api/records', async (req, res) => {
  try {
    const record = await createRecord(req.body);
    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

app.post('/api/records/bulk', async (req, res) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records)) {
      return res.status(400).json({ error: 'records must be an array' });
    }
    res.json(await bulkCreateRecords(records));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to import records' });
  }
});

app.delete('/api/records/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const deleted = await deleteRecord(id);
    if (!deleted) return res.status(404).json({ error: 'Record not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

app.put('/api/records/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const updated = await updateRecord(id, req.body);
    res.json(updated);
  } catch (err) {
    console.error(err);
    if (err.message === 'Record not found') {
      res.status(404).json({ error: 'Record not found' });
    } else {
      res.status(500).json({ error: 'Failed to update record' });
    }
  }
});

app.get('/api/master', async (_req, res) => {
  try {
    res.json(await getMaster());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch master data' });
  }
});

app.put('/api/master', async (req, res) => {
  try {
    const data = await saveMaster(req.body);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save master data' });
  }
});

app.delete('/api/clear', async (_req, res) => {
  try {
    const result = await clearAllData();
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clear database' });
  }
});

if (isProd && !isVercel) {
  const distPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

await initDb();

if (!isVercel) {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

export default app;
