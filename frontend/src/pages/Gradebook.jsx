// frontend/src/pages/Gradebook.jsx
import { useEffect, useMemo, useState } from "react";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { listCourses, listEnrollments } from "../services/enrollmentService";
import { listAssessments, listGrades, createGrade, updateGrade } from "../services/gradeService";

export default function Gradebook() {
  // filters
  const [courseId, setCourseId] = useState("");
  const [semester, setSemester] = useState("");

  // meta
  const [courses, setCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  // data
  const [grades, setGrades] = useState([]); // raw grades
  const [changed, setChanged] = useState({}); // key: `${enrId}:${asmtId}` -> number

  // ui
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // load courses once
  useEffect(() => {
    listCourses().then(setCourses).catch((e) => console.error(e));
  }, []);

  const canLoad = courseId && semester;

  const loadGradebook = async () => {
    if (!canLoad) return;
    setLoading(true);
    setError("");
    setChanged({});
    try {
      // 1) Assessments (course + semester) – pull all pages if needed
      let allAssessments = [];
      let page = 1;
      const pageSize = 200;
      while (true) {
        const { results, count } = await listAssessments({ page, pageSize, courseId, semester, ordering: "id" });
        allAssessments = allAssessments.concat(results);
        if (results.length < pageSize || allAssessments.length >= count) break;
        page += 1;
      }
      setAssessments(allAssessments);

      // 2) Enrollments (course + semester) – pull all (we need every student)
      let allEnrollments = [];
      page = 1;
      while (true) {
        const { results, count } = await listEnrollments({ page, pageSize, courseId, studentId: "", search: "" });
        // listEnrollments doesn't support semester filter explicitly; if your backend does, pass it:
        // const { results, count } = await listEnrollments({ page, pageSize, courseId, semester });
        allEnrollments = allEnrollments.concat(results);
        if (results.length < pageSize || allEnrollments.length >= count) break;
        page += 1;
      }
      // Optional: filter enrollments by semester client-side if needed
      const filteredEnrollments = allEnrollments.filter((e) => String(e.semester) === String(semester));
      setEnrollments(filteredEnrollments);

      // 3) Grades (filtered by course + semester) – pull all
      let allGrades = [];
      page = 1;
      while (true) {
        const { results, count } = await listGrades({ page, pageSize, courseId, semester });
        allGrades = allGrades.concat(results);
        if (results.length < pageSize || allGrades.length >= count) break;
        page += 1;
      }
      setGrades(allGrades);
    } catch (e) {
      console.error(e);
      setError("Failed to load gradebook.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGradebook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, semester]);

  // Build quick lookups
  const gradeMap = useMemo(() => {
    const m = new Map();
    for (const g of grades) {
      const key = `${g.enrollment}:${g.assessment}`;
      m.set(key, g);
    }
    return m;
  }, [grades]);

  const weightMap = useMemo(() => {
    const m = new Map();
    assessments.forEach((a) => m.set(a.id, Number(a.weight)));
    return m;
  }, [assessments]);

  const maxMap = useMemo(() => {
    const m = new Map();
    assessments.forEach((a) => m.set(a.id, Number(a.max_marks)));
    return m;
  }, [assessments]);

  const calcTotal = (enrollmentId) => {
    let total = 0;
    for (const a of assessments) {
      const key = `${enrollmentId}:${a.id}`;
      const score = changed[key] !== undefined
        ? Number(changed[key] || 0)
        : (gradeMap.get(key)?.score ?? 0);
      const max = maxMap.get(a.id) || 0;
      const weight = weightMap.get(a.id) || 0;
      if (max > 0) {
        total += (Number(score) / max) * weight;
      }
    }
    return Number.isFinite(total) ? total : 0;
  };

  const onChangeScore = (enrollmentId, assessmentId, value) => {
    const key = `${enrollmentId}:${assessmentId}`;
    setChanged((prev) => ({ ...prev, [key]: value }));
  };

  const hasChanges = useMemo(() => Object.keys(changed).length > 0, [changed]);

  const saveAll = async () => {
    if (!hasChanges) return;
    setSaving(true);
    setError("");
    try {
      const ops = [];
      for (const [key, value] of Object.entries(changed)) {
        const [enrollmentId, assessmentId] = key.split(":");
        const existing = gradeMap.get(key);
        const payload = {
          enrollment: Number(enrollmentId),
          assessment: Number(assessmentId),
          score: value === "" ? 0 : Number(value),
        };
        if (existing?.id) {
          ops.push(updateGrade(existing.id, { score: payload.score }));
        } else {
          ops.push(createGrade(payload));
        }
      }
      await Promise.all(ops);
      await loadGradebook();
    } catch (e) {
      console.error(e);
      setError("Failed to save grades.");
    } finally {
      setSaving(false);
      setChanged({});
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gradebook</h1>
        <div className="flex gap-2">
          <button
            className="rounded border px-3 py-2 disabled:opacity-50"
            onClick={loadGradebook}
            disabled={!canLoad || loading}
          >
            Refresh
          </button>
          <button
            className="rounded px-4 py-2 bg-black text-white shadow hover:opacity-90 disabled:opacity-60"
            onClick={saveAll}
            disabled={!hasChanges || saving}
          >
            {saving ? "Saving…" : "Save All"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
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
        <EmptyState title="Pick course & semester" subtitle="Select both to load the gradebook." />
      ) : loading ? (
        <Loader />
      ) : error ? (
        <EmptyState title="Couldn’t load gradebook" subtitle={error} action={<button onClick={loadGradebook} className="border px-4 py-2 rounded">Retry</button>} />
      ) : enrollments.length === 0 ? (
        <EmptyState title="No enrollments" subtitle="No students enrolled for this course & semester." />
      ) : assessments.length === 0 ? (
        <EmptyState title="No assessments" subtitle="Create at least one assessment for this course & semester." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left">Student</th>
                {assessments.map((a) => (
                  <th key={a.id} className="px-4 py-3 text-left">
                    <div className="font-medium">{a.title}</div>
                    <div className="text-xs text-gray-500">
                      w{Number(a.weight)} • /{Number(a.max_marks)}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-left">Total %</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enr) => {
                const studentName = enr.student_name || enr.student?.full_name || `#${enr.student}`;
                return (
                  <tr key={enr.id} className="border-t">
                    <td className="px-4 py-2">{studentName}</td>

                    {assessments.map((a) => {
                      const key = `${enr.id}:${a.id}`;
                      const existing = gradeMap.get(key);
                      const value =
                        changed[key] !== undefined
                          ? changed[key]
                          : (existing?.score ?? "");
                      return (
                        <td key={key} className="px-4 py-2">
                          <input
                            type="number"
                            step="0.01"
                            className="w-24 rounded border px-2 py-1"
                            value={value}
                            onChange={(e) => onChangeScore(enr.id, a.id, e.target.value)}
                            placeholder="0"
                          />
                        </td>
                      );
                    })}

                    <td className="px-4 py-2 font-medium">
                      {calcTotal(enr.id).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
