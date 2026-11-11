const { HttpError } = require("../utils/httpError");

// Prisma error codes that mean "the database cannot be used right now".
const DATABASE_UNAVAILABLE_CODES = ["P1001", "P1003", "P1017", "P2024"];
// Table / column missing: the migrations were not applied.
const MISSING_SCHEMA_CODES = ["P2021", "P2022"];

function notFound(req, res) {
  res.status(404).json({ error: "Route not found." });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });

  if (err.message === "Not allowed by CORS") return res.status(403).json({ error: "This origin is not allowed." });
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON body." });
  if (err.type === "entity.too.large") return res.status(413).json({ error: "The request body is too large." });

  // Errors raised by Express/static middleware carry their own 4xx status (e.g. 403/404/416).
  if (err.expose && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: err.status === 404 ? "File not found." : "Request refused." });
  }

  if (err.code === "P2002") return res.status(409).json({ error: "That value already exists." });
  if (err.code === "P2025") return res.status(404).json({ error: "Record not found." });
  // SQLite allows one writer at a time; this is rare and safe to retry.
  if (err.code === "P1008" || /database is locked/i.test(err.message || "")) {
    return res.status(503).json({ error: "The database is busy. Please try again in a moment." });
  }
  if (MISSING_SCHEMA_CODES.includes(err.code)) {
    console.error(`Database table/column missing (${err.code}). Run "npm run prisma:migrate" in the backend folder.`);
    return res.status(503).json({ error: 'The database tables are missing. Run "npm run prisma:migrate" in the backend folder.' });
  }
  if (DATABASE_UNAVAILABLE_CODES.includes(err.code) || err.name === "PrismaClientInitializationError") {
    console.error("Database unavailable:", err.code || err.name, err.message);
    return res.status(503).json({
      error: "The SQLite database could not be opened. Check DATABASE_URL in backend/.env and run \"npm run prisma:migrate\".",
    });
  }

  console.error(err);
  return res.status(500).json({ error: "Something went wrong." });
}

module.exports = { notFound, errorHandler };
