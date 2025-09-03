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

                {/* Courses */}
                <Route path="/courses" element={<CoursesList />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route
                  path="/admin/courses/new"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <CourseForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/courses/:id/edit"
                  element={
                    <ProtectedRoute roles={['admin']}>
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
                    <ProtectedRoute roles={['admin']}>
                      <StudentForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/students/:id/edit"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <StudentForm />
                    </ProtectedRoute>
                  }
                />

                {/* Enrollments */}
                <Route path="/enrollments" element={<EnrollmentsList />} />
                <Route
                  path="/enrollments/new"
                  element={
                    <ProtectedRoute roles={['admin', 'teacher']}>
                      <EnrollmentForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/enrollments/:id/edit"
                  element={
                    <ProtectedRoute roles={['admin', 'teacher']}>
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
                    <ProtectedRoute roles={['admin', 'teacher']}>
                      <AssessmentForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assessments/:id/edit"
                  element={
                    <ProtectedRoute roles={['admin', 'teacher']}>
                      <AssessmentForm />
                    </ProtectedRoute>
                  }
                />

                {/* Gradebook */}
                <Route
                  path="/gradebook"
                  element={
                    <ProtectedRoute roles={['admin', 'teacher']}>
                      <Gradebook />
                    </ProtectedRoute>
                  }
                />

                {/* Sessions */}
                <Route
                  path="/sessions"
                  element={
                    <ProtectedRoute roles={['admin', 'teacher']}>
                      <SessionsList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sessions/new"
                  element={
                    <ProtectedRoute roles={['admin', 'teacher']}>
                      <SessionForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sessions/:id/edit"
                  element={
                    <ProtectedRoute roles={['admin', 'teacher']}>
                      <SessionForm />
                    </ProtectedRoute>
                  }
                />

                {/* Attendance */}
                <Route
                  path="/sessions/:id/attendance"
                  element={
                    <ProtectedRoute roles={['admin', 'teacher']}>
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
