// frontend/src/services/enrollmentService.js
import axios from "./axios"; 


const ENROLLMENTS = "/core/enrollments/";
const STUDENTS = "/core/students/";
const COURSES = "/core/courses/";

/**
 * List enrollments with optional filters and pagination
 */
export async function listEnrollments({
  page = 1,
  pageSize = 10,
  search = "",
  studentId = "",
  courseId = "",
} = {}) {
  const params = {
    page,
    page_size: pageSize,
  };
  if (search) params.search = search;
  if (studentId) params.student = studentId;
  if (courseId) params.course = courseId;

  const res = await axios.get(ENROLLMENTS, { params });
  // Supports both paginated ({results, count}) and non-paginated ([])
  return {
    results: res.data?.results ?? res.data ?? [],
    count:
      typeof res.data?.count === "number"
        ? res.data.count
        : (res.data?.length ?? 0),
  };
}

/**
 * Retrieve a single enrollment
 */
export async function getEnrollment(id) {
  const res = await axios.get(`${ENROLLMENTS}${id}/`);
  return res.data;
}

/**
 * Create enrollment
 */
export async function createEnrollment(payload) {
  // payload = { student, course, semester, status, enrollment_date }
  const res = await axios.post(ENROLLMENTS, payload);
  return res.data;
}

/**
 * Update enrollment
 */
export async function updateEnrollment(id, payload) {
  const res = await axios.put(`${ENROLLMENTS}${id}/`, payload);
  return res.data;
}

/**
 * Delete enrollment
 */
export async function deleteEnrollment(id) {
  await axios.delete(`${ENROLLMENTS}${id}/`);
}

/**
 * List students (for dropdowns)
 */
export async function listStudents(query = "") {
  const res = await axios.get(STUDENTS, {
    params: { search: query, page_size: 200 },
  });
  return res.data?.results ?? res.data ?? [];
}

/**
 * List courses (for dropdowns)
 */
export async function listCourses(query = "") {
  const res = await axios.get(COURSES, {
    params: { search: query, page_size: 200 },
  });
  return res.data?.results ?? res.data ?? [];
}

/**
 * Enrollments for a single student
 */
export async function listStudentEnrollments(studentId, { page = 1, pageSize = 10 } = {}) {
  if (!studentId) return { results: [], count: 0 };
  return listEnrollments({ page, pageSize, studentId });
}
