import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCourse } from "../services/courseService";

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getCourse(id)
      .then(setCourse)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (!course) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
      <p className="mb-2 text-gray-700">Code: {course.code}</p>
      <p className="mb-2">Credits: {course.credits}</p>
      <p className="text-gray-800">{course.description}</p>
    </div>
  );
}
