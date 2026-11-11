const { HttpError } = require("./httpError");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

// Trim and drop control characters (keeps line breaks and tabs for long text).
function cleanText(value) {
  return typeof value === "string" ? value.replace(CONTROL_CHARS, "").trim() : "";
}

function requireText(value, label, { min = 1, max }) {
  const text = cleanText(value);
  if (text.length < min) {
    throw new HttpError(400, min <= 1 ? `${label} is required.` : `${label} must be at least ${min} characters.`);
  }
  if (text.length > max) throw new HttpError(400, `${label} must be ${max} characters or fewer.`);
  return text;
}

function optionalText(value, label, { max }) {
  const text = cleanText(value);
  if (!text) return null;
  if (text.length > max) throw new HttpError(400, `${label} must be ${max} characters or fewer.`);
  return text;
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id >= 1 ? id : null;
}

function requireId(value, label = "ID") {
  const id = parseId(value);
  if (id === null) throw new HttpError(400, `Invalid ${label}.`);
  return id;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

module.exports = { EMAIL_PATTERN, cleanText, requireText, optionalText, parseId, requireId, isHttpUrl };
