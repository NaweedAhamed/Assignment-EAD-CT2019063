// frontend/src/pages/StudentAttendance.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Table from "../components/Table";
import { listStudents, listCourses } from "../services/enrollmentService";
import { listSessions, listAttendance } from "../services/attendanceService";

export default function StudentAttendance() {
  const { studentId: studentIdParam } = useParams();

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [studentId, setStudentId] = useState(studentIdParam || "");
  const [courseId, setCourseId] = useState("");
  const [semester, setSemester] = useState("");

  const [sessions, setSessions] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // load pickers
  useEffect(() => {
    listStudents().then(setStudents).catch(console.error);
    listCourses().then(setCourses).catch(console.error);
  }, []);

  const canLoad = studentId && courseId && semester;

  const load = async () => {
    if (!canLoad) return;
    setLoading(true);
    setError("");
    try {
      // sessions for course+semester
      let allSessions = [];
      let page = 1;
      const pageSize = 200;
      while (true) {
        const { results, count } = await listSessions({ page, pageSize, courseId, semester, ordering: "date,start_time" });
        allSessions = allSessions.concat(results);
        if (results.length < pageSize || allSessions.length >= count) break;
        page += 1;
      }
      setSessions(allSessions);

      // attendance for this student+course+semester
      let allAtt = [];
      page = 1;
      while (true) {
        const { results, count } = await listAttendance({ page, pageSize: 500, studentId, courseId, semester, ordering: "session" });
        allAtt = allAtt.concat(results);
        if (results.length < 500 || allAtt.length >= count) break;
        page += 1;
      }
      setAttendance(allAtt);
    } catch (e) {
      console.error(e);
      setError("Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, courseId, semester]);

  const statusMap = useMemo(() => {
    const m = new Map();
    for (const a of attendance) m.set(a.session, a.status);
    return m;
  }, [attendance]);

  const presentPct = useMemo(() => {
    if (sessions.length === 0) return 0;
    const present = sessions.filter((s) => statusMap.get(s.id) === "present").length;
    return ((present / sessions.length) * 100).toFixed(1);
  }, [sessions, statusMap]);

  const columns = [
    { key: "date", header: "Date" },
    { key: "start_time", header: "Start" },
    { key: "end_time", header: "End" },
    { key: "room", header: "Room" },
    {
      key: "status",
      header: "Status",
      render: (s) => statusMap.get(s.id) || "—",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Student Attendance</h1>

      {/* Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <select
          className="border w-full rounded px-3 py-2"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        >
          <option value="">Select student…</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name || s.name || `#${s.id}`}
            </option>
          ))}
        </select>

        <select
          className="border w-full rounded px-3 py-2"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        >
          <option value="">Select course…</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title || c.name}
            </option>
          ))}
        </select>

        <select
          className="border w-full rounded px-3 py-2"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="">Select semester…</option>
          {Array.from({ length: 8 }).map((_, i) => (
            <option key={i + 1} value={String(i + 1)}>
              Semester {i + 1}
            </option>
          ))}
        </select>
      </div>

      {!canLoad ? (
        <EmptyState title="Pick student, course & semester" subtitle="Select all three to view attendance." />
      ) : loading ? (
        <Loader />
      ) : error ? (
        <EmptyState title="Couldn’t load attendance" subtitle={error} action={<button onClick={load} className="border px-4 py-2 rounded">Retry</button>} />
      ) : sessions.length === 0 ? (
        <EmptyState title="No sessions found" subtitle="No sessions for this course & semester." />
      ) : (
        <>
          <div className="mb-3 text-sm text-gray-600">
            Present %: <span className="font-medium">{presentPct}%</span> ({sessions.length} sessions)
          </div>
          <Table columns={columns} data={sessions} />
        </>
      )}
    </div>
  );
}
