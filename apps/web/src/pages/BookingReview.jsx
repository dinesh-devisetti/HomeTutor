import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, CardTitle, Label, Select, Textarea } from "@hometutoring/ui";
import { api } from "../lib/api.js";
import { useMutation } from "../lib/use-mutation.js";

// Leave-a-review form — only reachable/linked-to from BookingDetail once a
// booking is COMPLETED; the server independently enforces that (and that
// the caller is that booking's own parent, and one review per booking).
export function BookingReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState(null);

  const createReview = useMutation((input) => api.reviews.create(id, input));

  // Submits the review and returns to the booking detail page.
  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    try {
      await createReview.mutate({ rating: Number(rating), comment: comment || undefined });
      navigate(`/bookings/${id}`);
    } catch (err) {
      setFormError(err.message);
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle>Leave a review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="rating">Rating</Label>
            <Select id="rating" value={rating} onChange={(e) => setRating(e.target.value)}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? "s" : ""}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <Button type="submit" disabled={createReview.loading} className="w-full">
            {createReview.loading ? "Submitting..." : "Submit review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
