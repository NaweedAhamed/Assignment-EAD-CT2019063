// frontend/src/pages/SessionsList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Table from "../components/Table";
import { listSessions, deleteSession } from "../services/attendanceService";
import { listCourses } from "../services/enrollmentService";

export default function SessionsList() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);

  // filters/meta
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState("");
  const [semester, setSemester] = useState("");
  const [date, setDate] = useState("");

  // ui
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count]);

  useEffect(() => {
    listCourses().then(setCourses).catch(console.error);
  }, []);

  const fetchRows = async () => {
    setLoading(true);
    setError("");
    try {
      const { results, count } = await listSessions({
        page,
        pageSize,
        search,
        courseId,
        semester,
        date,
        ordering: "-date,-start_time",
      });
      setRows(results);
      setCount(count);
    } catch (e) {
      console.error(e);
      setError("Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, courseId, semester, date]);

  const onDelete = async (row) => {
    if (!confirm(`Delete session on ${row.date} at ${row.start_time}?`)) return;
    await deleteSession(row.id);
    await fetchRows();
  };

  const columns = [
    { key: "date", header: "Date" },
    { key: "start_time", header: "Start" },
    { key: "end_time", header: "End" },
    { key: "room", header: "Room" },
    { key: "course_title", header: "Course", render: (r) => r.course_title || r.course?.title },
    { key: "semester", header: "Sem" },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          <button
            className="rounded-lg border px-3 py-1 hover:bg-gray-50"
            onClick={() => navigate(`/sessions/${r.id}/edit`)}
          >
            Edit
          </button>
          <button
            className="rounded-lg border px-3 py-1 hover:bg-gray-50"
            onClick={() => onDelete(r)}
          >
            Delete
          </button>
          <button
            className="rounded-lg border px-3 py-1 hover:bg-gray-50"
            onClick={() => navigate(`/sessions/${r.id}/attendance`)}
          >
            Take Attendance
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Sessions</h1>
        <Link to="/sessions/new" className="bg-black text-white px-4 py-2 rounded shadow hover:opacity-90">
          + New Session
        </Link>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        <input
          className="border w-full rounded px-3 py-2"
          placeholder="Search notes/room/course…"
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
        />
        <select
          className="border w-full rounded px-3 py-2"
          value={courseId}
          onChange={(e) => { setPage(1); setCourseId(e.target.value); }}
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title || c.name}</option>
          ))}
        </select>
        <select
          className="border w-full rounded px-3 py-2"
          value={semester}
          onChange={(e) => { setPage(1); setSemester(e.target.value); }}
        >
          <option value="">All semesters</option>
          {Array.from({ length: 8 }).map((_, i) => (
            <option key={i + 1} value={String(i + 1)}>Semester {i + 1}</option>
          ))}
        </select>
        <input
          type="date"
          className="border w-full rounded px-3 py-2"
          value={date}
          onChange={(e) => { setPage(1); setDate(e.target.value); }}
        />
        <button
          onClick={() => { setSearch(""); setCourseId(""); setSemester(""); setDate(""); setPage(1); }}
          className="rounded border px-3 py-2"
        >
          Reset
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <EmptyState title="Couldn’t load sessions" subtitle={error} action={<button onClick={fetchRows} className="border px-4 py-2 rounded">Retry</button>} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No sessions"
          subtitle="Create your first session for a course and semester."
          action={<Link to="/sessions/new" className="bg-black text-white px-4 py-2 rounded">+ New Session</Link>}
        />
      ) : (
        <>
          <Table columns={columns} data={rows} />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button className="rounded border px-3 py-1 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
              <button className="rounded border px-3 py-1 disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
