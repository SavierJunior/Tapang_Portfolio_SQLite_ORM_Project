// Seed script: creates the administrator, the settings row and the three original portfolio projects.
//
//   npm run db:seed                      normal run (safe to repeat)
//   npm run db:seed -- --restore-samples re-creates any of the 3 sample projects you deleted
//
// Safe to run many times (idempotent):
//   - the admin is matched by username/email: never duplicated, only updated when .env changed;
//   - the password is stored as a bcrypt hash, never as plain text;
//   - the settings row (id = 1) is created once;
//   - the sample projects are inserted only on the first successful seed. After that they are never
//     inserted or changed again, so your edits in the Admin Dashboard are kept, no duplicates are
//     created, and a sample you delete does not come back;
//   - --restore-samples adds back only the samples whose title no longer exists (nothing is overwritten).
require("dotenv").config({ quiet: true });
const bcrypt = require("bcryptjs");
const prisma = require("../prisma");
const { checkDatabase } = require("../src/utils/dbCheck");
const { timeText } = require("../src/utils/time");
const { createWithNextId } = require("../src/utils/nextId");
const projects = require("./seed-data/projects.json");

const restoreSamples = process.argv.includes("--restore-samples");

class SeedError extends Error {}
const fail = (message) => {
  throw new SeedError(message);
};

const isPlaceholder = (value) => /^YOUR_/i.test(String(value || "").trim());

function readEnv() {
  const problems = [];
  const raw = {
    ADMIN_NAME: process.env.ADMIN_NAME,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    JWT_SECRET: process.env.JWT_SECRET,
  };

  for (const [key, value] of Object.entries(raw)) {
    if (!value || !String(value).trim()) problems.push(`${key} is missing or empty in backend/.env.`);
    else if (isPlaceholder(value)) problems.push(`${key} still has the placeholder value "${value}". Put your real value in backend/.env.`);
  }
  if (problems.length) fail(problems.join("\n  - "));

  const env = {
    name: raw.ADMIN_NAME.trim(),
    username: raw.ADMIN_USERNAME.trim().toLowerCase(),
    email: raw.ADMIN_EMAIL.trim().toLowerCase(),
    password: raw.ADMIN_PASSWORD,
  };

  if (raw.JWT_SECRET.trim().length < 32) problems.push("JWT_SECRET must be at least 32 characters (see the command in .env.example).");
  if (!/^[a-z0-9._-]{3,60}$/.test(env.username)) problems.push("ADMIN_USERNAME must be 3-60 characters: letters, numbers, dot, dash or underscore.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.email) || env.email.length > 191) problems.push("ADMIN_EMAIL is not a valid email address.");
  if (env.name.length > 120) problems.push("ADMIN_NAME must be 120 characters or fewer.");
  if (env.password.length < 10) problems.push("ADMIN_PASSWORD must be at least 10 characters.");
  if (Buffer.byteLength(env.password, "utf8") > 72) problems.push("ADMIN_PASSWORD must be 72 characters or fewer (bcrypt limit).");
  if (env.password.toLowerCase() === env.username || ["password123", "password1234", "admin12345"].includes(env.password.toLowerCase())) {
    problems.push("ADMIN_PASSWORD is too easy to guess. Choose a longer, unique password.");
  }
  if (problems.length) fail(problems.join("\n  - "));
  return env;
}

async function seedAdmin(env) {
  const matches = await prisma.admin.findMany({ where: { OR: [{ username: env.username }, { email: env.email }] } });
  if (matches.length > 1) {
    fail(
      `ADMIN_USERNAME "${env.username}" and ADMIN_EMAIL "${env.email}" belong to two different admin accounts. ` +
        "Use the username and email of the same account, or remove the extra one in Prisma Studio."
    );
  }
  const existing = matches[0];

  if (!existing) {
    const passwordHash = await bcrypt.hash(env.password, 12);
    await prisma.admin.create({ data: { name: env.name, username: env.username, email: env.email, passwordHash } });
    console.log(`Admin created: ${env.username} (${env.email})`);
    return;
  }

  const samePassword = await bcrypt.compare(env.password, existing.passwordHash);
  const data = {};
  if (existing.name !== env.name) data.name = env.name;
  if (existing.username !== env.username) data.username = env.username;
  if (existing.email !== env.email) data.email = env.email;
  if (!samePassword) data.passwordHash = await bcrypt.hash(env.password, 12);

  if (Object.keys(data).length) {
    await prisma.admin.update({ where: { id: existing.id }, data });
    console.log(`Admin updated from .env: ${env.username}${data.passwordHash ? " (password changed)" : ""}`);
  } else {
    console.log(`Admin already up to date: ${env.username}`);
  }
}

async function seedSettings() {
  const settings = await prisma.portfolioSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  console.log("Portfolio settings ready (the original profile.jpg and resume.pdf are used until you upload new ones).");
  return settings;
}

const STATUSES = new Set(["DRAFT", "PUBLISHED"]);

function sampleProjectData(project) {
  const status = project.status ? String(project.status).toUpperCase() : "PUBLISHED";
  if (!project.title || !project.description || !project.category) {
    fail(`A project in prisma/seed-data/projects.json is missing title, description or category.`);
  }
  if (!STATUSES.has(status)) fail(`Project "${project.title}" has an invalid status "${project.status}" (use DRAFT or PUBLISHED).`);
  return {
    title: project.title,
    description: project.description,
    category: project.category,
    toolsUsed: project.toolsUsed || "",
    projectLink: project.projectLink || null,
    completionDate: project.completionDate || null, // "YYYY-MM-DD"
    sortOrder: Number.isInteger(project.sortOrder) ? project.sortOrder : 0,
    status,
  };
}

async function seedProjects(settings) {
  if (settings.sampleProjectsSeededAt && !restoreSamples) {
    console.log("Sample projects were already added earlier - skipped (your dashboard changes are kept).");
    return;
  }

  let created = 0;
  for (const project of projects) {
    const data = sampleProjectData(project);
    const found = await prisma.project.findFirst({ where: { title: data.title } });
    if (found) continue; // never overwrite a project you may have edited
    await createWithNextId(prisma, "Project", (id) => prisma.project.create({ data: { ...data, id } }));
    created += 1;
  }
  await prisma.portfolioSettings.update({ where: { id: 1 }, data: { sampleProjectsSeededAt: settings.sampleProjectsSeededAt || timeText() } });
  console.log(`Sample projects: ${created} created, ${projects.length - created} already existed.`);
}

async function main() {
  const env = readEnv(); // check .env first, before touching the database

  const database = await checkDatabase();
  if (!database.ok) fail(database.problem);
  console.log(`Using SQLite database: ${database.file}`);

  await seedAdmin(env);
  const settings = await seedSettings();
  await seedProjects(settings);

  const [admins, projectCount] = await Promise.all([prisma.admin.count(), prisma.project.count()]);
  console.log(`\nSeed finished. Admin accounts: ${admins}. Projects in the database: ${projectCount}.`);
}

main()
  .catch((error) => {
    if (error instanceof SeedError) {
      console.error(`\nSeed stopped:\n  - ${error.message}\n`);
    } else if (error.code === "P2021" || error.code === "P2022") {
      console.error('\nSeed stopped: the database tables are missing. Run "npm run prisma:migrate" first.\n');
    } else {
      console.error("\nSeed failed:", error.code || "", error.message);
    }
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
