import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const base =
    "px-3 py-2 rounded hover:bg-white/10 transition text-sm font-medium";
  const active = "bg-white/20 text-white";

  return (
    <nav className="bg-blue-600 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Brand */}
          <Link to="/" className="font-bold text-lg">
            Course Management
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink
              to="/courses"
              className={({ isActive }) =>
                `${base} ${isActive ? active : "text-white/90"}`
              }
            >
              Courses
            </NavLink>
            <NavLink
              to="/admin/courses/new"
              className={({ isActive }) =>
                `${base} ${isActive ? active : "text-white/90"}`
              }
            >
              + Add Course
            </NavLink>

            {/* Students */}
            <NavLink
              to="/students"
              className={({ isActive }) =>
                `${base} ${isActive ? active : "text-white/90"}`
              }
            >
              Students
            </NavLink>
            <NavLink
              to="/admin/students/new"
              className={({ isActive }) =>
                `${base} ${isActive ? active : "text-white/90"}`
              }
            >
              + Add Student
            </NavLink>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded p-2 hover:bg-white/10"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 5h14a1 1 0 100-2H3a1 1 0 100 2zm14 4H3a1 1 0 100 2h14a1 1 0 100-2zm0 6H3a1 1 0 100 2h14a1 1 0 100-2z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-3">
            <div className="flex flex-col gap-1">
              <NavLink
                to="/courses"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block ${base} ${isActive ? active : "text-white/90"}`
                }
              >
                Courses
              </NavLink>
              <NavLink
                to="/admin/courses/new"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block ${base} ${isActive ? active : "text-white/90"}`
                }
              >
                + Add Course
              </NavLink>

              <NavLink
                to="/students"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block ${base} ${isActive ? active : "text-white/90"}`
                }
              >
                Students
              </NavLink>
              <NavLink
                to="/admin/students/new"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block ${base} ${isActive ? active : "text-white/90"}`
                }
              >
                + Add Student
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
