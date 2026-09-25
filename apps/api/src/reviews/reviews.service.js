import { badRequest, conflict, forbidden, notFound } from "../common/errors.js";

// Detects the Prisma "unique constraint violated" error for Review.bookingId
// — the DB-level backstop against the race where two requests both pass the
// pre-check findByBookingId() at the same time.
function isDuplicateReviewError(err) {
  return err?.code === "P2002";
}

export function createReviewsService({ repository }) {
  // Creates a review on a COMPLETED booking, restricted to that booking's
  // own parent, one review per booking (checked here, and backstopped by
  // the DB's unique constraint on Review.bookingId in case of a race).
  async function create(userId, bookingId, input) {
    const booking = await repository.findBookingForReview(bookingId);
    if (!booking) throw notFound("Booking not found");
    if (booking.parent.userId !== userId) throw forbidden("Not your booking");
    if (booking.status !== "COMPLETED") throw badRequest("Booking is not completed yet");

    const existing = await repository.findByBookingId(bookingId);
    if (existing) throw conflict("This booking already has a review");

    try {
      return await repository.create({
        bookingId,
        parentId: booking.parentId,
        tutorId: booking.tutorId,
        rating: input.rating,
        comment: input.comment,
      });
    } catch (err) {
      if (isDuplicateReviewError(err)) throw conflict("This booking already has a review");
      throw err;
    }
  }

  // Lists a tutor's reviews for their public profile, with the reviewing
  // parent's display name attached.
  async function listForTutor(tutorId) {
    const reviews = await repository.findByTutorId(tutorId);
    return reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      parentName: r.parent.fullName,
    }));
  }

  return { create, listForTutor };
}
