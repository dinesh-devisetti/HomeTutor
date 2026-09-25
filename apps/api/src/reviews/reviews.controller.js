// Reviews controllers: no path/middleware knowledge here, that lives in
// reviews.routes.js.
export function createReviewsController({ reviewsService }) {
  return {
    // Leaves a rating+comment on a COMPLETED booking — restricted inside
    // the service to that specific booking's own parent, one review per
    // booking.
    async create(req, res) {
      const review = await reviewsService.create(req.user.id, req.params.bookingId, req.body);
      res.status(201).json(review);
    },

    // Public list of a tutor's reviews, for their profile page.
    async listForTutor(req, res) {
      res.status(200).json(await reviewsService.listForTutor(req.params.id));
    },
  };
}
