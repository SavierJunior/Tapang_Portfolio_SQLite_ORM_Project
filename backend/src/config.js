// Central, validated configuration. Everything comes from backend/.env (never from the frontend).
require("dotenv").config({ quiet: true });
const path = require("path");

const MB = 1024 * 1024;

function positiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const isProduction = process.env.NODE_ENV === "production";

const config = {
  isProduction,
  port: positiveInt(process.env.PORT, 3000),
  frontendOrigins: (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),

  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  cookieName: "tapang_admin_token",
  cookieMaxAgeMs: positiveInt(process.env.COOKIE_MAX_AGE_HOURS, 8) * 60 * 60 * 1000,

  // Uploaded files live here (outside the database).
  uploadDir: path.resolve(__dirname, "..", process.env.UPLOAD_DIR || "uploads"),

  // Configurable limits (change them in backend/.env).
  limits: {
    imageBytes: positiveInt(process.env.MAX_IMAGE_MB, 5) * MB,
    videoBytes: positiveInt(process.env.MAX_VIDEO_MB, 50) * MB,
    resumeBytes: positiveInt(process.env.MAX_RESUME_MB, 10) * MB,
    maxProjectImages: positiveInt(process.env.MAX_PROJECT_IMAGES, 10), // cover + additional images
  },

  rate: {
    messageMax: positiveInt(process.env.MESSAGE_RATE_LIMIT_MAX, 5),
    messageWindowMs: positiveInt(process.env.MESSAGE_RATE_LIMIT_WINDOW_MIN, 15) * 60 * 1000,
    loginMax: positiveInt(process.env.LOGIN_RATE_LIMIT_MAX, 10),
    loginWindowMs: positiveInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MIN, 15) * 60 * 1000,
  },

  resumeDownloadName: process.env.RESUME_DOWNLOAD_NAME || "Andrei_Tapang_Resume.pdf",
};

// Prisma resolves a relative SQLite path ("file:../portfolio.db") from the folder that holds
// schema.prisma (backend/prisma). This returns the absolute path of the database file, or null
// when DATABASE_URL is not a SQLite "file:" URL.
const PRISMA_DIR = path.resolve(__dirname, "..", "prisma");
function sqliteFilePath(url = process.env.DATABASE_URL) {
  if (typeof url !== "string" || !url.startsWith("file:")) return null;
  const filePart = url.slice("file:".length).split("?")[0];
  if (!filePart) return null;
  return path.resolve(PRISMA_DIR, filePart);
}

// Called once when the server starts. Stops the server early with a clear message.
function assertServerConfig() {
  const problems = [];
  if (!process.env.DATABASE_URL) {
    problems.push('DATABASE_URL is missing. Copy .env.example to .env (it contains DATABASE_URL="file:../portfolio.db").');
  } else if (!sqliteFilePath()) {
    problems.push('DATABASE_URL must be a SQLite file URL, for example DATABASE_URL="file:../portfolio.db".');
  }
  if (!config.jwtSecret || config.jwtSecret.startsWith("YOUR_") || config.jwtSecret.length < 32) {
    problems.push("JWT_SECRET must be set to a random string of at least 32 characters.");
  }
  if (problems.length) {
    console.error("\nConfiguration problem(s):\n - " + problems.join("\n - ") + "\n");
    process.exit(1);
  }
}

module.exports = { config, assertServerConfig, sqliteFilePath, MB };
