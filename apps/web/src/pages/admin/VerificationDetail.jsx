import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from "@hometutoring/ui";
import { api } from "../../lib/api.js";
import { useQuery } from "../../lib/use-query.js";
import { useMutation } from "../../lib/use-mutation.js";

// Admin's approve/reject view for one tutor. There's no single-tutor read
// endpoint in Phase 1 (only the queue list and per-document reads), so this
// page re-fetches the queue and picks out the matching entry — fine at
// this scale, and it means the page naturally shows "not found" once a
// tutor's been reviewed and drops out of the queue.
export function AdminVerificationDetail() {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const { data: queue, loading, error } = useQuery(() => api.verification.queue(), []);
  const tutor = queue?.find((t) => t.id === tutorId);

  const [reason, setReason] = useState("");
  const [docUrls, setDocUrls] = useState({});
  const approve = useMutation(() => api.verification.approve(tutorId));
  const reject = useMutation(() => api.verification.reject(tutorId, reason));
  const viewDoc = useMutation((docId) => api.verification.readDocument(tutorId, docId));

  // Approves the tutor and returns to the queue.
  async function handleApprove() {
    await approve.mutate();
    navigate("/admin/verification");
  }

  // Rejects the tutor with the entered reason and returns to the queue.
  async function handleReject() {
    if (!reason.trim()) return;
    await reject.mutate();
    navigate("/admin/verification");
  }

  // Resolves one document's read URL — every call here is audit-logged
  // server-side before the URL is returned.
  async function handleViewDoc(docId) {
    const result = await viewDoc.mutate(docId);
    setDocUrls((u) => ({ ...u, [docId]: result.readUrl }));
  }

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;
  if (!tutor) return <p className="text-slate-500">Tutor not found in queue (already reviewed?).</p>;

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>{tutor.fullName}</CardTitle>
        <Badge tone="warning" className="mt-1">
          {tutor.verificationStatus}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          {tutor.email}
          {tutor.phone && ` · ${tutor.phone}`}
        </p>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Documents</h3>
          <ul className="space-y-1 text-sm">
            {tutor.documents.map((d) => (
              <li key={d.id} className="flex items-center gap-2">
                <span>
                  {d.docType} — {new Date(d.uploadedAt).toLocaleDateString()}
                </span>
                <button type="button" onClick={() => handleViewDoc(d.id)} className="text-xs text-slate-500 underline">
                  {docUrls[d.id] ?? "View (audit-logged)"}
                </button>
              </li>
            ))}
            {tutor.documents.length === 0 && <li className="text-slate-500">No documents uploaded.</li>}
          </ul>
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-4">
          <Button onClick={handleApprove} disabled={approve.loading}>
            {approve.loading ? "Approving..." : "Approve"}
          </Button>
          <div className="flex gap-2">
            <Input
              placeholder="Rejection reason (required)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button variant="destructive" onClick={handleReject} disabled={reject.loading || !reason.trim()}>
              {reject.loading ? "Rejecting..." : "Reject"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
