// Handles API calls for Courses
const API_BASE = "/api/courses/";

export async function getCourses() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Failed to fetch courses");
  return res.json();
}

export async function getCourse(id) {
  const res = await fetch(`${API_BASE}${id}/`);
  if (!res.ok) throw new Error("Failed to fetch course");
  return res.json();
}

export async function createCourse(course) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(course),
  });
  if (!res.ok) throw new Error("Failed to create course");
  return res.json();
}

export async function updateCourse(id, course) {
  const res = await fetch(`${API_BASE}${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(course),
  });
  if (!res.ok) throw new Error("Failed to update course");
  return res.json();
}

export async function deleteCourse(id) {
  const res = await fetch(`${API_BASE}${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete course");
  return true;
}
