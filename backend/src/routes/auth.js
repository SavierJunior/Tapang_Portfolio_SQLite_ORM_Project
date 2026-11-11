const express = require("express");
const bcrypt = require("bcryptjs");
const { rateLimit } = require("express-rate-limit");
const prisma = require("../../prisma");
const { config } = require("../config");
const { HttpError } = require("../utils/httpError");
const { cleanText } = require("../utils/validate");
const { setAuthCookie, clearAuthCookie, signToken, requireCustomHeader, requireAdmin, adminFromRequest } = require("../middleware/auth");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: config.rate.loginWindowMs,
  limit: config.rate.loginMax,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please wait a few minutes and try again." },
});

// A real bcrypt hash of a random string: compared against when the username does not exist,
// so a wrong username and a wrong password take about the same time.
const DUMMY_HASH = bcrypt.hashSync("not-the-password", 12);

router.post("/login", requireCustomHeader, loginLimiter, async (req, res) => {
  const identifier = cleanText(req.body?.identifier).toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!identifier || !password || identifier.length > 191 || password.length > 200) {
    throw new HttpError(400, "Enter your username or email and your password.");
  }

  const admin = await prisma.admin.findFirst({
    where: { OR: [{ username: identifier }, { email: identifier }] },
  });
  const matches = await bcrypt.compare(password, admin ? admin.passwordHash : DUMMY_HASH);
  if (!admin || !matches) throw new HttpError(401, "Incorrect username/email or password.");

  setAuthCookie(res, signToken(admin));
  res.json({ admin: { id: admin.id, name: admin.name, username: admin.username, email: admin.email } });
});

router.post("/logout", requireCustomHeader, (req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out." });
});

// Used by the dashboard when it opens: always 200, so the browser console stays clean when
// nobody is logged in. { admin: null } means "show the login form".
router.get("/session", async (req, res) => {
  const { admin } = await adminFromRequest(req, res);
  res.set("Cache-Control", "no-store");
  res.json({ admin: admin ? { id: admin.id, name: admin.name, username: admin.username, email: admin.email } : null });
});

router.get("/me", requireAdmin, (req, res) => {
  const { id, name, username, email } = req.admin;
  res.json({ admin: { id, name, username, email } });
});

module.exports = router;
