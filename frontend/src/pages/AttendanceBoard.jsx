// frontend/src/pages/AttendanceBoard.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { getSession, listAttendance, createAttendance, updateAttendance } from "../services/attendanceService";
import { listEnrollments } from "../services/enrollmentService";

const STATUS_OPTS = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "excused", label: "Excused" },
];

export default function AttendanceBoard() {
  const { id } = useParams(); // session id
  const [session, setSession] = useState(null);

  const [enrollments, setEnrollments] = useState([]);
  const [attendance, setAttendance] = useState([]); // for this session only

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Changed map: enrollmentId -> status
  const [changed, setChanged] = useState({});

  // Lookup for existing records by enrollment
  const attByEnrollment = useMemo(() => {
    const m = new Map();
    for (const a of attendance) m.set(a.enrollment, a);
    return m;
  }, [attendance]);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    setChanged({});
    try {
      const s = await getSession(id);
      setSession(s);

      // Load enrollments for this course; filter semester client-side
      const { results: enrResults } = await listEnrollments({
        page: 1,
        pageSize: 500,
        courseId: s.course,
      });
      const enrFiltered = (enrResults || []).filter(
        (e) => String(e.semester) === String(s.semester)
      );
      setEnrollments(enrFiltered);

      // Load attendance for this session
      const { results: attResults } = await listAttendance({
        page: 1,
        pageSize: 1000,
        session: id,
        ordering: "enrollment",
      });
      setAttendance(attResults || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onChange = (enrollmentId, value) => {
    setChanged((prev) => ({ ...prev, [enrollmentId]: value }));
  };

  const hasChanges = useMemo(() => Object.keys(changed).length > 0, [changed]);

  const saveAll = async () => {
    if (!hasChanges) return;
    setSaving(true);
    setError("");
    try {
      const ops = [];
      for (const [enrollmentId, status] of Object.entries(changed)) {
        const existing = attByEnrollment.get(Number(enrollmentId));
        if (existing?.id) {
          ops.push(updateAttendance(existing.id, { status }));
        } else {
          ops.push(createAttendance({ enrollment: Number(enrollmentId), session: Number(id), status }));
        }
      }
      await Promise.all(ops);
      await loadAll();
      setChanged({});
    } catch (e) {
      console.error(e);
      setError("Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (error) {
    return (
      <EmptyState
        title="Couldn’t load attendance"
        subtitle={error}
        action={<button onClick={loadAll} className="border px-4 py-2 rounded">Retry</button>}
      />
    );
  }
  if (!session) {
    return <EmptyState title="Session not found" subtitle="Please go back and pick a valid session." />;
  }
  if (enrollments.length === 0) {
    return (
      <EmptyState
        title="No enrolled students"
        subtitle="There are no enrollments for this course & semester."
        action={<Link to="/sessions" className="border px-4 py-2 rounded">Back to Sessions</Link>}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-sm text-gray-600">
            {session.course_title || "Course"} — Semester {session.semester} — {session.date} {session.start_time}-{session.end_time}
            {session.room ? ` — ${session.room}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/sessions" className="rounded border px-3 py-2">Back</Link>
          <button
            className="rounded px-4 py-2 bg-black text-white shadow hover:opacity-90 disabled:opacity-60"
            onClick={saveAll}
            disabled={!hasChanges || saving}
          >
            {saving ? "Saving…" : "Save All"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enr) => {
              const studentName = enr.student_name || enr.student?.full_name || `#${enr.student}`;
              const current = changed[enr.id] ?? attByEnrollment.get(enr.id)?.status ?? "";
              return (
                <tr key={enr.id} className="border-t">
                  <td className="px-4 py-2">{studentName}</td>
                  <td className="px-4 py-2">
                    <select
                      className="rounded border px-3 py-2"
                      value={current}
                      onChange={(e) => onChange(enr.id, e.target.value)}
                    >
                      <option value="">— Select —</option>
                      {STATUS_OPTS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hasChanges && (
        <p className="mt-3 text-xs text-gray-500">You have unsaved changes.</p>
      )}
    </div>
  );
}
