// Handles API calls related to Enrollments, My Courses, and Rosters
const ENROLLMENTS_API = "/api/enrollments/";
const MY_COURSES_API = "/api/my-courses/";
const ROSTER_API = (courseId) => `/api/courses/${courseId}/roster/`;

/**
 * List all enrollments (with optional filters).
 */
export async function getEnrollments({ studentId = "", courseId = "", status = "" } = {}) {
  const params = new URLSearchParams();
  if (studentId) params.append("student", studentId);
  if (courseId) params.append("course", courseId);
  if (status) params.append("status", status);

  const res = await fetch(`${ENROLLMENTS_API}?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch enrollments");
  return res.json();
}

/**
 * Get the current student's courses (My Courses).
 */
export async function listMyCourses({ page = 1, pageSize = 10 } = {}) {
  const params = new URLSearchParams({ page, page_size: pageSize });
  const res = await fetch(`${MY_COURSES_API}?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch my courses");
  return res.json();
}

/**
 * Get the roster for a given course (Instructor/Admin).
 */
export async function getRoster(courseId, { search = "", page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams({ page, page_size: pageSize });
  if (search) params.append("search", search);

  const res = await fetch(`${ROSTER_API(courseId)}?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch course roster");
  return res.json();
}
