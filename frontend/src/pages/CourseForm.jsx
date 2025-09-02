import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createCourse, getCourse, updateCourse } from "../services/courseService";

export default function CourseForm() {
  const { id } = useParams(); // if editing
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: "",
    title: "",
    description: "",
    credits: 3,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      getCourse(id)
        .then((data) => {
          setForm(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updateCourse(id, form);
      } else {
        await createCourse(form);
      }
      navigate("/courses");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">
        {id ? "Edit Course" : "New Course"}
      </h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Code</label>
          <input
            type="text"
            name="code"
            value={form.code}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Credits</label>
          <input
            type="number"
            name="credits"
            value={form.credits}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            min="1"
            max="10"
          />
        </div>
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            rows="4"
          />
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {id ? "Update" : "Create"}
          </button>
          <Link
            to="/courses"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
