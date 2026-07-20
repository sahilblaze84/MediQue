const path = require('path');
const fs = require('fs');

// No-op stub used when sqlite3 is unavailable (e.g. Vercel serverless)
const noopDb = {
  all: (sql, params, cb) => cb(null, []),
  get: (sql, params, cb) => cb(null, null),
  run: function(sql, params, cb) { if (typeof cb === 'function') cb.call({ lastID: null, changes: 0 }, null); },
  prepare: () => ({ run: () => {}, finalize: () => {} }),
  on: () => {},
  close: () => {}
};

let db = noopDb;

try {
  const mod = 'sqlite' + '3';
  const sqlite3 = require(mod).verbose();
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'medique.db');
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('[DB] Error opening database — using no-op stub:', err.message);
      db = noopDb;
    } else {
      console.log('[DB] Connected to SQLite database');
    }
  });

  db.on('error', (err) => {
    console.error('[DB] Database error:', err.message);
  });

} catch (err) {
  console.warn('[DB] sqlite3 not available (serverless?) — using no-op stub:', err.message);
  db = noopDb;
}

module.exports = db;
