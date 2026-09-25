import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, Label, Select } from "@hometutoring/ui";
import { BookingStatusBadge } from "../../components/booking-status-badge.jsx";
import { api } from "../../lib/api.js";
import { useQuery } from "../../lib/use-query.js";

const STATUSES = [
  "REQUESTED",
  "ACCEPTED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "DECLINED",
  "CANCELLED",
  "NO_SHOW",
  "REFUNDED",
];

// Platform-wide booking list, optionally filtered by status — an admin
// finds a booking here, then acts on it via the existing booking detail
// page (its BookingActions already allows ADMIN regardless of ownership).
export function AdminBookings() {
  const [status, setStatus] = useState("");
  const {
    data: bookings,
    loading,
    error,
  } = useQuery(() => api.admin.listBookings(status ? { status } : {}), [status]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">All Bookings</h1>
      <div className="max-w-xs">
        <Label htmlFor="statusFilter">Filter by status</Label>
        <Select id="statusFilter" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      {loading && <p className="text-slate-500">Loading...</p>}
      {error && <p className="text-red-600">{error.message}</p>}

      <div className="space-y-3">
        {bookings?.map((b) => (
          <Link key={b.id} to={`/bookings/${b.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    {b.subject} · {b.parentName} → {b.tutorName} (for {b.studentName})
                  </p>
                  <p className="text-sm text-slate-500">{new Date(b.startTime).toLocaleString()}</p>
                </div>
                <BookingStatusBadge status={b.status} />
              </CardContent>
            </Card>
          </Link>
        ))}
        {bookings?.length === 0 && <p className="text-slate-500">No bookings found.</p>}
      </div>
    </div>
  );
}
