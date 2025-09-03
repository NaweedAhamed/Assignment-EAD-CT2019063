// src/pages/student/StudentDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStudentDashboard } from "../../services/dashboardService";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getStudentDashboard();
        setData(res);
      } catch (e) {
        setErr(e?.response?.data?.detail || "Failed to load student dashboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader label="Loading dashboard..." />;
  if (err) return <p className="p-4 text-red-600">{err}</p>;

  const { courses = [], upcoming_assessments = [], recent_grades = [], alerts = [] } = data || {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <Link to="/student/my-courses" className="text-blue-600 hover:underline">
          My Courses →
        </Link>
      </div>

      {alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded p-3">
          <ul className="list-disc pl-5">
            {alerts.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      {/* My Courses */}
      <section>
        <h2 className="text-lg font-semibold mb-2">My Courses</h2>
        {courses.length === 0 ? (
          <EmptyState
            title="No courses yet"
            subtitle="Browse courses and enroll to see them here."
            action={<Link to="/courses" className="bg-blue-600 text-white px-3 py-2 rounded">Browse Courses</Link>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {courses.map(c => (
              <Link key={c.id} to={`/courses/${c.id}`} className="bg-white border rounded p-3 hover:shadow">
                <div className="font-semibold">{c.code} — {c.title}</div>
                <div className="text-sm text-gray-600">{c.credits ?? 0} credits</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Assessments */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Upcoming Assessments</h2>
        {upcoming_assessments.length === 0 ? (
          <div className="text-gray-600 text-sm">No upcoming items.</div>
        ) : (
          <div className="overflow-x-auto border rounded bg-white">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 border-b">Course</th>
                  <th className="px-3 py-2 border-b">Assessment</th>
                  <th className="px-3 py-2 border-b">Type</th>
                  <th className="px-3 py-2 border-b">Due</th>
                </tr>
              </thead>
              <tbody>
                {upcoming_assessments.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 border-b">{a.course_title}</td>
                    <td className="px-3 py-2 border-b">{a.title}</td>
                    <td className="px-3 py-2 border-b">{a.type}</td>
                    <td className="px-3 py-2 border-b">{a.due_date ? new Date(a.due_date).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent Grades */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Recent Grades</h2>
        {recent_grades.length === 0 ? (
          <div className="text-gray-600 text-sm">No recent grades.</div>
        ) : (
          <div className="overflow-x-auto border rounded bg-white">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 border-b">Course</th>
                  <th className="px-3 py-2 border-b">Assessment</th>
                  <th className="px-3 py-2 border-b text-right">Score</th>
                  <th className="px-3 py-2 border-b">Graded</th>
                </tr>
              </thead>
              <tbody>
                {recent_grades.map(g => (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 border-b">{g.course_title}</td>
                    <td className="px-3 py-2 border-b">{g.assessment_title}</td>
                    <td className="px-3 py-2 border-b text-right">{g.score} / {g.max_marks}</td>
                    <td className="px-3 py-2 border-b">{g.graded_at ? new Date(g.graded_at).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
