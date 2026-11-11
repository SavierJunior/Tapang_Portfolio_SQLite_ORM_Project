// Protected project management: create / edit / delete / publish, with media uploads.
const express = require("express");
const prisma = require("../../prisma");
const { config } = require("../config");
const { HttpError } = require("../utils/httpError");
const { requireText, optionalText, requireId, isHttpUrl } = require("../utils/validate");
const { validateUpload } = require("../utils/validateUpload");
const { saveBuffer, removeFiles } = require("../utils/storage");
const { serializeProject } = require("../utils/serialize");
const { projectFiles } = require("../middleware/upload");
const { createWithNextId, resetSequenceSql } = require("../utils/nextId");

const router = express.Router();
const include = { media: { orderBy: [{ isCover: "desc" }, { id: "asc" }] } };
const STATUSES = ["DRAFT", "PUBLISHED"];

// "2026-11-09" -> true, "2026-02-30" or "11/09/2026" -> false
function isRealDate(text) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return year >= 1900 && year <= 2100 && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function parseProjectBody(body = {}) {
  const status = typeof body.status === "string" ? body.status.toUpperCase() : "DRAFT";
  if (!STATUSES.includes(status)) throw new HttpError(400, "Status must be DRAFT or PUBLISHED.");

  const toolsUsed = requireText(body.toolsUsed ?? "", "Tools used", { min: 0, max: 500 }) || "";
  const projectLink = optionalText(body.projectLink, "Project link", { max: 500 });
  if (projectLink && !isHttpUrl(projectLink)) throw new HttpError(400, "Project link must start with http:// or https://.");

  // Saved exactly as chosen in the date picker ("2026-11-09"): no time and no time zone,
  // so the date can never shift by one day and it reads clearly in the database.
  const completionDate = optionalText(body.completionDate, "Completion date", { max: 10 });
  if (completionDate && !isRealDate(completionDate)) {
    throw new HttpError(400, "Completion date must be a real date in the format YYYY-MM-DD.");
  }

  let sortOrder;
  if (body.sortOrder !== undefined && String(body.sortOrder).trim() !== "") {
    sortOrder = Number(body.sortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 100000) {
      throw new HttpError(400, "Sort order must be a whole number from 0 to 100000.");
    }
  }

  return {
    title: requireText(body.title, "Project title", { max: 150 }),
    description: requireText(body.description, "Project description", { max: 5000 }),
    category: requireText(body.category, "Category", { max: 100 }),
    toolsUsed,
    projectLink,
    completionDate,
    status,
    sortOrder,
  };
}

// Validates every uploaded file BEFORE anything is written to disk.
function validateFiles(files = {}) {
  const cover = files.cover?.[0] ? validateUpload(files.cover[0], "IMAGE", "Cover image") : null;
  const images = (files.images || []).map((file, i) => validateUpload(file, "IMAGE", `Additional image ${i + 1}`));
  const video = files.video?.[0] ? validateUpload(files.video[0], "VIDEO", "Video preview") : null;
  return { cover, images, video };
}

// Writes validated files to disk. Returns the rows to create and the paths (for cleanup).
async function storeFiles({ cover, images, video }) {
  const written = [];
  const rows = [];
  try {
    const items = [
      ...(cover ? [{ file: cover, mediaType: "IMAGE", isCover: true }] : []),
      ...images.map((file) => ({ file, mediaType: "IMAGE", isCover: false })),
      ...(video ? [{ file: video, mediaType: "VIDEO", isCover: false }] : []),
    ];
    for (const item of items) {
      const saved = await saveBuffer("projects", item.file.buffer, item.file.type.ext);
      written.push(saved.filePath);
      rows.push({
        originalName: item.file.originalName,
        storedName: saved.storedName,
        mimeType: item.file.type.mime,
        sizeBytes: item.file.sizeBytes,
        filePath: saved.filePath,
        mediaType: item.mediaType,
        isCover: item.isCover,
      });
    }
    return { rows, written };
  } catch (error) {
    await removeFiles(written);
    throw error;
  }
}

// Makes sure exactly one image is the cover (if the project has any image).
async function normalizeCover(tx, projectId, preferredId) {
  const media = await tx.projectMedia.findMany({ where: { projectId }, orderBy: { id: "asc" } });
  const images = media.filter((item) => item.mediaType === "IMAGE");
  if (!images.length) return;
  const chosen =
    images.find((item) => item.id === preferredId) || images.find((item) => item.isCover) || images[0];
  await tx.projectMedia.updateMany({ where: { projectId }, data: { isCover: false } });
  await tx.projectMedia.update({ where: { id: chosen.id }, data: { isCover: true } });
}

function parseIdList(value) {
  if (value === undefined || value === "") return [];
  let list = value;
  if (typeof value === "string") {
    try {
      list = JSON.parse(value);
    } catch {
      list = value.split(",");
    }
  }
  if (!Array.isArray(list)) throw new HttpError(400, "Invalid media list.");
  return list.map((item) => requireId(item, "media ID"));
}

