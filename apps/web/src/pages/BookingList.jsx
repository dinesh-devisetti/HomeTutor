import { Link } from "react-router-dom";
import { Card, CardContent } from "@hometutoring/ui";
import { api } from "../lib/api.js";
import { useQuery } from "../lib/use-query.js";
import { BookingStatusBadge } from "../components/booking-status-badge.jsx";

// "My bookings" list — same component mounted at both /bookings (parent)
// and /tutor/bookings (tutor), since GET /bookings/mine is already
// role-aware server-side and returns the right list either way.
export function BookingList() {
  const { data: bookings, loading, error } = useQuery(() => api.bookings.mine(), []);

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">My Bookings</h1>
      {bookings?.length === 0 && <p className="text-slate-500">No bookings yet.</p>}
      <div className="space-y-3">
        {bookings?.map((b) => (
          <Link key={b.id} to={`/bookings/${b.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    {b.subject} · {b.mode === "ONLINE" ? "Online" : "In-home"}
                  </p>
                  <p className="text-sm text-slate-500">{new Date(b.startTime).toLocaleString()}</p>
                </div>
                <BookingStatusBadge status={b.status} />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
