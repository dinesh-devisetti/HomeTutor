import { Link } from "react-router-dom";
import { Button } from "@hometutoring/ui";
import { useAuth } from "../context/auth-context.jsx";

// Landing page — logged-out visitors see a pitch + search CTA; a signup
// nudge only shows if nobody's logged in.
export function Home() {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Find a tutor for your child</h1>
      <p className="text-slate-600">Verified tutors for in-home and online sessions.</p>
      <Link to="/search">
        <Button>Search tutors</Button>
      </Link>
      {!user && (
        <p className="text-sm text-slate-500">
          New here?{" "}
          <Link to="/signup" className="underline">
            Create an account
          </Link>
          .
        </p>
      )}
    </div>
  );
}
