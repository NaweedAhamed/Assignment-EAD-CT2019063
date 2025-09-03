// frontend/src/services/gradeService.js
import axios from "./axios"; // your shared axios instance

const ASSESSMENTS = "/core/assessments/";
const GRADES = "/core/grades/";

export async function listAssessments({
  page = 1,
  pageSize = 10,
  search = "",
  courseId = "",
  semester = "",
  type = "",
  ordering = "",
} = {}) {
  const params = { page, page_size: pageSize };
  if (search) params.search = search;
  if (courseId) params.course = courseId;
  if (semester) params.semester = semester;
  if (type) params.type = type;
  if (ordering) params.ordering = ordering;
  const res = await axios.get(ASSESSMENTS, { params });
  return {
    results: res.data?.results ?? res.data ?? [],
    count:
      typeof res.data?.count === "number"
        ? res.data.count
        : (res.data?.length ?? 0),
  };
}

export async function getAssessment(id) {
  const res = await axios.get(`${ASSESSMENTS}${id}/`);
  return res.data;
}

export async function createAssessment(payload) {
  // payload: { course, semester, title, type, weight, max_marks, due_date? }
  const res = await axios.post(ASSESSMENTS, payload);
  return res.data;
}

export async function updateAssessment(id, payload) {
  const res = await axios.put(`${ASSESSMENTS}${id}/`, payload);
  return res.data;
}

export async function deleteAssessment(id) {
  await axios.delete(`${ASSESSMENTS}${id}/`);
}

/* ------------------------------ Grades (CRUD) ------------------------------ */
export async function listGrades({
  page = 1,
  pageSize = 50,
  assessment = "",
  enrollment = "",
  courseId = "",
  semester = "",
  studentId = "",
  ordering = "-graded_at",
} = {}) {
  const params = { page, page_size: pageSize };
  if (assessment) params.assessment = assessment;
  if (enrollment) params.enrollment = enrollment;
  if (courseId) params["enrollment__course"] = courseId;
  if (semester) params["enrollment__semester"] = semester;
  if (studentId) params["enrollment__student"] = studentId;
  if (ordering) params.ordering = ordering;

  const res = await axios.get(GRADES, { params });
  return {
    results: res.data?.results ?? res.data ?? [],
    count:
      typeof res.data?.count === "number"
        ? res.data.count
        : (res.data?.length ?? 0),
  };
}

export async function createGrade(payload) {
  // payload: { enrollment, assessment, score, grader? }
  const res = await axios.post(GRADES, payload);
  return res.data;
}

export async function updateGrade(id, payload) {
  const res = await axios.put(`${GRADES}${id}/`, payload);
  return res.data;
}

export async function deleteGrade(id) {
  await axios.delete(`${GRADES}${id}/`);
}
