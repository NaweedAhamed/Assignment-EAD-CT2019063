// src/pages/student/Results.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyResults } from "../../services/gradeService";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

export default function Results() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const res = await getMyResults();
        setItems(res.items || []);
      } catch (e) {
        setErr(e?.response?.data?.detail || "Failed to load results.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loader label="Loading results..." />;
  if (err) return <p className="p-4 text-red-600">{err}</p>;

  if (items.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">My Results</h1>
        <EmptyState
          title="No results available"
          subtitle="Once assessments are graded, your results will appear here."
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Results</h1>

      <div className="overflow-x-auto border rounded-lg bg-white shadow">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b">Course</th>
              <th className="px-4 py-2 border-b">Semester</th>
              <th className="px-4 py-2 border-b text-right">Overall %</th>
              <th className="px-4 py-2 border-b text-right">Weighted %</th>
              <th className="px-4 py-2 border-b"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.course_id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b font-medium">{c.course_title}</td>
                <td className="px-4 py-2 border-b">{c.semester}</td>
                <td className="px-4 py-2 border-b text-right">{c.total_percent}%</td>
                <td className="px-4 py-2 border-b text-right">{c.weighted_percent}%</td>
                <td className="px-4 py-2 border-b text-right">
                  <Link
                    to={`/student/courses/${c.course_id}/results`}
                    className="text-blue-600 hover:underline"
                  >
                    View Details →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
