import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@hometutoring/ui";
import { api } from "../lib/api.js";
import { useQuery } from "../lib/use-query.js";
import { BookingStatusBadge } from "../components/booking-status-badge.jsx";
import { BookingActions } from "../components/booking-actions.jsx";

// Single booking's detail: core info, the state-transition action buttons
// valid for the current viewer, and links to its message thread / review.
export function BookingDetail() {
  const { id } = useParams();
  const { data: booking, loading, error, refetch } = useQuery(() => api.bookings.get(id), [id]);

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;
  if (!booking) return null;

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{booking.subject} booking</CardTitle>
        <BookingStatusBadge status={booking.status} />
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-600">
          {new Date(booking.startTime).toLocaleString()} – {new Date(booking.endTime).toLocaleTimeString()}
        </p>
        <p className="text-sm text-slate-600">Mode: {booking.mode === "ONLINE" ? "Online" : "In-home"}</p>
        <p className="text-sm text-slate-600">Price: ₹{(booking.pricePaise / 100).toFixed(0)}</p>
        {booking.cancelReason && <p className="text-sm text-slate-500">Reason: {booking.cancelReason}</p>}

        <BookingActions booking={booking} onChanged={refetch} />

        <div className="flex gap-4 border-t border-slate-100 pt-3 text-sm">
          <Link to={`/bookings/${id}/messages`} className="underline">
            Messages
          </Link>
          {booking.status === "COMPLETED" && (
            <Link to={`/bookings/${id}/review`} className="underline">
              Leave a review
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
