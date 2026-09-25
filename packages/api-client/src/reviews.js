// Wraps the reviews module.
export function createReviewsApi(client) {
  return {
    // Leaves a rating+comment on a COMPLETED booking (parent-only,
    // enforced server-side).
    create: (bookingId, input) => client.post(`/bookings/${bookingId}/review`, { body: input }),
    // Public list of a tutor's reviews.
    listForTutor: (tutorId) => client.get(`/tutors/${tutorId}/reviews`),
  };
}
