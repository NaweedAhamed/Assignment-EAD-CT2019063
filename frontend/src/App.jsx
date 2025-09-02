import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

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

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />

        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <Routes>
              {/* Home */}
              <Route path="/" element={<CoursesList />} />

              {/* Courses */}
              <Route path="/courses" element={<CoursesList />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/admin/courses/new" element={<CourseForm />} />
              <Route path="/admin/courses/:id/edit" element={<CourseForm />} />

              {/* Students */}
              <Route path="/students" element={<StudentsList />} />
              <Route path="/students/:id" element={<StudentDetail />} />
              <Route path="/admin/students/new" element={<StudentForm />} />
              <Route path="/admin/students/:id/edit" element={<StudentForm />} />

              {/* Enrollments */}
              <Route path="/enrollments" element={<EnrollmentsList />} />
              <Route path="/enrollments/new" element={<EnrollmentForm />} />
              <Route path="/enrollments/:id/edit" element={<EnrollmentForm />} />

              {/* Per-Student Enrollments */}
              <Route
                path="/students/:studentId/enrollments"
                element={<StudentEnrollments />}
              />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
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
