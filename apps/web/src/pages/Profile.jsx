import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@hometutoring/ui";
import { api } from "../lib/api.js";
import { useQuery } from "../lib/use-query.js";
import { useMutation } from "../lib/use-mutation.js";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Every logged-in role's own "who am I" page: name (editable), contact
// (email/phone, view-only — changing either is a bigger, separate concern
// involving re-verification, so it's not exposed here), and role. Tutors
// additionally see a read-only summary of their subjects, availability,
// and uploaded verification documents, pulled from the same GET /tutors/me
// the Onboarding/Availability pages already use — this page is a summary
// view, not a second copy of those pages' edit forms.
export function Profile() {
  const { data: me, loading, refetch } = useQuery(() => api.users.me(), []);
  const { data: tutorProfile } = useQuery(
    () => (me?.role === "TUTOR" ? api.tutors.getMe() : Promise.resolve(null)),
    [me?.role]
  );

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (!me) return null;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-bold text-slate-900">My Profile</h1>
      <IdentityCard me={me} onSaved={refetch} />
      {me.role === "TUTOR" && <TutorSummaryCard tutorProfile={tutorProfile} />}
    </div>
  );
}

// Name (editable via PATCH /users/me), contact, and role.
function IdentityCard({ me, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(me.fullName ?? "");
  const [error, setError] = useState(null);
  const save = useMutation((input) => api.users.updateMe(input));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await save.mutate({ fullName });
      setEditing(false);
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Identity</CardTitle>
        <Badge tone="info">{me.role}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={save.loading}>
                {save.loading ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditing(false);
                  setFullName(me.fullName ?? "");
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-900">{me.fullName ?? "(no name set)"}</p>
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Edit name
            </Button>
          </div>
        )}

        <div className="space-y-1 border-t border-slate-100 pt-3 text-sm text-slate-600">
          <p>Email: {me.email ?? "—"}</p>
          <p>Phone: {me.phone ?? "—"}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Read-only summary of a tutor's subjects, availability, and uploaded
// verification documents — editing any of this stays on the existing
// Onboarding (/tutor/onboarding) and Availability (/tutor/availability)
// pages, linked from here rather than duplicated.
function TutorSummaryCard({ tutorProfile }) {
  if (!tutorProfile) return null;

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Tutor details</CardTitle>
        <Badge tone={tutorProfile.verificationStatus === "VERIFIED" ? "success" : "warning"}>
          {tutorProfile.verificationStatus}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Subjects</h3>
          <div className="flex flex-wrap gap-2">
            {tutorProfile.subjects.map((s, i) => (
              <Badge key={i} tone="neutral">
                {s.subject} · Grade {s.gradeLevel} · ₹{(s.ratePaisePerHour / 100).toFixed(0)}/hr ·{" "}
                {s.mode === "ONLINE" ? "Online" : "In-home"}
              </Badge>
            ))}
            {tutorProfile.subjects.length === 0 && <p className="text-sm text-slate-500">None added yet.</p>}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Availability</h3>
          <div className="flex flex-wrap gap-2">
            {tutorProfile.availability.map((a, i) => (
              <Badge key={i} tone="neutral">
                {DAY_NAMES[a.dayOfWeek]} {a.startTime}–{a.endTime}
              </Badge>
            ))}
            {tutorProfile.availability.length === 0 && <p className="text-sm text-slate-500">None added yet.</p>}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Verification documents</h3>
          <ul className="space-y-1 text-sm text-slate-600">
            {tutorProfile.documents.map((d) => (
              <li key={d.id}>
                {d.docType} — uploaded {new Date(d.uploadedAt).toLocaleDateString()}
              </li>
            ))}
            {tutorProfile.documents.length === 0 && <li className="text-slate-500">None uploaded yet.</li>}
          </ul>
        </div>

        <div className="flex gap-4 border-t border-slate-100 pt-3 text-sm">
          <Link to="/tutor/onboarding" className="underline">
            Edit subjects / documents
          </Link>
          <Link to="/tutor/availability" className="underline">
            Edit availability
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
