import { Link } from "react-router-dom";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@hometutoring/ui";

// Renders one tutor+subject search result (search returns one row per
// matching subject, not per tutor) — links through to the full public profile.
export function TutorCard({ result }) {
  return (
    <Link to={`/tutors/${result.tutorId}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle>{result.fullName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="line-clamp-2 text-sm text-slate-600">{result.bio}</p>
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">
              {result.subject} · Grade {result.gradeLevel}
            </Badge>
            <Badge tone="neutral">{result.mode === "ONLINE" ? "Online" : "In-home"}</Badge>
          </div>
          <p className="text-sm font-medium text-slate-900">₹{(result.ratePaisePerHour / 100).toFixed(0)}/hr</p>
        </CardContent>
      </Card>
    </Link>
  );
}
