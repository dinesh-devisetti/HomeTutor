import { Link } from "react-router-dom";
import { Badge, Card, CardContent } from "@hometutoring/ui";
import { api } from "../../lib/api.js";
import { useQuery } from "../../lib/use-query.js";

// Admin's work queue — every tutor still UNVERIFIED or PENDING, each
// linking through to the approve/reject detail view.
export function AdminVerificationQueue() {
  const { data: queue, loading, error } = useQuery(() => api.verification.queue(), []);

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Verification Queue</h1>
      {queue?.length === 0 && <p className="text-slate-500">Nothing pending.</p>}
      <div className="space-y-3">
        {queue?.map((t) => (
          <Link key={t.id} to={`/admin/verification/${t.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{t.fullName}</p>
                  <p className="text-sm text-slate-500">{t.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="neutral">
                    {t.documents.length} doc{t.documents.length !== 1 ? "s" : ""}
                  </Badge>
                  <Badge tone="warning">{t.verificationStatus}</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
