import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import CoursesList from "./pages/CoursesList";
import CourseDetail from "./pages/CourseDetail";
import CourseForm from "./pages/CourseForm";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />

        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <Routes>
              <Route path="/" element={<CoursesList />} />
              <Route path="/courses" element={<CoursesList />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/admin/courses/new" element={<CourseForm />} />
              <Route path="/admin/courses/:id/edit" element={<CourseForm />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
