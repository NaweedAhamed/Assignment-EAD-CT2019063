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
// src/services/gradeService.js
import api from "./axios";

/**
 * Normalize API responses that may be paginated ({results, count})
 * or plain arrays.
 */
function normalize(res) {
  const data = Array.isArray(res.data) ? res.data : res.data?.results ?? res.data ?? [];
  const count =
    typeof res.data?.count === "number"
      ? res.data.count
      : Array.isArray(res.data)
      ? res.data.length
      : (Array.isArray(data) ? data.length : 0);
  return { data, count, raw: res.data };
}

/**
 * Instructor/Admin: full gradebook for a course.
 * GET /courses/:courseId/gradebook/
 */
export async function getCourseGradebook(courseId) {
  const res = await api.get(`/courses/${courseId}/gradebook/`);
  // gradebook is an object (not a list), so return raw payload
  return res.data;
}

/**
 * Student: results across all my courses.
 * GET /my-results/
 */
export async function getMyResults() {
  const res = await api.get(`/my-results/`);
  // returns { items: [...] }
  return res.data;
}

/**
 * Student: results for a single course.
 * GET /courses/:courseId/my-results/
 */
export async function getMyCourseResults(courseId) {
  const res = await api.get(`/courses/${courseId}/my-results/`);
  return res.data;
}

/**
 * Grades CRUD (optional but handy for inline edits in gradebook)
 * POST /grades/  | PUT /grades/:id/
 */
export async function createGrade(payload) {
  // payload: { enrollment, assessment, score, grader? }
  const res = await api.post(`/grades/`, payload);
  return res.data;
}

export async function updateGrade(id, payload) {
  const res = await api.put(`/grades/${id}/`, payload);
  return res.data;
}

/**
 * Fetch assessments for a course (useful for building gradebook columns)
 * GET /assessments/?course=<id>
 */
export async function listAssessmentsByCourse(courseId, params = {}) {
  const res = await api.get(`/assessments/`, { params: { course: courseId, ...params } });
  return normalize(res);
}

/**
 * List grades with filters (useful for debugging/data loads)
 * GET /grades/?enrollment=<id>&assessment=<id>
 */
export async function listGrades(params = {}) {
  const res = await api.get(`/grades/`, { params });
  return normalize(res);
}
