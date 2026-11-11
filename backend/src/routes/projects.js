const express = require("express");
const prisma = require("../../prisma");
const { HttpError } = require("../utils/httpError");
const { requireId } = require("../utils/validate");
const { serializeProject } = require("../utils/serialize");

const router = express.Router();
const mediaOrder = { media: { orderBy: [{ isCover: "desc" }, { id: "asc" }] } };

// PUBLIC: only PUBLISHED projects are ever returned here.
router.get("/", async (req, res) => {
  const projects = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: mediaOrder,
  });
  res.set("Cache-Control", "no-cache");
  res.json(projects.map(serializeProject));
});

router.get("/:id", async (req, res) => {
  const id = requireId(req.params.id, "project ID");
  const project = await prisma.project.findFirst({ where: { id, status: "PUBLISHED" }, include: mediaOrder });
  if (!project) throw new HttpError(404, "Project not found.");
  res.set("Cache-Control", "no-cache");
  res.json(serializeProject(project));
});

module.exports = router;
