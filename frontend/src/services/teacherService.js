// frontend/src/services/teacherService.js
import api from "./axios";

/**
 * Admin-only CRUD for teachers.
 * The backend serializer exposes `user` (read) and expects `user_id` (write).
 */

export async function listTeachers({ search, ordering, page } = {}) {
  const params = {};
  if (search) params.search = search;
  if (ordering) params.ordering = ordering;
  if (page) params.page = page;
  const res = await api.get("/teachers/", { params });
  return res.data;
}

export async function getTeacher(id) {
  const res = await api.get(`/teachers/${id}/`);
  return res.data;
}

export async function createTeacher(payload) {
  // payload example: { user_id: 123, department: "CS" }
  const res = await api.post("/teachers/", payload);
  return res.data;
}

export async function updateTeacher(id, payload) {
  const res = await api.put(`/teachers/${id}/`, payload);
  return res.data;
}

export async function deleteTeacher(id) {
  const res = await api.delete(`/teachers/${id}/`);
  return res.data;
}

