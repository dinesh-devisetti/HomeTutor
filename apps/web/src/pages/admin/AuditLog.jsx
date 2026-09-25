import { Card, CardContent } from "@hometutoring/ui";
import { api } from "../../lib/api.js";
import { useQuery } from "../../lib/use-query.js";

// Read-only audit trail — every verification-doc read and every
// approve/reject action shows up here with who did it and when, making
// the audit log actually inspectable, not just silently written.
export function AdminAuditLog() {
  const { data: entries, loading, error } = useQuery(() => api.verification.auditLog({}), []);

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Audit Log</h1>
      <Card>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-4">When</th>
                <th className="py-2 pr-4">Action</th>
                <th className="py-2 pr-4">Target</th>
                <th className="py-2 pr-4">Actor</th>
              </tr>
            </thead>
            <tbody>
              {entries?.map((e) => (
                <tr key={e.id} className="border-b border-slate-100">
                  <td className="whitespace-nowrap py-2 pr-4">{new Date(e.createdAt).toLocaleString()}</td>
                  <td className="py-2 pr-4">{e.action}</td>
                  <td className="py-2 pr-4">
                    {e.targetType} #{e.targetId.slice(0, 8)}
                  </td>
                  <td className="py-2 pr-4">{e.actor.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {entries?.length === 0 && <p className="text-slate-500">No audit entries yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
