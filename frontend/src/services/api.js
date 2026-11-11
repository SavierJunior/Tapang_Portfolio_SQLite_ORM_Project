// Shared fetch helper for the portfolio API. The browser only ever talks to the Express backend -
// it never sees the database or any secret. Login uses an HttpOnly cookie, so no token is stored here.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Turns "/uploads/projects/abc.webp" into "http://localhost:3000/uploads/projects/abc.webp".
export function assetUrl(path) {
  if (!path) return null;
  return /^https?:\/\//i.test(path) ? path : `${API_BASE_URL}${path}`;
}

// options: { method, json, formData, signal }
export async function request(path, { method = "GET", json, formData, signal } = {}) {
  const headers = {};
  let body;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (formData) {
    body = formData; // the browser sets the multipart boundary itself
  }
  if (method !== "GET") headers["X-Requested-With"] = "tapang-portfolio"; // CSRF guard header

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { method, headers, body, signal, credentials: "include" });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError(`Cannot reach the backend at ${API_BASE_URL}. Start it with "npm run dev" in the backend folder.`);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON response; handled below.
  }

  if (!response.ok) {
    if (response.status === 401 && path.startsWith("/api/admin")) {
      window.dispatchEvent(new Event("admin-unauthorized")); // lets the dashboard return to the login screen
    }
    throw new ApiError(data?.error || `Request failed (status ${response.status}).`, response.status);
  }
  if (data === null) throw new ApiError("The server sent an invalid response.", response.status);
  return data;
}
