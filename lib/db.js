import { openDatabase } from "@/database/init";

// One connection per server process. Cached on globalThis so Next.js hot reloads
// in development don't open a new handle on every change.
export function getDb() {
  if (!globalThis.__alumniConnectDb) {
    globalThis.__alumniConnectDb = openDatabase();
  }
  return globalThis.__alumniConnectDb;
}

export const all = (sql, ...params) => getDb().prepare(sql).all(...params);
export const get = (sql, ...params) => getDb().prepare(sql).get(...params);
export const run = (sql, ...params) => getDb().prepare(sql).run(...params);

// Runs fn inside a single SQLite transaction and returns its result.
export const transaction = (fn) => getDb().transaction(fn)();
