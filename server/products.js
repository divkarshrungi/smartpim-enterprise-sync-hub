// server/products.js — product CRUD routes (mounted at /api/products).
import { Router } from 'express';
import db from './db.js';

const router = Router();

// ---------- helpers ----------

// DB row -> JSON shape for the frontend (camelCase, parsed attributes).
export const toProduct = (r) => ({
  id: r.id,
  sku: r.sku,
  masterId: r.master_id,
  name: r.name,
  brand: r.brand,
  category: r.category,
  description: r.description,
  price: r.price,
  stock: r.stock,
  attributes: JSON.parse(r.attributes || '[]'),
  updatedAt: r.updated_at,
});

const getById = (id) => db.prepare('SELECT * FROM products WHERE id = ?').get(id);

// Route param must be a positive whole number, e.g. /api/products/3
const parseId = (raw) => (/^\d+$/.test(raw) && Number(raw) > 0 ? Number(raw) : null);

const isBlank = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

// "  home   AUDIO " -> "Home Audio"  (standardises category names)
const normalizeCategory = (s) =>
  s.trim().replace(/\s+/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// Next business ID: PIM-90221, PIM-90222, ...
const nextMasterId = () => {
  const { n } = db
    .prepare("SELECT MAX(CAST(SUBSTR(master_id, 5) AS INTEGER)) AS n FROM products WHERE master_id LIKE 'PIM-%'")
    .get();
  return `PIM-${(n || 90000) + 1}`;
};

const skuTaken = (sku, exceptId = 0) =>
  !!db.prepare('SELECT 1 FROM products WHERE sku = ? COLLATE NOCASE AND id != ?').get(sku, exceptId);

// Validate + clean a product. `input` is the final merged data (for PUT: old row + changes).
// Returns { errors, data }.
function validateProduct(input, exceptId = 0) {
  const errors = {};
  const data = {};

  if (isBlank(input.name) || typeof input.name !== 'string') errors.name = 'Name is required';
  else if (input.name.trim().length > 200) errors.name = 'Name must be 200 characters or fewer';
  else data.name = input.name.trim();

  if (isBlank(input.sku) || typeof input.sku !== 'string') errors.sku = 'SKU is required';
  else if (input.sku.trim().length > 50) errors.sku = 'SKU must be 50 characters or fewer';
  else data.sku = input.sku.trim();

  if (isBlank(input.category) || typeof input.category !== 'string') errors.category = 'Category is required';
  else data.category = normalizeCategory(input.category);

  // price: a number (or numeric string) that is >= 0
  const price = typeof input.price === 'string' && input.price.trim() !== '' ? Number(input.price) : input.price;
  if (typeof price !== 'number' || !Number.isFinite(price)) errors.price = 'Price is required and must be a number';
  else if (price < 0) errors.price = 'Price cannot be negative';
  else data.price = Math.round(price * 100) / 100;

  // stock: a whole number >= 0
  const stock = typeof input.stock === 'string' && input.stock.trim() !== '' ? Number(input.stock) : input.stock;
  if (typeof stock !== 'number' || !Number.isFinite(stock)) errors.stock = 'Stock is required and must be a number';
  else if (!Number.isInteger(stock)) errors.stock = 'Stock must be a whole number';
  else if (stock < 0) errors.stock = 'Stock cannot be negative';
  else data.stock = stock;

  // optional text fields
  for (const f of ['brand', 'description']) {
    if (input[f] === undefined || input[f] === null) data[f] = '';
    else if (typeof input[f] !== 'string') errors[f] = `${f} must be text`;
    else data[f] = input[f].trim();
  }

  // optional attributes: [{ label, value }, ...]
  if (input.attributes === undefined || input.attributes === null) data.attributes = [];
  else if (!Array.isArray(input.attributes)) errors.attributes = 'Attributes must be a list';
  else {
    const clean = [];
    for (const a of input.attributes) {
      if (!a || typeof a.label !== 'string' || typeof a.value !== 'string' || !a.label.trim()) {
        errors.attributes = 'Each attribute needs a text label and a text value';
        break;
      }
      clean.push({ label: a.label.trim(), value: a.value.trim() });
    }
    if (!errors.attributes) data.attributes = clean;
  }

  // duplicate SKU (only worth checking if the SKU itself was valid)
  let duplicateSku = false;
  if (data.sku && skuTaken(data.sku, exceptId)) duplicateSku = true;

  return { errors, data, duplicateSku };
}

const sendValidation = (res, errors) =>
  res.status(400).json({ error: 'Validation failed', details: errors });

const sendDuplicate = (res, sku) =>
  res.status(409).json({ error: `SKU "${sku}" already exists`, details: { sku: 'SKU must be unique' } });

const bodyOf = (req) => (req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : null);

// ---------- routes ----------

// GET /api/products
router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY id').all();
  res.json(rows.map(toProduct));
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Product id must be a positive whole number' });
  const row = getById(id);
  if (!row) return res.status(404).json({ error: 'Product not found' });
  res.json(toProduct(row));
});

// POST /api/products
router.post('/', (req, res) => {
  const body = bodyOf(req);
  if (!body) return res.status(400).json({ error: 'Request body must be a JSON object' });

  const { errors, data, duplicateSku } = validateProduct(body);
  if (Object.keys(errors).length) return sendValidation(res, errors);
  if (duplicateSku) return sendDuplicate(res, data.sku);

  try {
    const info = db
      .prepare(
        `INSERT INTO products (sku, master_id, name, brand, category, description, price, stock, attributes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(data.sku, nextMasterId(), data.name, data.brand, data.category, data.description,
           data.price, data.stock, JSON.stringify(data.attributes));
    res.status(201).location(`/api/products/${info.lastInsertRowid}`)
      .json(toProduct(getById(info.lastInsertRowid)));
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return sendDuplicate(res, data.sku); // safety net
    throw err;
  }
});

// PUT /api/products/:id  (send any fields to change; the rest keep their current values)
router.put('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Product id must be a positive whole number' });
  const existing = getById(id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  const body = bodyOf(req);
  if (!body) return res.status(400).json({ error: 'Request body must be a JSON object' });

  if (Object.keys(body).length === 0) return res.status(400).json({ error: 'No fields to update' });

  const current = toProduct(existing);
  const merged = { ...current, ...body };
  const { errors, data, duplicateSku } = validateProduct(merged, id);
  if (Object.keys(errors).length) return sendValidation(res, errors);
  if (duplicateSku) return sendDuplicate(res, data.sku);

  try {
    db.prepare(
      `UPDATE products
          SET sku = ?, name = ?, brand = ?, category = ?, description = ?,
              price = ?, stock = ?, attributes = ?, updated_at = datetime('now')
        WHERE id = ?`
    ).run(data.sku, data.name, data.brand, data.category, data.description,
          data.price, data.stock, JSON.stringify(data.attributes), id);
    res.json(toProduct(getById(id)));
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return sendDuplicate(res, data.sku); // safety net
    throw err;
  }
});

// DELETE /api/products/:id  (channel copies are removed automatically; logs are kept)
router.delete('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Product id must be a positive whole number' });
  const existing = getById(id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  res.json({ message: 'Product deleted', id, sku: existing.sku });
});

export default router;
