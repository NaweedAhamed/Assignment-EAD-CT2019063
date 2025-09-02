// API calls for Students
const API_BASE = "/api/students/";

export async function getStudents() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Failed to fetch students");
  return res.json();
}

export async function getStudent(id) {
  const res = await fetch(`${API_BASE}${id}/`);
  if (!res.ok) throw new Error("Failed to fetch student");
  return res.json();
}

export async function createStudent(student) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to create student");
  }
  return res.json();
}

export async function updateStudent(id, student) {
  const res = await fetch(`${API_BASE}${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to update student");
  }
  return res.json();
}

export async function deleteStudent(id) {
  const res = await fetch(`${API_BASE}${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete student");
  return true;
}
