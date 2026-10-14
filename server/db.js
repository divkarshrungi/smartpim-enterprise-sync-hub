// server/db.js — opens the SQLite file, creates tables, seeds sample data.
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'smartpim.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ---------- 1. TABLES ----------
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    sku         TEXT NOT NULL UNIQUE,
    master_id   TEXT,
    name        TEXT NOT NULL,
    brand       TEXT,
    category    TEXT NOT NULL,
    description TEXT,
    price       REAL NOT NULL CHECK (price >= 0),
    stock       INTEGER NOT NULL CHECK (stock >= 0),
    attributes  TEXT NOT NULL DEFAULT '[]',   -- JSON text
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS channels (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    code         TEXT NOT NULL UNIQUE,
    channel_name TEXT NOT NULL UNIQUE,
    status       TEXT NOT NULL DEFAULT 'healthy'
  );

  CREATE TABLE IF NOT EXISTS channel_products (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id     INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    channel_id     INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    product_name   TEXT,
    category       TEXT,
    price          REAL,
    stock          INTEGER,
    attributes     TEXT NOT NULL DEFAULT '[]',
    last_synced_at TEXT,
    UNIQUE (product_id, channel_id)
  );

  CREATE TABLE IF NOT EXISTS sync_logs (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id    INTEGER REFERENCES products(id) ON DELETE SET NULL,
    channel_id    INTEGER REFERENCES channels(id) ON DELETE SET NULL,
    sync_status   TEXT NOT NULL,              -- 'SUCCESS' or 'FAILED'
    error_message TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// ---------- 2. SEED DATA (runs only on a brand-new database) ----------
const SEED_PRODUCTS = [
  { sku: 'SKU-1049', master_id: 'PIM-90214', name: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones', brand: 'Sony', category: 'Electronics', price: 399.99, stock: 84,
    description: 'Industry-leading noise cancellation with two processors and 8 microphones.',
    attributes: [{ label: 'Color', value: 'Silver' }, { label: 'Fit', value: 'Over-Ear' }] },
  { sku: 'SKU-2082', master_id: 'PIM-90215', name: 'MacBook Pro 14" M3 Pro 18GB/512GB', brand: 'Apple', category: 'Computers', price: 1999.0, stock: 22,
    description: '14-inch laptop with M3 Pro chip.',
    attributes: [{ label: 'Color', value: 'Space Black' }] },
  { sku: 'SKU-4412', master_id: 'PIM-90217', name: 'Logitech MX Master 3S Wireless Mouse', brand: 'Logitech', category: 'Accessories', price: 99.99, stock: 160,
    description: 'Ergonomic wireless mouse with quiet clicks.',
    attributes: [{ label: 'Color', value: 'Graphite' }] },
  { sku: 'SKU-5190', master_id: 'PIM-90218', name: 'Dell UltraSharp 27" 4K USB-C Hub Monitor', brand: 'Dell', category: 'Displays', price: 619.0, stock: 15,
    description: '27-inch 4K monitor with USB-C hub.',
    attributes: [{ label: 'Resolution', value: '3840x2160' }] },
  { sku: 'SKU-7721', master_id: 'PIM-90220', name: 'Keychron Q1 Pro Mechanical Keyboard', brand: 'Keychron', category: 'Accessories', price: 199.0, stock: 45,
    description: 'Wireless 75% mechanical keyboard.',
    attributes: [{ label: 'Switch', value: 'Brown' }] },
];

// Channel copies. Anything not listed here starts identical to the central product.
// These two are deliberately out-of-date so discrepancy detection has something to find later.
const CHANNEL_OVERRIDES = {
  'Marketplace:SKU-1049': { price: 349.99 }, // price drift
  'Marketplace:SKU-5190': { stock: 0 },      // stock drift
};

export function seedIfEmpty() {
  // Channels are never deleted, so an empty channels table means a brand-new database.
  // (Checking products would wrongly re-seed after you delete every product.)
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM channels').get();
  if (n > 0) return false;

  const insertProduct = db.prepare(`
    INSERT INTO products (sku, master_id, name, brand, category, description, price, stock, attributes)
    VALUES (@sku, @master_id, @name, @brand, @category, @description, @price, @stock, @attributes)`);
  const insertChannel = db.prepare(
    'INSERT INTO channels (code, channel_name, status) VALUES (?, ?, ?)');
  const insertChannelProduct = db.prepare(`
    INSERT INTO channel_products (product_id, channel_id, product_name, category, price, stock, attributes, last_synced_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`);

  // One transaction = all-or-nothing, so we never end up with half-seeded data.
  db.transaction(() => {
    insertChannel.run('CH-01', 'Online Store', 'healthy');
    insertChannel.run('CH-02', 'Marketplace', 'healthy');
    const channels = db.prepare('SELECT id, channel_name FROM channels').all();

    for (const p of SEED_PRODUCTS) {
      const attrs = JSON.stringify(p.attributes);
      const { lastInsertRowid } = insertProduct.run({ ...p, attributes: attrs });
      for (const ch of channels) {
        const o = CHANNEL_OVERRIDES[`${ch.channel_name}:${p.sku}`] || {};
        insertChannelProduct.run(lastInsertRowid, ch.id, p.name, p.category,
          o.price ?? p.price, o.stock ?? p.stock, attrs);
      }
    }
  })();
  return true;
}

export default db;
