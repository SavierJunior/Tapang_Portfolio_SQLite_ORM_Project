// Dates are saved in SQLite as readable Philippine time text, for example "2026-11-10 22:30:15",
// so they are easy to read in Prisma Studio or any VS Code database viewer.
// The Philippines has no daylight saving time, so the offset is always +08:00.
const OFFSET = "+08:00";
const OFFSET_MS = 8 * 60 * 60 * 1000;

// The same expression is used as the column default in schema.prisma / the migration.
const SQLITE_NOW = "(strftime('%Y-%m-%d %H:%M:%S', 'now', '+8 hours'))";

// Date (default: now) -> "2026-11-10 22:30:15" (Philippine time)
function timeText(date = new Date()) {
  return new Date(date.getTime() + OFFSET_MS).toISOString().slice(0, 19).replace("T", " ");
}

// "2026-11-10 22:30:15" -> "2026-11-10T22:30:15+08:00" (an exact moment the browser understands)
function toIso(text) {
  if (!text) return null;
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(text) ? `${text.replace(" ", "T")}${OFFSET}` : text;
}

module.exports = { timeText, toIso, SQLITE_NOW };
