// frontend/src/services/attendanceService.js
import axios from "./axios";

const SESSIONS = "/core/sessions/";
const ATTENDANCE = "/core/attendance/";

export async function listSessions({
  page = 1,
  pageSize = 10,
  search = "",
  courseId = "",
  semester = "",
  date = "", // optional exact date filter (YYYY-MM-DD)
  ordering = "-date,-start_time",
} = {}) {
  const params = { page, page_size: pageSize };
  if (search) params.search = search;
  if (courseId) params.course = courseId;
  if (semester) params.semester = semester;
  if (date) params.date = date;
  if (ordering) params.ordering = ordering;

  const res = await axios.get(SESSIONS, { params });
  return {
    results: res.data?.results ?? res.data ?? [],
    count:
      typeof res.data?.count === "number"
        ? res.data.count
        : (res.data?.length ?? 0),
  };
}

export async function getSession(id) {
  const res = await axios.get(`${SESSIONS}${id}/`);
  return res.data;
}

export async function createSession(payload) {
  // payload: { course, semester, date, start_time, end_time, room, notes }
  const res = await axios.post(SESSIONS, payload);
  return res.data;
}

export async function updateSession(id, payload) {
  const res = await axios.put(`${SESSIONS}${id}/`, payload);
  return res.data;
}

export async function deleteSession(id) {
  await axios.delete(`${SESSIONS}${id}/`);
}

export async function listAttendance({
  page = 1,
  pageSize = 200,
  session = "",
  enrollment = "",
  status = "",
  studentId = "",
  courseId = "",
  semester = "",
  ordering = "-marked_at,-id",
} = {}) {
  const params = { page, page_size: pageSize };
  if (session) params.session = session;
  if (enrollment) params.enrollment = enrollment;
  if (status) params.status = status;
  if (studentId) params["enrollment__student"] = studentId;
  if (courseId) params["enrollment__course"] = courseId;
  if (semester) params["enrollment__semester"] = semester;
  if (ordering) params.ordering = ordering;

  const res = await axios.get(ATTENDANCE, { params });
  return {
    results: res.data?.results ?? res.data ?? [],
    count:
      typeof res.data?.count === "number"
        ? res.data.count
        : (res.data?.length ?? 0),
  };
}

export async function createAttendance(payload) {
  // payload: { enrollment, session, status, marker? }
  const res = await axios.post(ATTENDANCE, payload);
  return res.data;
}

export async function updateAttendance(id, payload) {
  const res = await axios.put(`${ATTENDANCE}${id}/`, payload);
  return res.data;
}

export async function deleteAttendance(id) {
  await axios.delete(`${ATTENDANCE}${id}/`);
}
