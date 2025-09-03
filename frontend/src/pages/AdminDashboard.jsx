// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboard } from "../../services/dashboardService";
import Loader from "../../components/Loader";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getAdminDashboard();
        setData(res);
      } catch (e) {
        setErr(e?.response?.data?.detail || "Failed to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader label="Loading dashboard..." />;
  if (err) return <p className="p-4 text-red-600">{err}</p>;

  const { stats = [], top_courses = [], recent_activity = [] } = data || {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link to="/courses" className="text-blue-600 hover:underline">Manage Courses →</Link>
      </div>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border rounded p-4 shadow-sm">
            <div className="text-gray-500 text-sm">{s.label}</div>
            <div className="text-2xl font-semibold">{s.value}</div>
          </div>
        ))}
      </section>

      {/* Top courses */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Top Courses by Enrollment</h2>
        {top_courses.length === 0 ? (
          <div className="text-gray-600 text-sm">No data.</div>
        ) : (
          <div className="overflow-x-auto border rounded bg-white">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 border-b">Code</th>
                  <th className="px-3 py-2 border-b">Title</th>
                  <th className="px-3 py-2 border-b text-right">Enrollments</th>
                </tr>
              </thead>
              <tbody>
                {top_courses.map(c => (
                  <tr key={c.course_id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 border-b">{c.code}</td>
                    <td className="px-3 py-2 border-b">
                      <Link to={`/courses/${c.course_id}`} className="text-blue-600 hover:underline">
                        {c.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2 border-b text-right">{c.enrollments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent activity */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
        {recent_activity.length === 0 ? (
          <div className="text-gray-600 text-sm">No recent activity.</div>
        ) : (
          <ul className="space-y-2">
            {recent_activity.map(a => (
              <li key={`${a.kind}-${a.id}`} className="bg-white border rounded p-3">
                <div className="text-sm text-gray-500">{a.kind.toUpperCase()} • {a.when ? new Date(a.when).toLocaleString() : "—"}</div>
                <div className="font-medium">{a.summary}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
