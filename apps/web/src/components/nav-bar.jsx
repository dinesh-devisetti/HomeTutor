import { Link, useNavigate } from "react-router-dom";
import { Button } from "@hometutoring/ui";
import { useAuth } from "../context/auth-context.jsx";

// Top navigation, always visible — role-aware links, login/signup when
// logged out.
export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Logs out then sends the user back to the login page.
  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold text-slate-900">
          HomeTutoring
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-700">
          <Link to="/search">Search</Link>
          {user?.role === "PARENT" && <Link to="/bookings">My Bookings</Link>}
          {user?.role === "TUTOR" && (
            <>
              <Link to="/tutor/bookings">My Bookings</Link>
              <Link to="/tutor/onboarding">Edit Profile</Link>
              <Link to="/tutor/availability">Availability</Link>
            </>
          )}
          {user?.role === "ADMIN" && (
            <>
              <Link to="/admin/verification">Verification</Link>
              <Link to="/admin/users">Users</Link>
              <Link to="/admin/bookings">Bookings</Link>
              <Link to="/admin/reviews">Reviews</Link>
              <Link to="/admin/audit-log">Audit Log</Link>
            </>
          )}
          {user && <Link to="/profile">Profile</Link>}
          {user ? (
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
