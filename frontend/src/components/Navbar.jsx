import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, accessToken, logout } = useAuth();

  const base =
    "px-3 py-2 rounded hover:bg-white/10 transition text-sm font-medium";
  const active = "bg-white/20 text-white";

  const isAuthed = !!accessToken;
  const role = user?.role;
  const isAdmin = role === "admin";
  const isTeacher = role === "teacher";
  const canManage = isAdmin || isTeacher;

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

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
            {/* Courses */}
            <NavLink
              to="/courses"
              className={({ isActive }) =>
                `${base} ${isActive ? active : "text-white/90"}`
              }
            >
              Courses
            </NavLink>

            {/* Admin-only */}
            {isAdmin && (
              <NavLink
                to="/admin/courses/new"
                className={({ isActive }) =>
                  `${base} ${isActive ? active : "text-white/90"}`
                }
              >
                + Add Course
              </NavLink>
            )}

            {/* Students (list visible to all); Add Student = admin */}
            <NavLink
              to="/students"
              className={({ isActive }) =>
                `${base} ${isActive ? active : "text-white/90"}`
              }
            >
              Students
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/admin/students/new"
                className={({ isActive }) =>
                  `${base} ${isActive ? active : "text-white/90"}`
                }
              >
                + Add Student
              </NavLink>
            )}

            {/* Enrollments */}
            {canManage && (
              <>
                <NavLink
                  to="/enrollments"
                  className={({ isActive }) =>
                    `${base} ${isActive ? active : "text-white/90"}`
                  }
                >
                  Enrollments
                </NavLink>
                <NavLink
                  to="/enrollments/new"
                  className={({ isActive }) =>
                    `${base} ${isActive ? active : "text-white/90"}`
                  }
                >
                  + Add Enrollment
                </NavLink>
              </>
            )}

            {/* Assessments & Gradebook */}
            {canManage && (
              <>
                <NavLink
                  to="/assessments"
                  className={({ isActive }) =>
                    `${base} ${isActive ? active : "text-white/90"}`
                  }
                >
                  Assessments
                </NavLink>
                <NavLink
                  to="/assessments/new"
                  className={({ isActive }) =>
                    `${base} ${isActive ? active : "text-white/90"}`
                  }
                >
                  + Add Assessment
                </NavLink>
                <NavLink
                  to="/gradebook"
                  className={({ isActive }) =>
                    `${base} ${isActive ? active : "text-white/90"}`
                  }
                >
                  Gradebook
                </NavLink>
              </>
            )}

            {/* Sessions */}
            {canManage && (
              <>
                <NavLink
                  to="/sessions"
                  className={({ isActive }) =>
                    `${base} ${isActive ? active : "text-white/90"}`
                  }
                >
                  Sessions
                </NavLink>
                <NavLink
                  to="/sessions/new"
                  className={({ isActive }) =>
                    `${base} ${isActive ? active : "text-white/90"}`
                  }
                >
                  + Add Session
                </NavLink>
              </>
            )}

            {/* Profile (when logged in) */}
            {isAuthed && (
              <NavLink
                to="/me"
                className={({ isActive }) =>
                  `${base} ${isActive ? active : "text-white/90"}`
                }
              >
                Profile
              </NavLink>
            )}

            {/* Auth actions */}
            {!isAuthed ? (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `${base} ${isActive ? active : "text-white/90"}`
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `${base} ${isActive ? active : "text-white/90"}`
                  }
                >
                  Register
                </NavLink>
              </>
            ) : (
              <div className="flex items-center gap-2 pl-2">
                <span className="text-white/90 text-sm">
                  {user?.first_name
                    ? `Hi, ${user.first_name}`
                    : `Hi, ${user?.username || "user"}`}
                  {role ? ` · ${role}` : ""}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded bg-white/20 hover:bg-white/30 text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded p-2 hover:bg-white/10"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
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
              {/* Courses */}
              <NavLink
                to="/courses"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block ${base} ${isActive ? active : "text-white/90"}`
                }
              >
                Courses
              </NavLink>
              {isAdmin && (
                <NavLink
                  to="/admin/courses/new"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block ${base} ${isActive ? active : "text-white/90"}`
                  }
                >
                  + Add Course
                </NavLink>
              )}

              {/* Students */}
              <NavLink
                to="/students"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block ${base} ${isActive ? active : "text-white/90"}`
                }
              >
                Students
              </NavLink>
              {isAdmin && (
                <NavLink
                  to="/admin/students/new"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block ${base} ${isActive ? active : "text-white/90"}`
                  }
                >
                  + Add Student
                </NavLink>
              )}

              {/* Enrollments */}
              {canManage && (
                <>
                  <NavLink
                    to="/enrollments"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block ${base} ${isActive ? active : "text-white/90"}`
                    }
                  >
                    Enrollments
                  </NavLink>
                  <NavLink
                    to="/enrollments/new"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block ${base} ${isActive ? active : "text-white/90"}`
                    }
                  >
                    + Add Enrollment
                  </NavLink>
                </>
              )}

              {/* Assessments & Gradebook */}
              {canManage && (
                <>
                  <NavLink
                    to="/assessments"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block ${base} ${isActive ? active : "text-white/90"}`
                    }
                  >
                    Assessments
                  </NavLink>
                  <NavLink
                    to="/assessments/new"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block ${base} ${isActive ? active : "text-white/90"}`
                    }
                  >
                    + Add Assessment
                  </NavLink>
                  <NavLink
                    to="/gradebook"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block ${base} ${isActive ? active : "text-white/90"}`
                    }
                  >
                    Gradebook
                  </NavLink>
                </>
              )}

              {/* Sessions */}
              {canManage && (
                <>
                  <NavLink
                    to="/sessions"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block ${base} ${isActive ? active : "text-white/90"}`
                    }
                  >
                    Sessions
                  </NavLink>
                  <NavLink
                    to="/sessions/new"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block ${base} ${isActive ? active : "text-white/90"}`
                    }
                  >
                    + Add Session
                  </NavLink>
                </>
              )}

              {/* Profile (when logged in) */}
              {isAuthed && (
                <NavLink
                  to="/me"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block ${base} ${isActive ? active : "text-white/90"}`
                  }
                >
                  Profile
                </NavLink>
              )}

              {/* Auth */}
              {!isAuthed ? (
                <>
                  <NavLink
                    to="/login"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block ${base} ${isActive ? active : "text-white/90"}`
                    }
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block ${base} ${isActive ? active : "text-white/90"}`
                    }
                  >
                    Register
                  </NavLink>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className={`block ${base} bg白/20 text-left`.replace("白", "white")} // keep tailwind class correct
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
