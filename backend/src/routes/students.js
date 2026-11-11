// Student Information System API (unchanged behaviour from the earlier assignment).
const express = require("express");
const prisma = require("../../prisma");
const { HttpError } = require("../utils/httpError");
const { EMAIL_PATTERN, parseId } = require("../utils/validate");

const router = express.Router();
const MAX_LENGTH = 191;

function validateStudent(body) {
  const { name, email, course } = body || {};
  if (
    typeof name !== "string" || !name.trim() ||
    typeof email !== "string" || !email.trim() ||
    typeof course !== "string" || !course.trim()
  ) {
    throw new HttpError(400, "Name, email, and course are required.");
  }
  const data = { name: name.trim(), email: email.trim().toLowerCase(), course: course.trim() };
  if (!EMAIL_PATTERN.test(data.email)) throw new HttpError(400, "Please enter a valid email address.");
  if (data.name.length > MAX_LENGTH || data.email.length > MAX_LENGTH || data.course.length > MAX_LENGTH) {
    throw new HttpError(400, `Each field must be ${MAX_LENGTH} characters or fewer.`);
  }
  return data;
}

function studentId(value) {
  const id = parseId(value);
  if (id === null) throw new HttpError(400, "Invalid student ID.");
  return id;
}

// Maps Prisma errors to the same messages the Student page already expects.
function studentError(error) {
  if (error.code === "P2002") return new HttpError(409, "That email address already exists.");
  if (error.code === "P2025") return new HttpError(404, "Student not found.");
  return error;
}

router.get("/", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const students = await prisma.student.findMany({
    where: search
      ? { OR: [{ name: { contains: search } }, { email: { contains: search } }, { course: { contains: search } }] }
      : undefined,
    orderBy: { id: "desc" },
  });
  res.json(students);
});

router.post("/", async (req, res) => {
  const data = validateStudent(req.body);
  try {
    res.status(201).json(await prisma.student.create({ data }));
  } catch (error) {
    throw studentError(error);
  }
});

router.put("/:id", async (req, res) => {
  const id = studentId(req.params.id);
  const data = validateStudent(req.body);
  try {
    res.json(await prisma.student.update({ where: { id }, data }));
  } catch (error) {
    throw studentError(error);
  }
});

router.delete("/:id", async (req, res) => {
  const id = studentId(req.params.id);
  try {
    await prisma.student.delete({ where: { id } });
    res.json({ message: "Student deleted successfully." });
  } catch (error) {
    throw studentError(error);
  }
});

module.exports = router;
