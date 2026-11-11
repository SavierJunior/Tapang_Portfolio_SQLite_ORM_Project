const multer = require("multer");
const { config } = require("../config");
const { HttpError } = require("../utils/httpError");

const ALLOWED_CLIENT_MIME = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4", "application/pdf"]);

function formatMb(bytes) {
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
}

// Files are kept in memory, checked (real content, size), and only then written to disk by the
// route handler. This means a rejected upload never touches the upload folder.
function createUpload(maxFileBytes, maxFiles) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxFileBytes, files: maxFiles, fields: 30, fieldSize: 20 * 1024 },
    fileFilter(req, file, cb) {
      // Quick first check only. The real check is done on the file's bytes afterwards.
      if (!ALLOWED_CLIENT_MIME.has(file.mimetype)) {
        return cb(new HttpError(400, "Unsupported file type. Allowed: JPG, PNG, WEBP, MP4 (and PDF for the resume)."));
      }
      return cb(null, true);
    },
  });
}

// Turns multer errors into friendly HttpErrors.
function wrap(middleware, maxFileBytes) {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(new HttpError(413, `A file is too large. The limit is ${formatMb(maxFileBytes)}.`));
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") return next(new HttpError(400, "Too many files, or an unexpected file field."));
        if (err.code === "LIMIT_FILE_COUNT") return next(new HttpError(400, "Too many files in one upload."));
        return next(new HttpError(400, "The upload could not be processed."));
      }
      return next(err);
    });
  };
}

const { imageBytes, videoBytes, resumeBytes, maxProjectImages } = config.limits;

const projectFiles = wrap(
  createUpload(Math.max(videoBytes, imageBytes), maxProjectImages + 2).fields([
    { name: "cover", maxCount: 1 },
    { name: "images", maxCount: maxProjectImages },
    { name: "video", maxCount: 1 },
  ]),
  Math.max(videoBytes, imageBytes)
);
const profileImageFile = wrap(createUpload(imageBytes, 1).single("image"), imageBytes);
const resumeFile = wrap(createUpload(resumeBytes, 1).single("resume"), resumeBytes);

module.exports = { projectFiles, profileImageFile, resumeFile, formatMb };
