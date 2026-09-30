// Deletes the local SQLite database and recreates it with fresh demo data.
// Usage: npm run db:reset
const fs = require("fs");
const { openDatabase, resolveDbPath } = require("../database/init");

const dbPath = resolveDbPath();
for (const suffix of ["", "-wal", "-shm"]) {
  fs.rmSync(dbPath + suffix, { force: true });
}

const db = openDatabase(dbPath);
const { users } = db.prepare("SELECT COUNT(*) AS users FROM users").get();
db.close();
console.log(`[db] Reset complete: ${dbPath} (${users} users)`);
