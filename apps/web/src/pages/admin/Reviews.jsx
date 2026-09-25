import { Button, Card, CardContent } from "@hometutoring/ui";
import { api } from "../../lib/api.js";
import { useQuery } from "../../lib/use-query.js";
import { useMutation } from "../../lib/use-mutation.js";

// Platform-wide review list, with moderation (hard delete, audit-logged
// server-side). Deletion asks for confirmation since it's destructive and
// irreversible.
export function AdminReviews() {
  const { data: reviews, loading, error, refetch } = useQuery(() => api.admin.listReviews(), []);
  const deleteReview = useMutation((id) => api.admin.deleteReview(id));

  // Deletes a review after a confirmation prompt, then refreshes the list.
  async function handleDelete(id) {
    if (!window.confirm("Delete this review? This can't be undone.")) return;
    await deleteReview.mutate(id);
    refetch();
  }

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Reviews</h1>
      {reviews?.length === 0 && <p className="text-slate-500">No reviews yet.</p>}
      <div className="space-y-3">
        {reviews?.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)} — {r.parentName} on {r.tutorName}
                </p>
                {r.comment && <p className="mt-1 text-sm text-slate-600">{r.comment}</p>}
                <p className="mt-1 text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              <Button variant="destructive" disabled={deleteReview.loading} onClick={() => handleDelete(r.id)}>
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
