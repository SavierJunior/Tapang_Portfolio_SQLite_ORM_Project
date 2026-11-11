// Checks one uploaded file (multer memory file) by its real content and size.
const { config } = require("../config");
const { HttpError } = require("./httpError");
const { detectFileType } = require("./fileTypes");

function mb(bytes) {
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
}

// kind: "IMAGE" | "VIDEO" | "PDF". Returns { type, buffer, originalName, sizeBytes }.
function validateUpload(file, kind, label) {
  if (!file || !file.buffer || file.size === 0) throw new HttpError(400, `${label} is empty.`);
  const type = detectFileType(file.buffer);
  const names = { IMAGE: "a JPG, PNG or WEBP image", VIDEO: "an MP4 video", PDF: "a PDF document" };

  if (!type || type.kind !== kind) {
    throw new HttpError(400, `${label} must be ${names[kind]}. The file content does not match that type.`);
  }
  const limit = { IMAGE: config.limits.imageBytes, VIDEO: config.limits.videoBytes, PDF: config.limits.resumeBytes }[kind];
  if (file.size > limit) throw new HttpError(413, `${label} is too large. The limit is ${mb(limit)}.`);

  // Keep only a harmless display name (no path parts, no control characters, limited length).
  const originalName =
    String(file.originalname || "file")
      .replace(/^.*[\\/]/, "")
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .slice(0, 200) || "file";

  return { type, buffer: file.buffer, originalName, sizeBytes: file.size };
}

module.exports = { validateUpload };
