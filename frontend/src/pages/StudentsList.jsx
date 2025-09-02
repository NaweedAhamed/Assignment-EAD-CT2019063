import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStudents, deleteStudent } from "../services/studentService";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Table from "../components/Table";

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudents()
      .then((data) => {
        setStudents(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = students.filter((s) => {
    const t = `${s.index_no} ${s.full_name} ${s.email} ${s.program}`.toLowerCase();
    return t.includes(q.toLowerCase());
  });

  if (loading) return <Loader />;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  if (students.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Students</h1>
        <EmptyState
          title="No students yet"
          subtitle="Start by adding your first student."
          action={
            <Link to="/admin/students/new" className="bg-blue-600 text-white px-4 py-2 rounded">
              + Add Student
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Students</h1>
        <Link to="/admin/students/new" className="bg-blue-600 text-white px-4 py-2 rounded">
          + Add Student
        </Link>
      </div>

      <div className="mb-4">
        <input
          className="border w-full md:w-80 rounded px-3 py-2"
          placeholder="Search by name, index, email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Table
        columns={[
          { key: "index_no", header: "Index No" },
          { key: "full_name", header: "Full Name" },
          { key: "email", header: "Email" },
          { key: "program", header: "Program" },
        ]}
        data={filtered}
        actions={(row) => (
          <div className="space-x-3">
            <Link to={`/students/${row.id}`} className="text-blue-600 hover:underline">
              View
            </Link>
            <Link to={`/admin/students/${row.id}/edit`} className="text-green-600 hover:underline">
              Edit
            </Link>
            <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:underline">
              Delete
            </button>
          </div>
        )}
      />
    </div>
  );
}
