import { useState } from "react";
import { Badge, Card, CardContent, Label, Select } from "@hometutoring/ui";
import { api } from "../../lib/api.js";
import { useQuery } from "../../lib/use-query.js";

const ROLES = ["PARENT", "STUDENT", "TUTOR", "ADMIN"];

// Platform-wide user roster — every registered account, optionally
// filtered by role. Read-only (no edit/delete here — that's what the
// verification queue and review moderation are for, on their own pages).
export function AdminUsers() {
  const [role, setRole] = useState("");
  const {
    data: users,
    loading,
    error,
  } = useQuery(() => api.admin.listUsers(role ? { role } : {}), [role]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Users</h1>
      <div className="max-w-xs">
        <Label htmlFor="roleFilter">Filter by role</Label>
        <Select id="roleFilter" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </div>

      {loading && <p className="text-slate-500">Loading...</p>}
      {error && <p className="text-red-600">{error.message}</p>}

      <Card>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{u.fullName ?? "—"}</td>
                  <td className="py-2 pr-4">{u.email ?? u.phone ?? "—"}</td>
                  <td className="py-2 pr-4">
                    <Badge tone="neutral">{u.role}</Badge>
                  </td>
                  <td className="py-2 pr-4">
                    {u.verificationStatus && (
                      <Badge tone={u.verificationStatus === "VERIFIED" ? "success" : "warning"}>
                        {u.verificationStatus}
                      </Badge>
                    )}
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users?.length === 0 && <p className="text-slate-500">No users found.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