router.get("/", async (req, res) => {
  const projects = await prisma.project.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], include });
  res.json(projects.map(serializeProject));
});

router.get("/:id", async (req, res) => {
  const id = requireId(req.params.id, "project ID");
  const project = await prisma.project.findUnique({ where: { id }, include });
  if (!project) throw new HttpError(404, "Project not found.");
  res.json(serializeProject(project));
});

router.post("/", projectFiles, async (req, res) => {
  const data = parseProjectBody(req.body);
  const files = validateFiles(req.files);
  if (files.images.length + (files.cover ? 1 : 0) > config.limits.maxProjectImages) {
    throw new HttpError(400, `A project can have at most ${config.limits.maxProjectImages} images (cover included).`);
  }
  const { rows, written } = await storeFiles(files);

  try {
    const project = await prisma.$transaction(async (tx) => {
      let sortOrder = data.sortOrder;
      if (sortOrder === undefined) {
        const last = await tx.project.aggregate({ _max: { sortOrder: true } });
        sortOrder = (last._max.sortOrder ?? 0) + 1;
      }
      const created = await createWithNextId(tx, "Project", (id) =>
        tx.project.create({ data: { ...data, id, sortOrder, media: { create: rows } } })
      );
      await normalizeCover(tx, created.id);
      return tx.project.findUnique({ where: { id: created.id }, include });
    });
    res.status(201).json(serializeProject(project));
  } catch (error) {
    await removeFiles(written); // no orphaned files if the database write failed
    throw error;
  }
});

router.put("/:id", projectFiles, async (req, res) => {
  const id = requireId(req.params.id, "project ID");
  const existing = await prisma.project.findUnique({ where: { id }, include });
  if (!existing) throw new HttpError(404, "Project not found.");

  const data = parseProjectBody(req.body);
  const removeIds = parseIdList(req.body.removeMediaIds);
  const requestedCover = req.body.coverMediaId ? requireId(req.body.coverMediaId, "cover media ID") : undefined;
  const files = validateFiles(req.files);

  const owned = new Set(existing.media.map((item) => item.id));
  if (removeIds.some((mediaId) => !owned.has(mediaId))) throw new HttpError(400, "A media item does not belong to this project.");
  if (requestedCover !== undefined && !owned.has(requestedCover)) throw new HttpError(400, "The chosen cover image does not belong to this project.");

  // Image count after this edit (cover + additional) must stay within the configured limit.
  const keptImages = existing.media.filter((item) => item.mediaType === "IMAGE" && !removeIds.includes(item.id)).length;
  const newImages = files.images.length + (files.cover ? 1 : 0);
  if (keptImages + newImages > config.limits.maxProjectImages) {
    throw new HttpError(400, `A project can have at most ${config.limits.maxProjectImages} images.`);
  }

  // A new video replaces the old one.
  const oldVideoIds = files.video ? existing.media.filter((item) => item.mediaType === "VIDEO").map((item) => item.id) : [];
  const idsToDelete = [...new Set([...removeIds, ...oldVideoIds])];
  const pathsToDelete = existing.media.filter((item) => idsToDelete.includes(item.id)).map((item) => item.filePath);

  const { rows, written } = await storeFiles(files);

  try {
    const project = await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id },
        data, // an undefined sortOrder is ignored by Prisma, so the current order is kept
      });

      let preferredCoverId = requestedCover;
      for (const row of rows) {
        const created = await tx.projectMedia.create({ data: { ...row, isCover: false, projectId: id } });
        if (row.isCover) preferredCoverId = created.id; // a newly uploaded cover wins
      }
      if (idsToDelete.length) await tx.projectMedia.deleteMany({ where: { projectId: id, id: { in: idsToDelete } } });
      await normalizeCover(tx, id, preferredCoverId);
      return tx.project.findUnique({ where: { id }, include });
    });

    await removeFiles(pathsToDelete); // old files are removed only after the database commit
    res.json(serializeProject(project));
  } catch (error) {
    await removeFiles(written);
    throw error;
  }
});

router.patch("/:id/status", async (req, res) => {
  const id = requireId(req.params.id, "project ID");
  const status = typeof req.body?.status === "string" ? req.body.status.toUpperCase() : "";
  if (!STATUSES.includes(status)) throw new HttpError(400, "Status must be DRAFT or PUBLISHED.");
  const project = await prisma.project.update({ where: { id }, data: { status }, include });
  res.json(serializeProject(project));
});

router.delete("/:id", async (req, res) => {
  const id = requireId(req.params.id, "project ID");
  const existing = await prisma.project.findUnique({ where: { id }, include });
  if (!existing) throw new HttpError(404, "Project not found.");
  await prisma.$transaction([
    prisma.project.delete({ where: { id } }), // ProjectMedia rows are removed by ON DELETE CASCADE
    // New projects reuse the smallest free ID (see utils/nextId.js); this keeps SQLite's counter in line.
    prisma.$executeRawUnsafe(resetSequenceSql("Project")),
  ]);
  await removeFiles(existing.media.map((item) => item.filePath));
  res.json({ message: "Project deleted." });
});

module.exports = router;
