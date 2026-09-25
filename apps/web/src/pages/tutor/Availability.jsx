import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select } from "@hometutoring/ui";
import { api } from "../../lib/api.js";
import { useQuery } from "../../lib/use-query.js";
import { useMutation } from "../../lib/use-mutation.js";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Manages a tutor's weekly availability slots — list + add form. Phase 1
// only supports recurring weekly slots (no date-specific overrides yet).
export function TutorAvailability() {
  const { data: profile, loading, refetch } = useQuery(() => api.tutors.getMe(), []);
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [error, setError] = useState(null);
  const addSlot = useMutation((input) => api.tutors.addAvailability(input));

  // Adds a new weekly slot and refetches the list.
  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    try {
      await addSlot.mutate({ dayOfWeek: Number(dayOfWeek), startTime, endTime });
      refetch();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">My Availability</h1>
      <Card>
        <CardHeader>
          <CardTitle>Weekly slots</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : (
            <ul className="space-y-1 text-sm text-slate-700">
              {profile?.availability?.map((a, i) => (
                <li key={i}>
                  {DAY_NAMES[a.dayOfWeek]}: {a.startTime}–{a.endTime}
                </li>
              ))}
              {profile?.availability?.length === 0 && <li className="text-slate-500">No availability set yet.</li>}
            </ul>
          )}

          <form onSubmit={handleAdd} className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dayOfWeek">Day</Label>
              <Select id="dayOfWeek" value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
                {DAY_NAMES.map((d, i) => (
                  <option key={i} value={i}>
                    {d}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="startTime">Start</Label>
              <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="endTime">End</Label>
              <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
            <div className="col-span-3">
              {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={addSlot.loading}>
                {addSlot.loading ? "Adding..." : "Add slot"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
