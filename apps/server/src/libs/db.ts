import { Database } from 'bun:sqlite';
import { migrate } from './migrate';

export const db = new Database(
    Bun.env.NODE_ENV === 'production' ? '/usr/src/app/data/limpora.db' : 'limpora.db',
    { create: true, strict: true }
);
// ? WAL Mode (Better performance) --- REF: https://sqlite.org/wal.html
db.run('PRAGMA journal_mode = WAL');
db.run('PRAGMA foreign_keys = ON');

// ? Database
migrate(db); // Database migration
