import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth-context.jsx";

// Wraps a route element, redirecting to /login if not authenticated (or
// to "/" if the user's role isn't in the allowed `roles` list). The
// server is still the real enforcement boundary — every API call is
// independently guarded — this only improves UX by not showing a page
// that would just fail on every request.
export function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
