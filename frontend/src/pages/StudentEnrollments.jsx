// frontend/src/pages/StudentEnrollments.jsx
import { useEffect, useMemo, useState } from "react";
import Table from "../components/Table";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { listStudentEnrollments, listStudents } from "../services/enrollmentService";
import { useParams, useNavigate } from "react-router-dom";

export default function StudentEnrollments() {
  const { studentId: studentIdParam } = useParams(); // optional route param /students/:studentId/enrollments
  const navigate = useNavigate();

  const [studentId, setStudentId] = useState(studentIdParam || "");
  const [students, setStudents] = useState([]);

  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);

  const [loading, setLoading] = useState(!!studentIdParam);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count]);

  const loadStudents = async () => {
    try {
      const S = await listStudents();
      setStudents(S);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRows = async () => {
    if (!studentId) return;
    setLoading(true);
    setError("");
    try {
      const { results, count } = await listStudentEnrollments(studentId, { page, pageSize });
      setRows(results);
      setCount(count);
    } catch (e) {
      console.error(e);
      setError("Failed to load student enrollments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (studentId) fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, page]);

  const columns = [
    { key: "course", header: "Course", render: (r) => r.course_title || r.course?.title || `#${r.course}` },
    { key: "semester", header: "Semester" },
    { key: "status", header: "Status" },
    { key: "enrollment_date", header: "Date" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Student Enrollments</h1>
        <button
          onClick={() => navigate("/enrollments")}
          className="rounded-2xl px-4 py-2 border"
        >
          Back to All
        </button>
      </div>

      {/* Student Picker (if not supplied via route param) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select
          value={studentId}
          onChange={(e) => {
            setPage(1);
            setStudentId(e.target.value);
          }}
          className="rounded-xl border border-gray-300 px-3 py-2"
        >
          <option value="">Select student…</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name || s.name || `#${s.id}`}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {!studentId ? (
          <EmptyState
            title="Pick a student"
            description="Choose a student to view their enrollments."
          />
        ) : loading ? (
          <Loader />
        ) : error ? (
          <EmptyState
            title="Couldn’t load enrollments"
            description={error}
            actionLabel="Retry"
            onAction={fetchRows}
          />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No enrollments"
            description="This student has no enrollments yet."
          />
        ) : (
          <>
            <Table columns={columns} data={rows} />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  className="rounded-xl border px-3 py-1 disabled:opacity-50"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                <button
                  className="rounded-xl border px-3 py-1 disabled:opacity-50"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
