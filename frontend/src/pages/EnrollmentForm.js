// frontend/src/pages/EnrollmentForm.jsx
import { useEffect, useMemo, useState } from "react";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import {
  createEnrollment,
  getEnrollment,
  listCourses,
  listStudents,
  updateEnrollment,
} from "../services/enrollmentService";
import { useNavigate, useParams } from "react-router-dom";

export default function EnrollmentForm() {
  const { id } = useParams(); // /enrollments/new OR /enrollments/:id/edit
  const navigate = useNavigate();

  const isEdit = Boolean(id);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit); // only load if editing
  const [error, setError] = useState("");

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [form, setForm] = useState({
    student: "",
    course: "",
    semester: "",
    status: "active",
    enrollment_date: new Date().toISOString().slice(0, 10),
  });

  const semesterOptions = useMemo(
    () => [
      { value: "1", label: "Semester 1" },
      { value: "2", label: "Semester 2" },
      { value: "3", label: "Semester 3" },
      { value: "4", label: "Semester 4" },
      { value: "5", label: "Semester 5" },
      { value: "6", label: "Semester 6" },
      { value: "7", label: "Semester 7" },
      { value: "8", label: "Semester 8" },
    ],
    []
  );

  const loadMeta = async () => {
    try {
      const [S, C] = await Promise.all([listStudents(), listCourses()]);
      setStudents(S);
      setCourses(C);
    } catch (e) {
      console.error(e);
    }
  };

  const loadExisting = async () => {
    if (!isEdit) return;
    setLoading(true);
    setError("");
    try {
      const data = await getEnrollment(id);
      setForm({
        student: data.student?.id ?? data.student ?? "",
        course: data.course?.id ?? data.course ?? "",
        semester: String(data.semester ?? ""),
        status: data.status ?? "active",
        enrollment_date: data.enrollment_date ?? new Date().toISOString().slice(0, 10),
      });
    } catch (e) {
      console.error(e);
      setError("Failed to load enrollment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    loadExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const validate = () => {
    if (!form.student) return "Student is required";
    if (!form.course) return "Course is required";
    if (!form.semester) return "Semester is required";
    if (!form.enrollment_date) return "Enrollment date is required";
    return "";
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      student: form.student,
      course: form.course,
      semester: String(form.semester).trim(),
      status: form.status,
      enrollment_date: form.enrollment_date,
    };

    try {
      if (isEdit) {
        await updateEnrollment(id, payload);
      } else {
        await createEnrollment(payload);
      }
      navigate("/enrollments");
    } catch (e) {
      console.error(e);
      setError("Failed to save enrollment.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (error && !saving && isEdit && !form.student) {
    return (
      <EmptyState
        title="Couldn’t load this enrollment"
        description={error}
        actionLabel="Back to list"
        onAction={() => navigate("/enrollments")}
      />
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {isEdit ? "Edit Enrollment" : "New Enrollment"}
        </h1>
      </div>

      {error && !saving && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Student */}
          <div>
            <label className="block text-sm font-medium">Student</label>
            <select
              name="student"
              value={form.student}
              onChange={(e) => setForm((f) => ({ ...f, student: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
            >
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name || s.name || `#${s.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Course */}
          <div>
            <label className="block text-sm font-medium">Course</label>
            <select
              name="course"
              value={form.course}
              onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title || c.name || `#${c.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-sm font-medium">Semester</label>
            <select
              name="semester"
              value={form.semester}
              onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
            >
              <option value="">Select semester</option>
              {semesterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium">Enrollment Date</label>
            <input
              type="date"
              name="enrollment_date"
              value={form.enrollment_date}
              onChange={(e) => setForm((f) => ({ ...f, enrollment_date: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl px-4 py-2 bg-black text-white shadow hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving…" : isEdit ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/enrollments")}
            className="rounded-2xl px-4 py-2 border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
