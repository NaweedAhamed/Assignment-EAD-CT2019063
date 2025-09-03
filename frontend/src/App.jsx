import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Auth
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Courses
import CoursesList from "./pages/CoursesList";
import CourseDetail from "./pages/CourseDetail";
import CourseForm from "./pages/CourseForm";

// Students
import StudentsList from "./pages/StudentsList";
import StudentDetail from "./pages/StudentDetail";
import StudentForm from "./pages/StudentForm";
import StudentProfile from "./pages/StudentProfile";

// Teachers
import TeachersList from "./pages/TeachersList";

// Enrollments
import EnrollmentsList from "./pages/EnrollmentsList";
import EnrollmentForm from "./pages/EnrollmentForm";
import StudentEnrollments from "./pages/StudentEnrollments";

// Assessments & Grades
import AssessmentsList from "./pages/AssessmentsList";
import AssessmentForm from "./pages/AssessmentForm";
import Gradebook from "./pages/Gradebook";

// Sessions & Attendance
import SessionsList from "./pages/SessionsList";
import SessionForm from "./pages/SessionForm";
import AttendanceBoard from "./pages/AttendanceBoard";
import StudentAttendance from "./pages/StudentAttendance"; // optional per-student view

// Part 6
import MyCourses from "./pages/MyCourses";
import CourseRoster from "./pages/CourseRoster";

// Part 7 (results pages)
import Results from "./pages/Results";
import CourseResult from "./pages/CourseResult";

// Part 8 (dashboards) — flat pages/
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Router>
      {/* AuthProvider must be inside Router because it uses useNavigate */}
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />

          <main className="flex-1">
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Routes>
                {/* Home */}
                <Route path="/" element={<CoursesList />} />

                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Profile (student self) */}
                <Route
                  path="/me"
                  element={
                    <ProtectedRoute>
                      <StudentProfile />
                    </ProtectedRoute>
                  }
                />

                {/* Teachers (admin) */}
                <Route
                  path="/teachers"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <TeachersList />
                    </ProtectedRoute>
                  }
                />

                {/* Courses */}
                <Route path="/courses" element={<CoursesList />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route
                  path="/admin/courses/new"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <CourseForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/courses/:id/edit"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <CourseForm />
                    </ProtectedRoute>
                  }
                />

                {/* Students */}
                <Route path="/students" element={<StudentsList />} />
                <Route path="/students/:id" element={<StudentDetail />} />
                <Route
                  path="/admin/students/new"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <StudentForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/students/:id/edit"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <StudentForm />
                    </ProtectedRoute>
                  }
                />

                {/* Enrollments */}
                <Route path="/enrollments" element={<EnrollmentsList />} />
                <Route
                  path="/enrollments/new"
                  element={
                    <ProtectedRoute roles={["admin", "teacher"]}>
                      <EnrollmentForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/enrollments/:id/edit"
                  element={
                    <ProtectedRoute roles={["admin", "teacher"]}>
                      <EnrollmentForm />
                    </ProtectedRoute>
                  }
                />

                {/* Per-Student Enrollments */}
                <Route
                  path="/students/:studentId/enrollments"
                  element={<StudentEnrollments />}
                />

                {/* Assessments */}
                <Route path="/assessments" element={<AssessmentsList />} />
                <Route
                  path="/assessments/new"
                  element={
                    <ProtectedRoute roles={["admin", "teacher"]}>
                      <AssessmentForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assessments/:id/edit"
                  element={
                    <ProtectedRoute roles={["admin", "teacher"]}>
                      <AssessmentForm />
                    </ProtectedRoute>
                  }
                />

                {/* Gradebook */}
                <Route
                  path="/gradebook"
                  element={
                    <ProtectedRoute roles={["admin", "teacher"]}>
                      <Gradebook />
                    </ProtectedRoute>
                  }
                />

                {/* Sessions */}
                <Route
                  path="/sessions"
                  element={
                    <ProtectedRoute roles={["admin", "teacher"]}>
                      <SessionsList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sessions/new"
                  element={
                    <ProtectedRoute roles={["admin", "teacher"]}>
                      <SessionForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sessions/:id/edit"
                  element={
                    <ProtectedRoute roles={["admin", "teacher"]}>
                      <SessionForm />
                    </ProtectedRoute>
                  }
                />

                {/* Attendance */}
                <Route
                  path="/sessions/:id/attendance"
                  element={
                    <ProtectedRoute roles={["admin", "teacher"]}>
                      <AttendanceBoard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/students/:studentId/attendance"
                  element={
                    <ProtectedRoute>
                      <StudentAttendance />
                    </ProtectedRoute>
                  }
                />

                {/* Part 6 */}
                <Route
                  path="/student/my-courses"
                  element={
                    <ProtectedRoute>
                      <MyCourses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/instructor/courses/:id/roster"
                  element={
                    <ProtectedRoute roles={["admin", "teacher"]}>
                      <CourseRoster />
                    </ProtectedRoute>
                  }
                />

                {/* Part 7 (Results) */}
                <Route
                  path="/student/results"
                  element={
                    <ProtectedRoute>
                      <Results />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/courses/:courseId/results"
                  element={
                    <ProtectedRoute>
                      <CourseResult />
                    </ProtectedRoute>
                  }
                />

                {/* Part 8 (Dashboards) */}
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

function NotFound() {
  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-gray-700">The page you’re looking for doesn’t exist.</p>
    </div>
  );
}

export default App;
