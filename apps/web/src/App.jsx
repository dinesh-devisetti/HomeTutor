import { AuthProvider } from "./context/auth-context.jsx";
import { NavBar } from "./components/nav-bar.jsx";
import { AppRoutes } from "./routes.jsx";

// Top-level app shell: auth context wraps everything (so any page can
// call useAuth()), nav bar is always visible, routes.jsx decides what
// renders in the main content area.
export default function App() {
  return (
    <AuthProvider>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <AppRoutes />
      </main>
    </AuthProvider>
  );
}
