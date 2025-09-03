// frontend/src/services/studentService.js
import api from "./axios";

export async function getStudents(params = {}) {
  const res = await api.get("/students/", { params });
  return res.data;
}

export async function getStudent(id) {
  const res = await api.get(`/students/${id}/`);
  return res.data;
}

export async function createStudent(payload) {
  const res = await api.post("/students/", payload);
  return res.data;
}

export async function updateStudent(id, payload) {
  const res = await api.put(`/students/${id}/`, payload);
  return res.data;
}

export async function deleteStudent(id) {
  const res = await api.delete(`/students/${id}/`);
  return res.data;
}

export async function getMyStudentProfile() {
  const res = await api.get("/students/me/");
  return res.data;
}

export async function updateMyStudentProfile(payload) {
  const res = await api.put("/students/me/", payload);
  return res.data;
}
