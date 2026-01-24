const Database = require("better-sqlite3");
const path = require("path");

// Use SQLite for MVP demo
const dbPath = path.join(process.cwd(), "alumni.db");
let db;

function getDb() {
  if (!db) {
    db = new Database(dbPath);
  }
  return db;
}

export async function query(text, params = []) {
  const database = getDb();

  // Convert PostgreSQL $1, $2 syntax to SQLite ? placeholders
  let sqliteQuery = text.replace(/\$(\d+)/g, "?");

  try {
    if (sqliteQuery.trim().toUpperCase().startsWith("SELECT")) {
      const rows = database.prepare(sqliteQuery).all(...params);
      return { rows, rowCount: rows.length };
    } else {
      const info = database.prepare(sqliteQuery).run(...params);
      return { rows: [], rowCount: info.changes };
    }
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

export function getPool() {
  return getDb();
}
