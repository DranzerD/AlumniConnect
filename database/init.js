// Opens the SQLite database, applies the schema and seeds demo data on first run.
// CommonJS so it can be shared by the Next.js server (lib/db.js) and plain Node
// scripts (scripts/db-reset.js).
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const { seed } = require("./seed");

const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "alumniconnect.db");

function resolveDbPath() {
  return process.env.DATABASE_PATH
    ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
    : DEFAULT_DB_PATH;
}

function openDatabase(dbPath = resolveDbPath()) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");

  // Databases created before platform administration was added lack
  // colleges.is_active and can't be migrated in place (SQLite can't alter a
  // CHECK constraint). They only ever hold demo data, so ask for a reset.
  const hasColleges = db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'colleges'").get();
  if (hasColleges && !db.prepare("PRAGMA table_info(colleges)").all().some((c) => c.name === "is_active")) {
    db.close();
    throw new Error("Database schema is out of date. Run `npm run db:reset` to recreate it.");
  }

  const schema = fs.readFileSync(
    path.join(process.cwd(), "database", "schema.sql"),
    "utf8",
  );
  db.exec(schema);

  const { count } = db.prepare("SELECT COUNT(*) AS count FROM colleges").get();
  if (count === 0 && process.env.SEED_DEMO_DATA !== "false") {
    seed(db);
  }

  return db;
}

module.exports = { openDatabase, resolveDbPath };
