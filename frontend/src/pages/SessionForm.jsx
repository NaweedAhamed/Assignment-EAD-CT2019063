// frontend/src/pages/SessionForm.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { listCourses } from "../services/enrollmentService";
import { createSession, getSession, updateSession } from "../services/attendanceService";

export default function SessionForm() {
  const { id } = useParams(); // /sessions/new OR /sessions/:id/edit
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
    date: "",
    start_time: "",
    end_time: "",
    room: "",
    notes: "",
  });

  const semesterOptions = useMemo(
    () => Array.from({ length: 8 }).map((_, i) => ({ value: String(i + 1), label: `Semester ${i + 1}` })),
    []
  );

  useEffect(() => {
    listCourses().then(setCourses).catch(console.error);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!isEdit) return;
      setLoading(true);
      setError("");
      try {
        const data = await getSession(id);
        setForm({
          course: data.course ?? "",
          semester: String(data.semester ?? ""),
          date: data.date ?? "",
          start_time: data.start_time ?? "",
          end_time: data.end_time ?? "",
          room: data.room ?? "",
          notes: data.notes ?? "",
        });
      } catch {
        setError("Failed to load session.");
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
    const payload = { ...form, semester: String(form.semester).trim() };

    try {
      if (isEdit) await updateSession(id, payload);
      else await createSession(payload);
      navigate("/sessions");
    } catch (e) {
      const data = e?.response?.data;
      if (data && typeof data === "object") {
        setFieldErrors(data);
        setError(data.non_field_errors?.[0] || "Failed to save session.");
      } else {
        setError("Failed to save session.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (error && isEdit && !form.date) {
    return <EmptyState title="Couldn’t load this session" subtitle={error} />;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{isEdit ? "Edit Session" : "New Session"}</h1>
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
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {fieldErrors.semester && <p className="text-xs text-red-600 mt-1">{fieldErrors.semester[0]}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
            />
            {fieldErrors.date && <p className="text-xs text-red-600 mt-1">{fieldErrors.date[0]}</p>}
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Start time</label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
              />
              {fieldErrors.start_time && <p className="text-xs text-red-600 mt-1">{fieldErrors.start_time[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">End time</label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
              />
              {fieldErrors.end_time && <p className="text-xs text-red-600 mt-1">{fieldErrors.end_time[0]}</p>}
            </div>
          </div>

          {/* Room */}
          <div>
            <label className="block text-sm font-medium">Room</label>
            <input
              value={form.room}
              onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
              placeholder="e.g., Lab A / Room 102"
            />
            {fieldErrors.room && <p className="text-xs text-red-600 mt-1">{fieldErrors.room[0]}</p>}
          </div>

          {/* Notes (full width) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
              placeholder="Optional notes"
            />
            {fieldErrors.notes && <p className="text-xs text-red-600 mt-1">{fieldErrors.notes[0]}</p>}
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
            onClick={() => navigate("/sessions")}
            className="rounded-2xl px-4 py-2 border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
