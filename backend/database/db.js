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
  
  // On Vercel, the file system is read-only except for /tmp
  const dbPath = process.env.VERCEL ? '/tmp/medique.db' : (process.env.DATABASE_PATH || path.join(__dirname, 'medique.db'));
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('[DB] Error opening database — using no-op stub:', err.message);
      db = noopDb;
    } else {
      console.log(`[DB] Connected to SQLite database at ${dbPath}`);
    }
  });

  if (process.env.VERCEL) {
    const { initializeDatabase } = require('./init');
    initializeDatabase(db).catch(e => console.error('[DB] Error initializing DB:', e));
  }

  db.on('error', (err) => {
    console.error('[DB] Database error:', err.message);
  });

} catch (err) {
  console.warn('[DB] sqlite3 not available (serverless?) — using no-op stub:', err.message);
  db = noopDb;
}

// Export a proxy object so that if `db` is reassigned to `noopDb` asynchronously,
// consumers calling db.run/get/all will use the updated reference.
module.exports = {
  all: (...args) => db.all(...args),
  get: (...args) => db.get(...args),
  run: (...args) => db.run(...args),
  prepare: (...args) => db.prepare(...args),
  on: (...args) => db.on(...args),
  close: (...args) => db.close(...args)
};
