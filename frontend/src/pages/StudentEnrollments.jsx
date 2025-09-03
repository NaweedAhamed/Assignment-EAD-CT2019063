// frontend/src/pages/StudentEnrollments.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Table from "../components/Table";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { listStudentEnrollments, dropEnrollment } from "../services/enrollmentService";
import { getStudents } from "../services/studentService";

export default function StudentEnrollments() {
  // Optional route param: /students/:studentId/enrollments
  const { studentId: studentIdParam } = useParams();
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

  // Load students for the selector (when studentId isn't fixed by route)
  useEffect(() => {
    if (studentIdParam) return; // skip if route already pins a student
    (async () => {
      try {
        const data = await getStudents();
        const items = Array.isArray(data) ? data : data.results || [];
        setStudents(items);
      } catch (e) {
        // non-blocking
        console.error(e);
      }
    })();
  }, [studentIdParam]);

  // Fetch enrollments for the selected student
  async function fetchRows() {
    if (!studentId) return;
    setLoading(true);
    setError("");
    try {
      const data = await listStudentEnrollments(studentId, { page, page_size: pageSize });
      const results = Array.isArray(data) ? data : data.results || [];
      setRows(results);
      setCount(typeof data?.count === "number" ? data.count : results.length);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.detail || "Failed to load student enrollments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (studentId) fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, page]);

  async function onDrop(id) {
    if (!window.confirm("Drop this enrollment?")) return;
    try {
      await dropEnrollment(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      setCount((c) => Math.max(0, c - 1));
    } catch (e) {
      alert(e?.response?.data?.detail || "Failed to drop enrollment.");
    }
  }

  const data = useMemo(
    () =>
      rows.map((r) => ({
        id: r.id,
        courseId: r.course?.id,
        code: r.course?.code || "—",
        title: r.course?.title || "—",
        status: r.status || "—",
        enrolled_at: r.enrolled_at ? new Date(r.enrolled_at).toLocaleString() : "—",
      })),
    [rows]
  );

  const columns = [
    {
      key: "code",
      header: "Course",
      render: (row) =>
        row.courseId ? (
          <Link to={`/courses/${row.courseId}`} className="text-blue-600 hover:underline">
            {row.code}
          </Link>
        ) : (
          row.code
        ),
    },
    { key: "title", header: "Title" },
    { key: "status", header: "Status" },
    { key: "enrolled_at", header: "Enrolled At" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Student Enrollments</h1>
        <button onClick={() => navigate("/enrollments")} className="rounded-2xl px-4 py-2 border">
          Back to All
        </button>
      </div>

      {/* Student Picker (hidden if route param provided) */}
      {!studentIdParam && (
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
      )}

      <div className="mt-6">
        {!studentId ? (
          <EmptyState title="Pick a student" description="Choose a student to view their enrollments." />
        ) : loading ? (
          <Loader />
        ) : error ? (
          <EmptyState title="Couldn’t load enrollments" description={error} actionLabel="Retry" onAction={fetchRows} />
        ) : data.length === 0 ? (
          <EmptyState title="No enrollments" description="This student has no enrollments yet." />
        ) : (
          <>
            <Table
              columns={columns}
              data={data}
              actions={(row) => (
                <div className="space-x-3">
                  {row.courseId && (
                    <Link to={`/courses/${row.courseId}`} className="text-blue-600 hover:underline">
                      View
                    </Link>
                  )}
                  <button onClick={() => onDrop(row.id)} className="text-red-600 hover:underline">
                    Drop
                  </button>
                </div>
              )}
            />

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
