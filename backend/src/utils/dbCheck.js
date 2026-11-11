// Checks that the SQLite database file exists and that the migrations created every table.
// Used by server.js and prisma/seed.js so a missing setup step shows a clear message instead of
// Prisma errors such as P2021 ("The table `Admin` does not exist").
const fs = require("fs");
const path = require("path");
const prisma = require("../../prisma");
const { sqliteFilePath } = require("../config");

const REQUIRED_TABLES = ["Admin", "Project", "ProjectMedia", "PortfolioSettings", "Message", "_prisma_migrations"];

const MIGRATIONS_DIR = path.resolve(__dirname, "..", "..", "prisma", "migrations");

const MIGRATE_HINT = 'Run "npm run prisma:migrate" in the backend folder to create the database and its tables.';

// Returns { ok: true, file } or { ok: false, file, problem }.
async function checkDatabase() {
  const file = sqliteFilePath();
  if (!file) {
    return { ok: false, file, problem: 'DATABASE_URL must look like "file:../portfolio.db" (see backend/.env.example).' };
  }
  // Prisma would silently create an EMPTY file here, so check first.
  if (!fs.existsSync(file)) {
    return { ok: false, file, problem: `The database file was not found at ${file}. ${MIGRATE_HINT}` };
  }

  const rows = await prisma.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type = 'table'");
  const present = new Set(rows.map((row) => row.name));
  const missing = REQUIRED_TABLES.filter((table) => !present.has(table));
  if (missing.length) {
    return { ok: false, file, problem: `The database is missing these tables: ${missing.join(", ")}. ${MIGRATE_HINT}` };
  }

  // Every migration folder in prisma/migrations must have been applied to this database file.
  const applied = await prisma.$queryRawUnsafe(
    "SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL"
  );
  const appliedNames = new Set(applied.map((row) => row.migration_name));
  const pending = fs
    .readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !appliedNames.has(entry.name))
    .map((entry) => entry.name);
  if (pending.length) {
    return { ok: false, file, problem: `The database is missing these updates: ${pending.join(", ")}. ${MIGRATE_HINT}` };
  }
  return { ok: true, file };
}

// Use SQLite's classic "rollback journal" mode (DELETE) so every change is written straight into
// portfolio.db. Viewers such as VS Code database extensions read only that file, so they always
// show the latest messages and projects (in WAL mode new data waits in portfolio.db-wal).
// Switching from WAL also moves any data still in portfolio.db-wal into portfolio.db.
async function setJournalMode() {
  try {
    await prisma.$queryRawUnsafe("PRAGMA journal_mode = DELETE;");
  } catch (error) {
    console.warn("Could not set the SQLite journal mode (the API still works):", error.message);
  }
}

module.exports = { checkDatabase, setJournalMode, REQUIRED_TABLES, MIGRATE_HINT };
