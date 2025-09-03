// frontend/src/pages/AssessmentForm.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { listCourses } from "../services/enrollmentService";
import {
  createAssessment,
  getAssessment,
  updateAssessment,
} from "../services/gradeService";

const TYPE_OPTIONS = [
  { value: "quiz", label: "Quiz" },
  { value: "assignment", label: "Assignment" },
  { value: "mid", label: "Midterm" },
  { value: "final", label: "Final" },
  { value: "other", label: "Other" },
];

export default function AssessmentForm() {
  const { id } = useParams(); // /assessments/new OR /assessments/:id/edit
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [courses, setCourses] = useState([]);

  const [form, setForm] = useState({
    course: "",
    semester: "",
    title: "",
    type: "other",
    weight: "",
    max_marks: "",
    due_date: "",
  });

  const semesterOptions = useMemo(
    () => Array.from({ length: 8 }).map((_, i) => ({ value: String(i + 1), label: `Semester ${i + 1}` })),
    []
  );

  useEffect(() => {
    listCourses().then(setCourses).catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!isEdit) return;
      setLoading(true);
      setError("");
      try {
        const data = await getAssessment(id);
        setForm({
          course: data.course ?? data.course_id ?? "",
          semester: String(data.semester ?? ""),
          title: data.title ?? "",
          type: data.type ?? "other",
          weight: String(data.weight ?? ""),
          max_marks: String(data.max_marks ?? ""),
          due_date: data.due_date ?? "",
        });
      } catch (e) {
        setError("Failed to load assessment.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});
    const payload = {
      course: form.course,
      semester: String(form.semester).trim(),
      title: String(form.title).trim(),
      type: form.type,
      weight: Number(form.weight),
      max_marks: Number(form.max_marks),
      due_date: form.due_date || null,
    };
    try {
      if (isEdit) await updateAssessment(id, payload);
      else await createAssessment(payload);
      navigate("/assessments");
    } catch (e) {
      const data = e?.response?.data;
      if (data && typeof data === "object") {
        setFieldErrors(data);
        setError(data.non_field_errors?.[0] || "Failed to save assessment.");
      } else {
        setError("Failed to save assessment.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (error && isEdit && !form.title) {
    return <EmptyState title="Couldn’t load this assessment" subtitle={error} />;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{isEdit ? "Edit Assessment" : "New Assessment"}</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Course */}
          <div>
            <label className="block text-sm font-medium">Course</label>
            <select
              value={form.course}
              onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title || c.name}
                </option>
              ))}
            </select>
            {fieldErrors.course && <p className="text-xs text-red-600 mt-1">{fieldErrors.course[0]}</p>}
          </div>

          {/* Semester */}
          <div>
            <label className="block text-sm font-medium">Semester</label>
            <select
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
            {fieldErrors.semester && <p className="text-xs text-red-600 mt-1">{fieldErrors.semester[0]}</p>}
          </div>

          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
              placeholder="e.g., Midterm"
            />
            {fieldErrors.title && <p className="text-xs text-red-600 mt-1">{fieldErrors.title[0]}</p>}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {fieldErrors.type && <p className="text-xs text-red-600 mt-1">{fieldErrors.type[0]}</p>}
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium">Weight (%)</label>
            <input
              type="number"
              step="0.01"
              value={form.weight}
              onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
            />
            {fieldErrors.weight && <p className="text-xs text-red-600 mt-1">{fieldErrors.weight[0]}</p>}
          </div>

          {/* Max marks */}
          <div>
            <label className="block text-sm font-medium">Max marks</label>
            <input
              type="number"
              step="0.01"
              value={form.max_marks}
              onChange={(e) => setForm((f) => ({ ...f, max_marks: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
            />
            {fieldErrors.max_marks && <p className="text-xs text-red-600 mt-1">{fieldErrors.max_marks[0]}</p>}
          </div>

          {/* Due date */}
          <div>
            <label className="block text-sm font-medium">Due date</label>
            <input
              type="date"
              value={form.due_date || ""}
              onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
            />
            {fieldErrors.due_date && <p className="text-xs text-red-600 mt-1">{fieldErrors.due_date[0]}</p>}
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
            onClick={() => navigate("/assessments")}
            className="rounded-2xl px-4 py-2 border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
