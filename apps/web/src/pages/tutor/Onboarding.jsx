import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, Textarea } from "@hometutoring/ui";
import { api } from "../../lib/api.js";
import { useQuery } from "../../lib/use-query.js";
import { useMutation } from "../../lib/use-mutation.js";

const MODES = ["ONLINE", "IN_HOME"];

// Tutor's own profile page: bio, subjects taught, and verification
// document upload — same POST /tutors/onboarding /
// PATCH /tutors/me operation whether this is the first-time completion
// prompt or a later edit, so one page serves both.
export function TutorOnboarding() {
  const { data: profile, loading, refetch } = useQuery(() => api.tutors.getMe(), []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">My Tutor Profile</h1>
      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <>
          <ProfileForm profile={profile} onSaved={refetch} />
          <SubjectsSection profile={profile} onSaved={refetch} />
          <DocumentsSection profile={profile} onSaved={refetch} />
        </>
      )}
    </div>
  );
}

// Bio form. Travel radius and home location are a FUTURE FEATURE, landing
// with geographic search.
function ProfileForm({ profile, onSaved }) {
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [error, setError] = useState(null);
  const save = useMutation((input) => api.tutors.onboard(input));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await save.mutate({ bio: bio || undefined });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={save.loading}>
            {save.loading ? "Saving..." : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Subjects list + add-a-subject form.
function SubjectsSection({ profile, onSaved }) {
  const [subject, setSubject] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [rateRupees, setRateRupees] = useState("");
  const [mode, setMode] = useState("ONLINE");
  const [error, setError] = useState(null);
  const addSubject = useMutation((input) => api.tutors.addSubject(input));

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    try {
      await addSubject.mutate({ subject, gradeLevel, ratePaisePerHour: Number(rateRupees) * 100, mode });
      setSubject("");
      setGradeLevel("");
      setRateRupees("");
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subjects I teach</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {profile?.subjects?.map((s, i) => (
            <span key={i} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
              {s.subject} · Grade {s.gradeLevel} · ₹{(s.ratePaisePerHour / 100).toFixed(0)}/hr ·{" "}
              {s.mode === "ONLINE" ? "Online" : "In-home"}
            </span>
          ))}
          {profile?.subjects?.length === 0 && <p className="text-sm text-slate-500">No subjects added yet.</p>}
        </div>
        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <Label htmlFor="newSubject">Subject</Label>
            <Input id="newSubject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Mathematics" />
          </div>
          <div>
            <Label htmlFor="newGrade">Grade</Label>
            <Input id="newGrade" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} placeholder="10" />
          </div>
          <div>
            <Label htmlFor="newRate">Rate (₹/hr)</Label>
            <Input
              id="newRate"
              type="number"
              min="0"
              value={rateRupees}
              onChange={(e) => setRateRupees(e.target.value)}
              placeholder="800"
            />
          </div>
          <div>
            <Label htmlFor="newMode">Mode</Label>
            <Select id="newMode" value={mode} onChange={(e) => setMode(e.target.value)}>
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {m === "ONLINE" ? "Online" : "In-home"}
                </option>
              ))}
            </Select>
          </div>
          <div className="col-span-2 sm:col-span-4">
            {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={addSubject.loading}>
              {addSubject.loading ? "Adding..." : "Add subject"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Uploaded documents list + upload form — reads the chosen file as base64
// client-side, since the hand-rolled API body-parser is JSON-only (no
// multipart/form-data parser).
function DocumentsSection({ profile, onSaved }) {
  const [docType, setDocType] = useState("ID_PROOF");
  const [error, setError] = useState(null);
  const upload = useMutation((input) => api.tutors.uploadDocument(input));

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const contentBase64 = await fileToBase64(file);
      await upload.mutate({ docType, fileName: file.name, mimeType: file.type, contentBase64 });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      e.target.value = "";
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-1 text-sm text-slate-600">
          {profile?.documents?.map((d) => (
            <li key={d.id}>
              {d.docType} — uploaded {new Date(d.uploadedAt).toLocaleDateString()}
            </li>
          ))}
          {profile?.documents?.length === 0 && <li className="text-slate-500">No documents uploaded yet.</li>}
        </ul>
        <div className="flex items-end gap-4">
          <div>
            <Label htmlFor="docType">Document type</Label>
            <Select id="docType" value={docType} onChange={(e) => setDocType(e.target.value)}>
              <option value="ID_PROOF">ID proof</option>
              <option value="EDUCATION_CERT">Education certificate</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="docFile">Upload file</Label>
            <input id="docFile" type="file" onChange={handleFileChange} disabled={upload.loading} className="text-sm" />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </CardContent>
    </Card>
  );
}
