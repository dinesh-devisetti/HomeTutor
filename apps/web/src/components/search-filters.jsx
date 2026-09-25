import { Button, Card, CardContent, Input, Label, Select } from "@hometutoring/ui";

const MODES = ["ONLINE", "IN_HOME"];

// Search filter form — controlled by the parent page (Search.jsx), which
// owns the "draft" filter values and only re-queries when Search is clicked
// (not on every keystroke).
export function SearchFilters({ filters, onChange, onSubmit }) {
  return (
    <Card>
      <CardContent>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={filters.subject}
              onChange={(e) => onChange("subject", e.target.value)}
              placeholder="Mathematics"
            />
          </div>
          <div>
            <Label htmlFor="gradeLevel">Grade</Label>
            <Input
              id="gradeLevel"
              value={filters.gradeLevel}
              onChange={(e) => onChange("gradeLevel", e.target.value)}
              placeholder="10"
            />
          </div>
          <div>
            <Label htmlFor="mode">Mode</Label>
            <Select id="mode" value={filters.mode} onChange={(e) => onChange("mode", e.target.value)}>
              <option value="">Any</option>
              {MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode === "ONLINE" ? "Online" : "In-home"}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="maxPrice">Max ₹/hr</Label>
            <Input
              id="maxPrice"
              type="number"
              min="0"
              value={filters.maxPrice}
              onChange={(e) => onChange("maxPrice", e.target.value)}
              placeholder="1500"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Search
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
