import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select } from "@hometutoring/ui";
import { api } from "../lib/api.js";
import { useQuery } from "../lib/use-query.js";
import { useMutation } from "../lib/use-mutation.js";

// Booking request form, reached from a tutor's profile via
// /bookings/new?tutorId=... — lets a parent pick which subject the tutor
// offers, which of their own children it's for (with an inline "add a
// child" fallback if they haven't added one yet), and a start/end time.
export function BookingNew() {
  const [searchParams] = useSearchParams();
  const tutorId = searchParams.get("tutorId");
  const navigate = useNavigate();

  const { data: tutor, loading: tutorLoading } = useQuery(() => api.tutors.getPublic(tutorId), [tutorId]);
  const { data: students, refetch: refetchStudents } = useQuery(() => api.students.mine(), []);

  const [subjectIndex, setSubjectIndex] = useState("0");
  const [studentId, setStudentId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ fullName: "", dateOfBirth: "", gradeLevel: "" });
  const [formError, setFormError] = useState(null);

  const createBooking = useMutation((input) => api.bookings.create(input));
  const addStudent = useMutation((input) => api.students.create(input));

  // Adds a new child under the logged-in parent, then refreshes the
  // student picker so it's immediately selectable.
  async function handleAddStudent() {
    await addStudent.mutate(newStudent);
    setShowAddStudent(false);
    setNewStudent({ fullName: "", dateOfBirth: "", gradeLevel: "" });
    refetchStudents();
  }

  // Validates the form client-side (the server re-validates everything
  // regardless), then creates the booking and lands on its detail page.
  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    const selectedSubject = tutor?.subjects?.[Number(subjectIndex)];
    if (!studentId) return setFormError("Select a student");
    if (!selectedSubject) return setFormError("Select a subject");
    if (!startTime || !endTime) return setFormError("Select a start and end time");

    try {
      const booking = await createBooking.mutate({
        studentId,
        tutorId,
        subject: selectedSubject.subject,
        mode: selectedSubject.mode,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      });
      navigate(`/bookings/${booking.id}`);
    } catch (err) {
      setFormError(err.message);
    }
  }

  if (tutorLoading || !tutor) return <p className="text-slate-500">Loading...</p>;

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Request a booking with {tutor.fullName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Select id="subject" value={subjectIndex} onChange={(e) => setSubjectIndex(e.target.value)}>
              {tutor.subjects.map((s, i) => (
                <option key={i} value={i}>
                  {s.subject} (Grade {s.gradeLevel}) — {s.mode === "ONLINE" ? "Online" : "In-home"} — ₹
                  {(s.ratePaisePerHour / 100).toFixed(0)}/hr
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="student">Student</Label>
            <Select id="student" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              <option value="">Select a student</option>
              {students?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} (Grade {s.gradeLevel})
                </option>
              ))}
            </Select>
            <button
              type="button"
              onClick={() => setShowAddStudent((v) => !v)}
              className="mt-1 text-xs text-slate-500 underline"
            >
              {showAddStudent ? "Cancel" : "+ Add a child"}
            </button>
          </div>

          {showAddStudent && (
            <div className="space-y-2 rounded-md border border-slate-200 p-3">
              <div>
                <Label htmlFor="childName">Full name</Label>
                <Input
                  id="childName"
                  value={newStudent.fullName}
                  onChange={(e) => setNewStudent((s) => ({ ...s, fullName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="childDob">Date of birth</Label>
                <Input
                  id="childDob"
                  type="date"
                  value={newStudent.dateOfBirth}
                  onChange={(e) => setNewStudent((s) => ({ ...s, dateOfBirth: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="childGrade">Grade</Label>
                <Input
                  id="childGrade"
                  value={newStudent.gradeLevel}
                  onChange={(e) => setNewStudent((s) => ({ ...s, gradeLevel: e.target.value }))}
                />
              </div>
              <Button type="button" variant="secondary" disabled={addStudent.loading} onClick={handleAddStudent}>
                {addStudent.loading ? "Adding..." : "Add child"}
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End</Label>
              <Input id="endTime" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <Button type="submit" disabled={createBooking.loading} className="w-full">
            {createBooking.loading ? "Requesting..." : "Request booking"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
