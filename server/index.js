// server/index.js — Express app entry point.
import express from 'express';
import db, { seedIfEmpty, DB_PATH } from './db.js';
import productRoutes from './products.js';

const PORT = process.env.PORT || 5000;
const seeded = seedIfEmpty();

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
  const count = (t) => db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n;
  res.json({
    status: 'ok',
    database: 'connected',
    counts: {
      products: count('products'),
      channels: count('channels'),
      channelProducts: count('channel_products'),
      syncLogs: count('sync_logs'),
    },
    time: new Date().toISOString(),
  });
});

app.use('/api/products', productRoutes);

// Unknown /api routes -> JSON 404 instead of an HTML page.
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// Last-resort error handler.
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Request body is not valid JSON' });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`SmartPIM API running at http://localhost:${PORT}`);
  console.log(`Database file: ${DB_PATH}${seeded ? ' (created and seeded)' : ' (existing data kept)'}`);
});
