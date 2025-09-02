import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getStudent } from "../services/studentService";
import Loader from "../components/Loader";

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudent(id)
      .then(setStudent)
      .catch((err) => setError(err.message || "Failed to load student"));
  }, [id]);

  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (!student) return <Loader label="Loading student..." />;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-2">{student.full_name}</h1>
      <p className="text-gray-700 mb-1">Index No: {student.index_no}</p>
      <p className="text-gray-700 mb-1">Email: {student.email}</p>
      <p className="text-gray-700">Program: {student.program || "—"}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/students"
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          Back
        </Link>

        <Link
          to={`/admin/students/${student.id}/edit`}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Edit
        </Link>

        {/* NEW: View Enrollments */}
        <Link
          to={`/students/${student.id}/enrollments`}
          className="bg-black text-white px-4 py-2 rounded shadow hover:opacity-90"
          aria-label="View this student's enrollments"
        >
          View Enrollments
        </Link>
      </div>
    </div>
  );
}
