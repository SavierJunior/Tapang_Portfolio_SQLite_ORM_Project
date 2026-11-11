const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const { config, assertServerConfig } = require("./src/config");
const prisma = require("./prisma");
const { ensureUploadDirs } = require("./src/utils/storage");
const { checkDatabase, setJournalMode } = require("./src/utils/dbCheck");
const { notFound, errorHandler } = require("./src/middleware/errors");
const { requireAdmin, requireCustomHeader } = require("./src/middleware/auth");

const authRoutes = require("./src/routes/auth");
const projectRoutes = require("./src/routes/projects");
const adminProjectRoutes = require("./src/routes/adminProjects");
const settingsRoutes = require("./src/routes/settings");
const messageRoutes = require("./src/routes/messages");

const app = express();
app.disable("x-powered-by");

// ---------- Middleware ----------
app.use((req, res, next) => {
  res.set({ "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" });
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      // Allow tools without an Origin header (Postman, curl) and the configured frontend.
      if (!origin || config.frontendOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // lets the browser send the HttpOnly login cookie
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-Requested-With"],
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));

// Public media (project images/videos and profile pictures). The resume is NOT served from here:
// it is streamed by /api/settings/resume/file so the latest upload is always used.
const staticOptions = {
  dotfiles: "deny",
  index: false,
  fallthrough: false,
  maxAge: "7d", // file names are unique, so long caching is safe
  setHeaders: (res) => res.set("Cross-Origin-Resource-Policy", "cross-origin"),
};
app.use("/uploads/projects", express.static(path.join(config.uploadDir, "projects"), staticOptions));
app.use("/uploads/profile", express.static(path.join(config.uploadDir, "profile"), staticOptions));

// ---------- Routes ----------
app.get("/", (req, res) => res.send("Tapang Portfolio API is running!"));
// Health check: also confirms that Prisma can query the SQLite database.
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    res.json({ status: "ok", database: "sqlite", databaseConnected: true });
  } catch (error) {
    res.status(503).json({ status: "error", database: "sqlite", databaseConnected: false, error: error.code || error.name });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/settings", settingsRoutes.publicRouter);
app.use("/api/messages", messageRoutes.publicRouter);

// Everything below /api/admin requires a logged-in administrator.
app.use("/api/admin/projects", requireAdmin, requireCustomHeader, adminProjectRoutes);
app.use("/api/admin/settings", settingsRoutes.adminRouter);
app.use("/api/admin/messages", messageRoutes.adminRouter);

// ---------- Fallbacks ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Start + clean shutdown ----------
async function start() {
  assertServerConfig();
  await ensureUploadDirs();

  // Make sure the SQLite file and its tables exist BEFORE accepting requests.
  let database;
  try {
    database = await checkDatabase();
  } catch (error) {
    database = { ok: false, problem: `Prisma could not open the database (${error.code || error.name}): ${error.message}` };
  }
  if (!database.ok) {
    console.error(`\nDatabase not ready: ${database.problem}\n`);
    await prisma.$disconnect();
    process.exit(1);
  }
  await setJournalMode();

  const adminCount = await prisma.admin.count();
  if (adminCount === 0) {
    console.warn('No administrator account yet. Run "npm run db:seed" to create it from backend/.env.');
  }

  const server = app.listen(config.port, () => {
    console.log(`SQLite database: ${database.file}`);
    console.log(`Server running at http://localhost:${config.port}`);
    console.log(`Health check:     http://localhost:${config.port}/api/health`);
  });

  server.on("error", async (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `\nPort ${config.port} is already in use. Close the other terminal that runs the backend, ` +
          "or change PORT in backend/.env (and VITE_API_BASE_URL in frontend/.env).\n"
      );
    } else {
      console.error("Server error:", error);
    }
    await prisma.$disconnect();
    process.exit(1);
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

if (require.main === module) start();

module.exports = app;
