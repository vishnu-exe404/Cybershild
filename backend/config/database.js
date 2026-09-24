/**
 * Database layer.
 *
 * This module is the ONLY place that knows how data is actually stored.
 * Everything else in the app (backend/models/analysisModel.js) talks to
 * the small interface exported here: init(), getAll(), insert(), stats().
 *
 * The default driver is a local JSON file, so the starter works with zero
 * external setup. To move to a hosted database (Postgres, MongoDB, etc.):
 *   1. Add a new driver file (e.g. config/drivers/postgres.js) implementing
 *      the same four functions.
 *   2. Set DB_DRIVER in .env and select it below.
 * No other file in the project needs to change.
 */

const fs = require('fs');
const path = require('path');

const DB_DRIVER = process.env.DB_DRIVER || 'json-file';
const DB_FILE_PATH = path.resolve(
  __dirname,
  '..',
  process.env.DB_FILE_PATH || './data/store.json'
);

const EMPTY_STORE = { analyses: [], users: [] };

function readStoreSync() {
  try {
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return { ...EMPTY_STORE };
  }
}

function writeStoreSync(store) {
  fs.mkdirSync(path.dirname(DB_FILE_PATH), { recursive: true });
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

const jsonFileDriver = {
  async init() {
    if (!fs.existsSync(DB_FILE_PATH)) {
      writeStoreSync(EMPTY_STORE);
    }
  },

  /** Insert one analysis record. Record must already be sanitized/shaped. */
  async insert(record) {
    const store = readStoreSync();
    store.analyses.push(record);
    writeStoreSync(store);
    return record;
  },

  /** Return all records (used internally for computing analytics). */
  async getAll() {
    const store = readStoreSync();
    return store.analyses;
  },

  /** Find one user by username (used by login). Returns undefined if not found. */
  async getUserByUsername(username) {
    const store = readStoreSync();
    store.users = store.users || [];
    return store.users.find((u) => u.username === username);
  },

  /** Insert a user record (used only by the startup admin-seed step). */
  async insertUser(user) {
    const store = readStoreSync();
    store.users = store.users || [];
    store.users.push(user);
    writeStoreSync(store);
    return user;
  },
};

const drivers = {
  'json-file': jsonFileDriver,
  // 'postgres': require('./drivers/postgres'),
  // 'mongodb': require('./drivers/mongodb'),
};

const driver = drivers[DB_DRIVER];

if (!driver) {
  throw new Error(
    `Unknown DB_DRIVER "${DB_DRIVER}". Available drivers: ${Object.keys(drivers).join(', ')}`
  );
}

module.exports = driver;
