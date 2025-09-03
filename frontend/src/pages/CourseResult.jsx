// src/pages/student/CourseResult.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMyCourseResults } from "../../services/gradeService";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

export default function CourseResult() {
  const { courseId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const res = await getMyCourseResults(courseId);
        const data = Array.isArray(res?.items) ? res.items : [];
        setItem(data.length ? data[0] : null);
      } catch (e) {
        setErr(e?.response?.data?.detail || "Failed to load course results.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId]);

  if (loading) return <Loader label="Loading course results..." />;
  if (err) return <p className="p-4 text-red-600">{err}</p>;

  if (!item) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Course Results</h1>
          <Link to="/student/results" className="text-blue-600 hover:underline">
            Back to all results →
          </Link>
        </div>
        <EmptyState
          title="No results for this course"
          subtitle="Either you’re not enrolled or there are no graded assessments yet."
        />
      </div>
    );
  }

  const { course_title, semester, total_percent, weighted_percent, assessments = [] } = item;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{course_title}</h1>
          <div className="text-gray-600">Semester: {semester || "—"}</div>
        </div>
        <Link to="/student/results" className="text-blue-600 hover:underline">
          Back to all results →
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Overall Percentage</div>
          <div className="text-2xl font-semibold">{total_percent}%</div>
          <div className="text-xs text-gray-500 mt-1">
            Calculated as total scored / total max × 100
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Weighted Percentage</div>
          <div className="text-2xl font-semibold">{weighted_percent}%</div>
          <div className="text-xs text-gray-500 mt-1">
            Sum of (score/max) × weight across assessments
          </div>
        </div>
      </div>

      {/* Assessments list (metadata) */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b">Assessment</th>
              <th className="px-4 py-2 border-b">Type</th>
              <th className="px-4 py-2 border-b text-right">Weight</th>
              <th className="px-4 py-2 border-b text-right">Max Marks</th>
              <th className="px-4 py-2 border-b">Due</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b font-medium">{a.title}</td>
                <td className="px-4 py-2 border-b">{a.type}</td>
                <td className="px-4 py-2 border-b text-right">{a.weight}%</td>
                <td className="px-4 py-2 border-b text-right">{a.max_marks}</td>
                <td className="px-4 py-2 border-b">
                  {a.due_date ? new Date(a.due_date).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
            {assessments.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={5}>
                  No assessments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        Note: Per-assessment scores are summarized in the totals above. If you’d like a
        per-assessment breakdown on this page, we can extend the API to include your
        scores for each assessment.
      </p>
    </div>
  );
}
