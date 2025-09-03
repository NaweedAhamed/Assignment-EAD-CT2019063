// frontend/src/services/enrollmentService.js
import api from "./axios";

const ENROLLMENTS = "/enrollments/";
const STUDENTS = "/students/";
const COURSES = "/courses/";

/**
 * List enrollments with optional filters and pagination
 */
export async function listEnrollments({
  page = 1,
  pageSize = 10,
  search = "",
  studentId = "",
  courseId = "",
  status = "",
  ordering = "",
} = {}) {
  const params = { page, page_size: pageSize };
  if (search) params.search = search;
  if (studentId) params.student = studentId;
  if (courseId) params.course = courseId;
  if (status) params.status = status; // "enrolled" | "dropped"
  if (ordering) params.ordering = ordering;

  const res = await api.get(ENROLLMENTS, { params });
  const data = res.data;
  return {
    results: data?.results ?? data ?? [],
    count:
      typeof data?.count === "number"
        ? data.count
        : Array.isArray(data)
        ? data.length
        : 0,
  };
}

/**
 * Retrieve a single enrollment
 */
export async function getEnrollment(id) {
  const res = await api.get(`${ENROLLMENTS}${id}/`);
  return res.data;
}

/**
 * Create enrollment
 * - Students: pass { course: <id> } (student inferred server-side)
 * - Admin/Teacher: may pass { student: <id>, course: <id> }
 */
export async function createEnrollment(payload) {
  const res = await api.post(ENROLLMENTS, payload);
  return res.data;
}

/**
 * Update enrollment (admin/teacher only, typically for status)
 */
export async function updateEnrollment(id, payload) {
  const res = await api.put(`${ENROLLMENTS}${id}/`, payload);
  return res.data;
}

/**
 * Delete enrollment (drop)
 */
export async function deleteEnrollment(id) {
  await api.delete(`${ENROLLMENTS}${id}/`);
}

/**
 * Students list (for dropdowns)
 */
export async function listStudents(query = "") {
  const res = await api.get(STUDENTS, { params: { search: query, page_size: 200 } });
  return res.data?.results ?? res.data ?? [];
}

/**
 * Courses list (for dropdowns)
 */
export async function listCourses(query = "") {
  const res = await api.get(COURSES, { params: { search: query, page_size: 200 } });
  return res.data?.results ?? res.data ?? [];
}

/**
 * Enrollments for a single student
 */
export async function listStudentEnrollments(
  studentId,
  { page = 1, pageSize = 10, status = "" } = {}
) {
  if (!studentId) return { results: [], count: 0 };
  return listEnrollments({ page, pageSize, studentId, status });
}

/**
 * Current user's enrollments (My Courses)
 */
export async function listMyEnrollments({ page = 1, pageSize = 100, status = "" } = {}) {
  const params = { page, page_size: pageSize };
  if (status) params.status = status;
  const res = await api.get("/enrollments/me/", { params });
  const data = res.data;
  return data?.results ?? data ?? [];
}

/**
 * Course roster (admin/teacher)
 */
export async function listCourseRoster(
  courseId,
  { status = "enrolled", page = 1, pageSize = 200 } = {}
) {
  if (!courseId) return [];
  const params = { status, page, page_size: pageSize };
  const res = await api.get(`/courses/${courseId}/enrollments/`, { params });
  return res.data?.results ?? res.data ?? [];
}

/**
 * Self-enroll (student)
 */
export async function selfEnroll(courseId) {
  if (!courseId) throw new Error("courseId is required");
  const res = await api.post(ENROLLMENTS, { course: courseId });
  return res.data;
}

/**
 * Drop enrollment (student or manager)
 */
export async function dropEnrollment(enrollmentId) {
  await api.delete(`${ENROLLMENTS}${enrollmentId}/`);
}
