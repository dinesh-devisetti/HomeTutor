import { Link, useParams } from "react-router-dom";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@hometutoring/ui";
import { api } from "../lib/api.js";
import { useQuery } from "../lib/use-query.js";
import { useAuth } from "../context/auth-context.jsx";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Public tutor profile: bio, subjects/rates, availability, reviews, and a
// "Request booking" CTA — login-gated for non-parents (server is still the
// real enforcement boundary; this is just UX).
export function TutorProfile() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: tutor, loading, error } = useQuery(() => api.tutors.getPublic(id), [id]);
  const { data: reviews } = useQuery(() => api.reviews.listForTutor(id), [id]);

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;
  if (!tutor) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{tutor.fullName}</CardTitle>
          <Badge tone={tutor.verificationStatus === "VERIFIED" ? "success" : "warning"} className="mt-1">
            {tutor.verificationStatus}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600">{tutor.bio}</p>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Subjects</h3>
            <div className="flex flex-wrap gap-2">
              {tutor.subjects.map((s, i) => (
                <Badge key={i} tone="info">
                  {s.subject} · Grade {s.gradeLevel} · ₹{(s.ratePaisePerHour / 100).toFixed(0)}/hr ·{" "}
                  {s.mode === "ONLINE" ? "Online" : "In-home"}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Availability</h3>
            <div className="flex flex-wrap gap-2">
              {tutor.availability.map((a, i) => (
                <Badge key={i} tone="neutral">
                  {DAY_NAMES[a.dayOfWeek]} {a.startTime}–{a.endTime}
                </Badge>
              ))}
            </div>
          </div>

          {user?.role === "PARENT" ? (
            <Link to={`/bookings/new?tutorId=${tutor.id}`}>
              <Button>Request booking</Button>
            </Link>
          ) : !user ? (
            <Link to="/login">
              <Button>Log in to book</Button>
            </Link>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reviews?.length === 0 && <p className="text-sm text-slate-500">No reviews yet.</p>}
          {reviews?.map((r) => (
            <div key={r.id} className="border-b border-slate-100 pb-2 last:border-0">
              <p className="text-sm font-medium text-slate-900">
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)} — {r.parentName}
              </p>
              {r.comment && <p className="text-sm text-slate-600">{r.comment}</p>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
