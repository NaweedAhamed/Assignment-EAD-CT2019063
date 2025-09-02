import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createStudent, getStudent, updateStudent } from "../services/studentService";

export default function StudentForm() {
  const { id } = useParams(); // present when editing
  const navigate = useNavigate();

  const [form, setForm] = useState({
    index_no: "",
    full_name: "",
    email: "",
    program: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      getStudent(id)
        .then((data) => {
          setForm({
            index_no: data.index_no || "",
            full_name: data.full_name || "",
            email: data.email || "",
            program: data.program || "",
          });
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) await updateStudent(id, form);
      else await createStudent(form);
      navigate("/students");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">{id ? "Edit Student" : "New Student"}</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Index No</label>
          <input
            type="text"
            name="index_no"
            value={form.index_no}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Full Name</label>
          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Program</label>
          <input
            type="text"
            name="program"
            value={form.program}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            placeholder="e.g., BSc in IT"
          />
        </div>

        <div className="flex space-x-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {id ? "Update" : "Create"}
          </button>
          <Link to="/students" className="bg-gray-200 text-gray-700 px-4 py-2 rounded">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
