// src/services/dashboardService.js
import api from "./axios";

export async function getStudentDashboard() {
  const res = await api.get("/dashboard/student/");
  return res.data;
}

export async function getAdminDashboard() {
  const res = await api.get("/dashboard/admin/");
  return res.data;
}
