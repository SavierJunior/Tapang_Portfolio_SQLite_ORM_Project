const express = require("express");
const { rateLimit } = require("express-rate-limit");
const prisma = require("../../prisma");
const { config } = require("../config");
const { HttpError } = require("../utils/httpError");
const { EMAIL_PATTERN, cleanText, requireText, optionalText, requireId } = require("../utils/validate");
const { serializeMessage } = require("../utils/serialize");
const { timeText } = require("../utils/time");
const { createWithNextId, resetSequenceSql } = require("../utils/nextId");
const { requireAdmin, requireCustomHeader } = require("../middleware/auth");

const publicRouter = express.Router();
const adminRouter = express.Router();
const STATUSES = ["PENDING", "READ", "REPLIED", "ARCHIVED"];

// ---------- Public: visitors can send a message (no account, no login) ----------
const sendLimiter = rateLimit({
  windowMs: config.rate.messageWindowMs,
  limit: config.rate.messageMax,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "You have sent several messages recently. Please wait a little before sending another." },
});

publicRouter.post("/", sendLimiter, async (req, res) => {
  const body = req.body || {};

  // Hidden "website" field: humans never fill it, simple bots do. Nothing is stored.
  if (typeof body.website === "string" && body.website.trim()) return res.status(201).json({ message: "Message received." });

  const senderName = requireText(body.senderName, "Full name", { max: 120 });
  const email = requireText(body.email, "Email address", { max: 191 }).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw new HttpError(400, "Please enter a valid email address.");
  const username = optionalText(body.username, "Username", { max: 60 });
  const subject = requireText(body.subject, "Subject", { min: 3, max: 200 });
  const content = requireText(body.content, "Message", { min: 5, max: 5000 });

  // The same person pressing Send twice: the first copy IS stored, so confirm that one.
  const since = timeText(new Date(Date.now() - 2 * 60 * 1000));
  const duplicate = await prisma.message.findFirst({ where: { email, subject, content, createdAt: { gte: since } } });
  if (duplicate) return res.status(200).json({ message: "Message received.", id: duplicate.id });

  const saved = await createWithNextId(prisma, "Message", (id) =>
    prisma.message.create({ data: { id, senderName, username, email, subject, content } })
  );
  res.status(201).json({ message: "Message received.", id: saved.id });
});

// ---------- Admin: private inbox ----------
adminRouter.use(requireAdmin, requireCustomHeader);

adminRouter.get("/", async (req, res) => {
  const search = cleanText(req.query.search).slice(0, 100);
  const status = typeof req.query.status === "string" ? req.query.status.toUpperCase() : "ALL";
  if (status !== "ALL" && !STATUSES.includes(status)) throw new HttpError(400, "Unknown status filter.");

  const where = {
    ...(status !== "ALL" ? { status } : {}),
    ...(search
      ? {
          OR: [
            { senderName: { contains: search } },
            { username: { contains: search } },
            { email: { contains: search } },
            { subject: { contains: search } },
            { content: { contains: search } },
          ],
        }
      : {}),
  };

  const [messages, grouped] = await Promise.all([
    prisma.message.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 500 }),
    prisma.message.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const counts = { ALL: 0, PENDING: 0, READ: 0, REPLIED: 0, ARCHIVED: 0 };
  for (const row of grouped) {
    counts[row.status] = row._count._all;
    counts.ALL += row._count._all;
  }
  res.json({ messages: messages.map(serializeMessage), counts });
});

adminRouter.get("/:id", async (req, res) => {
  const id = requireId(req.params.id, "message ID");
  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) throw new HttpError(404, "Message not found.");
  res.json(serializeMessage(message));
});

adminRouter.patch("/:id/status", async (req, res) => {
  const id = requireId(req.params.id, "message ID");
  const status = typeof req.body?.status === "string" ? req.body.status.toUpperCase() : "";
  if (!STATUSES.includes(status)) throw new HttpError(400, "Status must be PENDING, READ, REPLIED or ARCHIVED.");
  const message = await prisma.message.update({ where: { id }, data: { status } });
  res.json(serializeMessage(message));
});

// Saves the reply INSIDE the database only. No email is sent by this application.
adminRouter.patch("/:id/reply", async (req, res) => {
  const id = requireId(req.params.id, "message ID");
  const adminReply = requireText(req.body?.adminReply, "Reply", { max: 5000 });
  const message = await prisma.message.update({
    where: { id },
    data: { adminReply, repliedAt: timeText(), status: "REPLIED" },
  });
  res.json(serializeMessage(message));
});

adminRouter.delete("/:id", async (req, res) => {
  const id = requireId(req.params.id, "message ID");
  await prisma.$transaction([prisma.message.delete({ where: { id } }), prisma.$executeRawUnsafe(resetSequenceSql("Message"))]);
  res.json({ message: "Message deleted." });
});

module.exports = { publicRouter, adminRouter };
