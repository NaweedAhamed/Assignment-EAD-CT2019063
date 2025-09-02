// frontend/src/pages/EnrollmentsList.jsx
import { useEffect, useMemo, useState } from "react";
import Table from "../components/Table";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import {
  listEnrollments,
  deleteEnrollment,
  listStudents,
  listCourses,
} from "../services/enrollmentService";
import { useNavigate } from "react-router-dom";

export default function EnrollmentsList() {
  const navigate = useNavigate();

  // data
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);

  // ui state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters
  const [search, setSearch] = useState("");
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");

  // dropdown meta
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count]);

  const fetchMeta = async () => {
    try {
      const [S, C] = await Promise.all([listStudents(), listCourses()]);
      setStudents(S);
      setCourses(C);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRows = async () => {
    setLoading(true);
    setError("");
    try {
      const { results, count } = await listEnrollments({
        page,
        pageSize,
        search,
        studentId,
        courseId,
      });
      setRows(results);
      setCount(count);
    } catch (e) {
      console.error(e);
      setError("Failed to load enrollments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, studentId, courseId]);

  const onDelete = async (row) => {
    if (!confirm(`Delete enrollment #${row.id}?`)) return;
    await deleteEnrollment(row.id);
    await fetchRows();
  };

  const columns = [
    {
      key: "student",
      header: "Student",
      render: (r) => r.student_name || r.student?.full_name || `#${r.student}`,
    },
    {
      key: "course",
      header: "Course",
      render: (r) => r.course_title || r.course?.title || `#${r.course}`,
    },
    { key: "semester", header: "Semester" },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span className="inline-block rounded-full border px-2 py-0.5 text-xs">
          {r.status}
        </span>
      ),
    },
    { key: "enrollment_date", header: "Date" },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          <button
            className="rounded-lg border px-3 py-1 hover:bg-gray-50"
            onClick={() => navigate(`/enrollments/${r.id}/edit`)}
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Enrollments</h1>
        <button
          onClick={() => navigate("/enrollments/new")}
          className="rounded-2xl px-4 py-2 bg-black text-white shadow hover:opacity-90"
        >
          New Enrollment
        </button>
      </div>

      {/* Filters */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="text"
          placeholder="Search by student/course…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="rounded-xl border border-gray-300 px-4 py-2"
        />

        <select
          value={studentId}
          onChange={(e) => {
            setPage(1);
            setStudentId(e.target.value);
          }}
          className="rounded-xl border border-gray-300 px-3 py-2"
        >
          <option value="">All Students</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name || s.name || `#${s.id}`}
            </option>
          ))}
        </select>

        <select
          value={courseId}
          onChange={(e) => {
            setPage(1);
            setCourseId(e.target.value);
          }}
          className="rounded-xl border border-gray-300 px-3 py-2"
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title || c.name || `#${c.id}`}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setSearch("");
            setStudentId("");
            setCourseId("");
            setPage(1);
          }}
          className="rounded-xl border px-3 py-2"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="mt-6">
        {loading ? (
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
            description="Try adjusting filters or create a new enrollment."
            actionLabel="New Enrollment"
            onAction={() => navigate("/enrollments/new")}
          />
        ) : (
          <>
            <Table columns={columns} data={rows} />

            {/* Pagination */}
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
