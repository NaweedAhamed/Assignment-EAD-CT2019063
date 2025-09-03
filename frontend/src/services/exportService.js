// src/services/exportService.js
import api from "./axios";

/**
 * Extract filename from Content-Disposition header if present.
 */
function filenameFromHeaders(headers, fallback) {
  const cd = headers?.["content-disposition"] || headers?.get?.("content-disposition");
  if (!cd) return fallback;
  const match = /filename\*?=(?:UTF-8''|")?([^\";]+)\"?/i.exec(cd);
  try {
    return match && decodeURIComponent(match[1]) ? decodeURIComponent(match[1]) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Trigger a browser download for a Blob with a given filename.
 */
function triggerDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Download Grades CSV for a course.
 * GET /courses/:courseId/grades.csv
 */
export async function downloadCourseGradesCSV(courseId) {
  const res = await api.get(`/courses/${courseId}/grades.csv`, { responseType: "blob" });
  const filename = filenameFromHeaders(res.headers, `gradebook_${courseId}.csv`);
  triggerDownload(res.data, filename);
}

/**
 * Download Attendance CSV for a course.
 * GET /courses/:courseId/attendance.csv
 */
export async function downloadCourseAttendanceCSV(courseId) {
  const res = await api.get(`/courses/${courseId}/attendance.csv`, { responseType: "blob" });
  const filename = filenameFromHeaders(res.headers, `attendance_${courseId}.csv`);
  triggerDownload(res.data, filename);
}
