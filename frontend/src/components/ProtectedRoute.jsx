// frontend/src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Usage:
 * <ProtectedRoute> <SomePrivatePage /> </ProtectedRoute>
 * <ProtectedRoute roles={['admin','teacher']}><AdminPage/></ProtectedRoute>
 */
export default function ProtectedRoute({ roles, children }) {
  const { accessToken, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // or a spinner

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && roles.length > 0) {
    const role = user?.role;
    if (!role || !roles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
