import { useEffect, useState } from "react";
import { getCourses, deleteCourse } from "../services/courseService";

export default function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCourses()
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await deleteCourse(id);
      setCourses(courses.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Courses</h1>
      {courses.length === 0 ? (
        <p>No courses available</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Code</th>
              <th className="border px-4 py-2">Title</th>
              <th className="border px-4 py-2">Credits</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td className="border px-4 py-2">{c.code}</td>
                <td className="border px-4 py-2">{c.title}</td>
                <td className="border px-4 py-2">{c.credits}</td>
                <td className="border px-4 py-2">
                  <a
                    href={`/courses/${c.id}`}
                    className="text-blue-600 hover:underline mr-2"
                  >
                    View
                  </a>
                  <a
                    href={`/admin/courses/${c.id}/edit`}
                    className="text-green-600 hover:underline mr-2"
                  >
                    Edit
                  </a>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-4">
        <a
          href="/admin/courses/new"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Course
        </a>
      </div>
    </div>
  );
}
