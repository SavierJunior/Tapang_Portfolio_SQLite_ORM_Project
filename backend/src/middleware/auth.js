const jwt = require("jsonwebtoken");
const prisma = require("../../prisma");
const { config } = require("../config");
const { HttpError } = require("../utils/httpError");

// The token lives in an HttpOnly cookie, so JavaScript in the browser can never read it.
function setAuthCookie(res, token) {
  res.cookie(config.cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.isProduction,
    maxAge: config.cookieMaxAgeMs,
    path: "/",
  });
}

function clearAuthCookie(res) {
  res.clearCookie(config.cookieName, { httpOnly: true, sameSite: "lax", secure: config.isProduction, path: "/" });
}

function signToken(admin) {
  return jwt.sign({ sub: String(admin.id) }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

// Extra CSRF defence: state-changing admin requests must carry a custom header. Browsers only
// allow a cross-origin page to add it after a CORS preflight, which this API refuses.
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
function requireCustomHeader(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  if (req.get("X-Requested-With") !== "tapang-portfolio") {
    return next(new HttpError(403, "Missing security header."));
  }
  return next();
}

// Reads the login cookie. Returns { admin } when valid, otherwise { admin: null, reason }.
// An invalid/expired cookie is cleared.
async function adminFromRequest(req, res) {
  const token = req.cookies?.[config.cookieName];
  if (!token) return { admin: null, reason: "Please log in as the administrator." };

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    clearAuthCookie(res);
    return { admin: null, reason: "Your session has expired. Please log in again." };
  }

  const admin = await prisma.admin.findUnique({ where: { id: Number(payload.sub) } });
  if (!admin) {
    clearAuthCookie(res);
    return { admin: null, reason: "Please log in as the administrator." };
  }
  return { admin };
}

async function requireAdmin(req, res, next) {
  try {
    const { admin, reason } = await adminFromRequest(req, res);
    if (!admin) throw new HttpError(401, reason);
    req.admin = admin;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { setAuthCookie, clearAuthCookie, signToken, requireCustomHeader, requireAdmin, adminFromRequest };
