import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/axios";
import Loader from "../components/Loader";

export default function StudentProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    index_no: "",
    full_name: "",
    email: "",
    program: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    api
      .get("/students/me/")
      .then((res) => {
        if (!mounted) return;
        setForm({
          index_no: res.data.index_no ?? "",
          full_name: res.data.full_name ?? "",
          email: res.data.email ?? "",
          program: res.data.program ?? "",
        });
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err?.response?.data?.detail || "Failed to load profile.";
        setError(msg);
      })
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setOk("");
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        program: form.program,
      };
      const res = await api.put("/students/me/", payload);
      setOk("Profile updated.");
      setForm((f) => ({
        ...f,
        index_no: res.data.index_no ?? f.index_no,
        full_name: res.data.full_name ?? f.full_name,
        email: res.data.email ?? f.email,
        program: res.data.program ?? f.program,
      }));
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        (data && typeof data === "object" && Object.values(data).flat().join(" ")) ||
        "Update failed.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader label="Loading your profile..." />;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}
      {ok && (
        <div className="mb-4 rounded border border-green-200 bg-green-50 text-green-700 px-3 py-2 text-sm">
          {ok}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Username</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2 bg-gray-100"
            value={user?.username || ""}
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Index No</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2 bg-gray-100"
            value={form.index_no}
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Program</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.program}
            onChange={(e) => setForm((f) => ({ ...f, program: e.target.value }))}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded bg-blue-600 text-white px-4 py-2 font-medium hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
