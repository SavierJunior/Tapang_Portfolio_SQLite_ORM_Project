// Public (no login) API calls.
import { request } from "./api";

export const getProjects = (signal) => request("/api/projects", { signal });
export const getSettings = (signal) => request("/api/settings", { signal });
export const sendMessage = (payload) => request("/api/messages", { method: "POST", json: payload });
