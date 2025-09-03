// frontend/src/pages/AssessmentsList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Table from "../components/Table";
import { listAssessments, deleteAssessment } from "../services/gradeService";
import { listCourses } from "../services/enrollmentService";

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "quiz", label: "Quiz" },
  { value: "assignment", label: "Assignment" },
  { value: "mid", label: "Midterm" },
  { value: "final", label: "Final" },
  { value: "other", label: "Other" },
];

export default function AssessmentsList() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters
  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState("");
  const [semester, setSemester] = useState("");
  const [type, setType] = useState("");

  // meta
  const [courses, setCourses] = useState([]);

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count]);

  const loadMeta = async () => {
    try {
      const C = await listCourses("");
      setCourses(C);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRows = async () => {
    setLoading(true);
    setError("");
    try {
      const { results, count } = await listAssessments({
        page,
        pageSize,
        search,
        courseId,
        semester,
        type,
        ordering: "due_date,id",
      });
      setRows(results);
      setCount(count);
    } catch (e) {
      console.error(e);
      setError("Failed to load assessments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, courseId, semester, type]);

  const onDelete = async (row) => {
    if (!confirm(`Delete assessment “${row.title}”?`)) return;
    await deleteAssessment(row.id);
    await fetchRows();
  };

  const columns = [
    { key: "title", header: "Title" },
    {
      key: "type",
      header: "Type",
      render: (r) => (
        <span className="inline-block rounded-full border px-2 py-0.5 text-xs">
          {r.type}
        </span>
      ),
    },
    { key: "weight", header: "Weight %" },
    { key: "max_marks", header: "Max" },
    { key: "due_date", header: "Due" },
    { key: "course_title", header: "Course", render: (r) => r.course_title || r.course?.title },
    { key: "semester", header: "Sem" },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          <button
            className="rounded-lg border px-3 py-1 hover:bg-gray-50"
            onClick={() => navigate(`/assessments/${r.id}/edit`)}
          >
            Edit
          </button>
          <button
            className="rounded-lg border px-3 py-1 hover:bg-gray-50"
            onClick={() => onDelete(r)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Assessments</h1>
        <Link to="/assessments/new" className="bg-black text-white px-4 py-2 rounded shadow hover:opacity-90">
          + New Assessment
        </Link>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        <input
          className="border w-full rounded px-3 py-2"
          placeholder="Search by title or course…"
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
            <option key={c.id} value={c.id}>
              {c.title || c.name}
            </option>
          ))}
        </select>
        <select
          className="border w-full rounded px-3 py-2"
          value={semester}
          onChange={(e) => { setPage(1); setSemester(e.target.value); }}
        >
          <option value="">All semesters</option>
          {Array.from({ length: 8 }).map((_, i) => (
            <option key={i + 1} value={String(i + 1)}>
              Semester {i + 1}
            </option>
          ))}
        </select>
        <select
          className="border w-full rounded px-3 py-2"
          value={type}
          onChange={(e) => { setPage(1); setType(e.target.value); }}
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <button
          onClick={() => { setSearch(""); setCourseId(""); setSemester(""); setType(""); setPage(1); }}
          className="rounded border px-3 py-2"
        >
          Reset
        </button>
      </div>

      {/* Table / Empty / Error */}
      {loading ? (
        <Loader />
      ) : error ? (
        <EmptyState title="Couldn’t load assessments" subtitle={error} action={<button onClick={fetchRows} className="border px-4 py-2 rounded">Retry</button>} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No assessments"
          subtitle="Create your first assessment for a course and semester."
          action={<Link to="/assessments/new" className="bg-black text-white px-4 py-2 rounded">+ New Assessment</Link>}
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
