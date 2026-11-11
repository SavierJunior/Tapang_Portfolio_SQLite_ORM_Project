// Frontend API calls only. All database work (Prisma + SQLite) happens in the Express backend.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const STUDENTS_URL = `${API_BASE_URL}/api/students`;

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
  } catch {
    throw new ApiError(
      `Cannot reach the backend at ${API_BASE_URL}. Start it with "npm run dev" in the backend folder.`
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON response; handled below.
  }

  if (!response.ok) {
    throw new ApiError(data?.error || `Request failed (status ${response.status}).`, response.status);
  }
  if (data === null) {
    throw new ApiError("The server sent an invalid response.", response.status);
  }
  return data;
}

export async function getStudents() {
  const data = await request(STUDENTS_URL);
  if (!Array.isArray(data)) throw new ApiError("The server sent an unexpected student list.");
  return data;
}

export function createStudent(student) {
  return request(STUDENTS_URL, { method: "POST", body: JSON.stringify(student) });
}

export function updateStudent(id, student) {
  return request(`${STUDENTS_URL}/${id}`, { method: "PUT", body: JSON.stringify(student) });
}

export function deleteStudent(id) {
  return request(`${STUDENTS_URL}/${id}`, { method: "DELETE" });
}
