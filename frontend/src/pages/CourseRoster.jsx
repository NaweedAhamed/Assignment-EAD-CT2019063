// src/pages/instructor/CourseRoster.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/axios";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Table from "../components/Table";

export default function CourseRoster() {
  const { id: courseId } = useParams();
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0); // for paginated APIs
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load(curPage = page) {
    setLoading(true);
    setErr("");
    try {
      const params = { page: curPage, page_size: pageSize };
      if (search.trim()) params.search = search.trim();

      // ✅ matches backend: GET /api/courses/:course_id/roster/
      const res = await api.get(`/courses/${courseId}/roster/`, { params });

      // Supports both paginated ({results, count}) and non-paginated ([])
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      const total =
        typeof res.data?.count === "number"
          ? res.data.count
          : Array.isArray(res.data)
          ? res.data.length
          : data.length;

      setRows(data);
      setCount(total);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to load course roster.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]); // reload if route changes

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    load(1);
  }

  const data = useMemo(
    () =>
      rows.map((r) => ({
        id: r.id,
        index_no: r.index_no || "—",
        student_name: r.student_name || "—",
        student_email: r.student_email || "—",
        status: r.status || "—",
      })),
    [rows]
  );

  if (loading) return <Loader label="Loading roster..." />;
  if (err) return <p className="p-4 text-red-600">{err}</p>;

  if (data.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Course Roster</h1>
          <Link to={`/courses/${courseId}`} className="text-blue-600 hover:underline">
            Back to course →
          </Link>
        </div>
        <EmptyState
          title="No students enrolled yet"
          subtitle="Once students enroll, they’ll appear here."
        />
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Course Roster</h1>
        <Link to={`/courses/${courseId}`} className="text-blue-600 hover:underline">
          Back to course →
        </Link>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or index..."
          className="border rounded-md px-3 py-2 w-full"
        />
        <button
          type="submit"
          className="bg-gray-800 text-white rounded-md px-4 py-2"
        >
          Search
        </button>
      </form>

      <Table
        columns={[
          { key: "index_no", header: "Index" },
          { key: "student_name", header: "Name" },
          { key: "student_email", header: "Email" },
          { key: "status", header: "Status" },
        ]}
        data={data}
      />

      {/* Simple pager (only shows if count is from paginated API) */}
      {count > pageSize && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="space-x-2">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => {
                const p = page - 1;
                setPage(p);
                load(p);
              }}
            >
              Prev
            </button>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => {
                const p = page + 1;
                setPage(p);
                load(p);
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
