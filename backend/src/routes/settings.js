// Public: read the current profile picture / resume. Admin: replace or restore them.
const express = require("express");
const fs = require("fs");
const prisma = require("../../prisma");
const { config } = require("../config");
const { HttpError } = require("../utils/httpError");
const { validateUpload } = require("../utils/validateUpload");
const { saveBuffer, removeFile, resolveUploadPath } = require("../utils/storage");
const { serializeSettings } = require("../utils/serialize");
const { timeText } = require("../utils/time");
const { requireAdmin, requireCustomHeader } = require("../middleware/auth");
const { profileImageFile, resumeFile } = require("../middleware/upload");

const publicRouter = express.Router();
const adminRouter = express.Router();

// Single-record table: row id 1 is created on first use.
const getSettings = () => prisma.portfolioSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });

// ---------- Public ----------
publicRouter.get("/", async (req, res) => {
  const settings = await getSettings();
  res.set("Cache-Control", "no-cache");
  res.json(serializeSettings(settings));
});

// Streams the CURRENT resume. View and Download both use this, so visitors never get a stale file.
publicRouter.get("/resume/file", async (req, res) => {
  const settings = await getSettings();
  const absolute = settings.resumeFilePath ? resolveUploadPath(settings.resumeFilePath) : null;
  if (!absolute || !fs.existsSync(absolute)) throw new HttpError(404, "No uploaded resume. The original resume is used instead.");

  const disposition = req.query.download ? "attachment" : "inline";
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `${disposition}; filename="${config.resumeDownloadName}"`,
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
  });
  fs.createReadStream(absolute).pipe(res);
});

// ---------- Admin ----------
adminRouter.use(requireAdmin, requireCustomHeader);

adminRouter.get("/", async (req, res) => {
  res.json(serializeSettings(await getSettings()));
});

// Replace the profile picture: validate -> store -> update SQLite -> delete the previous upload.
adminRouter.put("/profile-image", profileImageFile, async (req, res) => {
  const file = validateUpload(req.file, "IMAGE", "Profile picture");
  const previous = await getSettings();
  const saved = await saveBuffer("profile", file.buffer, file.type.ext);

  let updated;
  try {
    updated = await prisma.portfolioSettings.update({
      where: { id: 1 },
      data: {
        profileImagePath: saved.filePath,
        profileImageOriginalName: file.originalName,
        profileImageMimeType: file.type.mime,
        profileImageSizeBytes: file.sizeBytes,
      },
    });
  } catch (error) {
    await removeFile(saved.filePath); // database failed: do not leave an orphaned file
    throw error;
  }
  await removeFile(previous.profileImagePath); // old upload removed only after the new one is saved
  res.json(serializeSettings(updated));
});

// Restore the original picture (public/profile.jpg).
adminRouter.delete("/profile-image", async (req, res) => {
  const previous = await getSettings();
  const updated = await prisma.portfolioSettings.update({
    where: { id: 1 },
    data: { profileImagePath: null, profileImageOriginalName: null, profileImageMimeType: null, profileImageSizeBytes: null },
  });
  await removeFile(previous.profileImagePath);
  res.json(serializeSettings(updated));
});

adminRouter.put("/resume", resumeFile, async (req, res) => {
  const file = validateUpload(req.file, "PDF", "Resume");
  const previous = await getSettings();
  const saved = await saveBuffer("resume", file.buffer, ".pdf");

  let updated;
  try {
    updated = await prisma.portfolioSettings.update({
      where: { id: 1 },
      data: {
        resumeFilePath: saved.filePath,
        resumeOriginalName: file.originalName,
        resumeMimeType: "application/pdf",
        resumeSizeBytes: file.sizeBytes,
        resumeUploadedAt: timeText(),
      },
    });
  } catch (error) {
    await removeFile(saved.filePath);
    throw error;
  }
  await removeFile(previous.resumeFilePath);
  res.json(serializeSettings(updated));
});

// Restore the original resume (public/resume.pdf).
adminRouter.delete("/resume", async (req, res) => {
  const previous = await getSettings();
  const updated = await prisma.portfolioSettings.update({
    where: { id: 1 },
    data: { resumeFilePath: null, resumeOriginalName: null, resumeMimeType: null, resumeSizeBytes: null, resumeUploadedAt: null },
  });
  await removeFile(previous.resumeFilePath);
  res.json(serializeSettings(updated));
});

module.exports = { publicRouter, adminRouter };
