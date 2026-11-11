// Administrator API calls (all require the login cookie).
import { request } from "./api";

export const login = (identifier, password) => request("/api/auth/login", { method: "POST", json: { identifier, password } });
export const logout = () => request("/api/auth/logout", { method: "POST" });
export const getMe = () => request("/api/auth/me");
export const getSession = () => request("/api/auth/session"); // { admin } or { admin: null }

export const listProjects = () => request("/api/admin/projects");
export const createProject = (formData) => request("/api/admin/projects", { method: "POST", formData });
export const updateProject = (id, formData) => request(`/api/admin/projects/${id}`, { method: "PUT", formData });
export const setProjectStatus = (id, status) => request(`/api/admin/projects/${id}/status`, { method: "PATCH", json: { status } });
export const deleteProject = (id) => request(`/api/admin/projects/${id}`, { method: "DELETE" });

export const getAdminSettings = () => request("/api/admin/settings");
export const uploadProfileImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return request("/api/admin/settings/profile-image", { method: "PUT", formData });
};
export const restoreProfileImage = () => request("/api/admin/settings/profile-image", { method: "DELETE" });
export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  return request("/api/admin/settings/resume", { method: "PUT", formData });
};
export const restoreResume = () => request("/api/admin/settings/resume", { method: "DELETE" });

export const listMessages = ({ search = "", status = "ALL" } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status !== "ALL") params.set("status", status);
  const query = params.toString();
  return request(`/api/admin/messages${query ? `?${query}` : ""}`);
};
export const setMessageStatus = (id, status) => request(`/api/admin/messages/${id}/status`, { method: "PATCH", json: { status } });
export const saveMessageReply = (id, adminReply) => request(`/api/admin/messages/${id}/reply`, { method: "PATCH", json: { adminReply } });
export const deleteMessage = (id) => request(`/api/admin/messages/${id}`, { method: "DELETE" });
