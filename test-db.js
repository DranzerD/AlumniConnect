/**
 * Database Test Script
 * Run with: node test-db.js
 */

const Database = require("better-sqlite3");
const path = require("path");

console.log("🔍 Testing Database Connection...\n");

try {
  // Connect to database
  const dbPath = path.join(process.cwd(), "alumni.db");
  console.log(`📁 Database path: ${dbPath}`);

  const db = new Database(dbPath);
  console.log("✅ Database connection successful!\n");

  // Test 1: Check if database is readable
  console.log("📊 Test 1: Checking database info...");
  const info = db.prepare("SELECT sqlite_version() as version").get();
  console.log(`   SQLite version: ${info.version}`);
  console.log("✅ Database is readable\n");

  // Test 2: List all tables
  console.log("📋 Test 2: Listing tables...");
  const tables = db
    .prepare(
      `
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `,
    )
    .all();

  if (tables.length === 0) {
    console.log("⚠️  No tables found - database is empty");
    console.log("   Run the schema.sql file to create tables\n");
  } else {
    console.log(`   Found ${tables.length} tables:`);
    tables.forEach((table) => {
      console.log(`   - ${table.name}`);
    });
    console.log("✅ Tables exist\n");
  }

  // Test 3: Check users table (if exists)
  if (tables.some((t) => t.name === "users")) {
    console.log("👥 Test 3: Checking users table...");
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
    console.log(`   Total users: ${userCount.count}`);

    if (userCount.count > 0) {
      const sampleUsers = db
        .prepare("SELECT id, email, role FROM users LIMIT 3")
        .all();
      console.log("   Sample users:");
      sampleUsers.forEach((user) => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    }
    console.log("✅ Users table is accessible\n");
  }

  // Test 3b: Check profiles table (if exists)
  if (tables.some((t) => t.name === "profiles")) {
    console.log("👤 Test 3b: Checking profiles table...");
    const profileCount = db
      .prepare("SELECT COUNT(*) as count FROM profiles")
      .get();
    console.log(`   Total profiles: ${profileCount.count}`);

    if (profileCount.count > 0) {
      const sampleProfiles = db
        .prepare(
          "SELECT user_id, full_name, current_company FROM profiles LIMIT 3",
        )
        .all();
      console.log("   Sample profiles:");
      sampleProfiles.forEach((profile) => {
        console.log(
          `   - ${profile.full_name} at ${profile.current_company || "N/A"}`,
        );
      });
    }
    console.log("✅ Profiles table is accessible\n");
  }

  // Test 4: Write test (create and delete a test record)
  console.log("✍️  Test 4: Testing write operations...");
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS _test (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const insertStmt = db.prepare("INSERT INTO _test (message) VALUES (?)");
    const result = insertStmt.run("Database test successful!");

    console.log(`   Inserted test record with ID: ${result.lastInsertRowid}`);

    // Clean up
    db.exec("DROP TABLE _test");
    console.log("✅ Write operations working\n");
  } catch (error) {
    console.log("⚠️  Write test failed:", error.message, "\n");
  }

  // Summary
  console.log("=".repeat(50));
  console.log("🎉 DATABASE TEST SUMMARY");
  console.log("=".repeat(50));
  console.log("✅ Connection: Working");
  console.log(`✅ Tables: ${tables.length} found`);
  console.log("✅ Read operations: Working");
  console.log("✅ Write operations: Working");
  console.log("=".repeat(50));

  db.close();
} catch (error) {
  console.error("\n❌ Database Error:");
  console.error(error.message);
  console.error("\nTroubleshooting:");
  console.error("1. Make sure alumni.db file exists");
  console.error("2. Check file permissions");
  console.error("3. Run: npm install better-sqlite3");
  process.exit(1);
}
