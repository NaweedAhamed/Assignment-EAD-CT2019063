import { useEffect, useMemo, useState } from "react";
import { listTeachers } from "../services/teacherService";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Table from "../components/Table";

export default function TeachersList() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    listTeachers({ search: q })
      .then((data) => setRows(data?.results || data || []))
      .catch((err) => setError(err?.response?.data?.detail || "Failed to load"))
      .finally(() => setLoading(false));
  }, [q]);

  const data = useMemo(
    () =>
      rows.map((t) => ({
        id: t.id,
        username: t.user?.username,
        name: [t.user?.first_name, t.user?.last_name].filter(Boolean).join(" ") || "—",
        email: t.user?.email || "—",
        department: t.department || "—",
      })),
    [rows]
  );

  if (loading) return <Loader />;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  if (!rows.length) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Teachers</h1>
        <div className="mb-4">
          <input
            className="border w-full md:w-80 rounded px-3 py-2"
            placeholder="Search by name, username, department…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <EmptyState title="No teachers found" subtitle="Try a different search." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Teachers</h1>
      </div>

      <div className="mb-4">
        <input
          className="border w-full md:w-80 rounded px-3 py-2"
          placeholder="Search by name, username, department…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Table
        columns={[
          { key: "username", header: "Username" },
          { key: "name", header: "Name" },
          { key: "email", header: "Email" },
          { key: "department", header: "Department" },
        ]}
        data={data}
      />
    </div>
  );
}
