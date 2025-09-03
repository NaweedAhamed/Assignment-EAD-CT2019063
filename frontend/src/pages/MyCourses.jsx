import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/axios";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Table from "../components/Table";

export default function MyCourses() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      // ✅ updated to match backend: GET /api/my-courses/
      const res = await api.get("/my-courses/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setRows(data);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to load your courses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDrop(enrollmentId) {
    if (!window.confirm("Drop this course?")) return;
    try {
      await api.delete(`/enrollments/${enrollmentId}/`);
      setRows((prev) => prev.filter((r) => r.id !== enrollmentId));
    } catch (e) {
      alert(e?.response?.data?.detail || "Failed to drop enrollment.");
    }
  }

  const data = useMemo(
    () =>
      rows.map((enr) => ({
        id: enr.id,
        code: enr.course?.code || "—",
        title: enr.course?.title || "—",
        status: enr.status || "—",
        enrolled_at: enr.enrolled_at
          ? new Date(enr.enrolled_at).toLocaleString()
          : "—",
        course_id: enr.course?.id,
      })),
    [rows]
  );

  if (loading) return <Loader label="Loading my courses..." />;
  if (err) return <p className="p-4 text-red-600">{err}</p>;

  if (data.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">My Courses</h1>
        <EmptyState
          title="You’re not enrolled in any courses yet"
          subtitle="Browse courses and enroll to see them here."
          action={
            <Link to="/courses" className="bg-blue-600 text-white px-4 py-2 rounded">
              Browse Courses
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <Link to="/courses" className="text-blue-600 hover:underline">
          Browse courses →
        </Link>
      </div>

      <Table
        columns={[
          { key: "code", header: "Code" },
          { key: "title", header: "Title" },
          { key: "status", header: "Status" },
          { key: "enrolled_at", header: "Enrolled At" },
        ]}
        data={data}
        actions={(row) => (
          <div className="space-x-3">
            {row.course_id && (
              <Link to={`/courses/${row.course_id}`} className="text-blue-600 hover:underline">
                View
              </Link>
            )}
            <button
              onClick={() => handleDrop(row.id)}
              className="text-red-600 hover:underline"
            >
              Drop
            </button>
          </div>
        )}
      />
    </div>
  );
}
