export function createReviewsModel(prisma) {
  return {
    // Loads just enough of a booking (status, parentId, tutorId, and the
    // parent's userId for the ownership check) to decide whether a review
    // is allowed on it.
    findBookingForReview: (bookingId) =>
      prisma.booking.findUnique({
        where: { id: bookingId },
        select: { id: true, status: true, parentId: true, tutorId: true, parent: { select: { userId: true } } },
      }),

    // Checks for an existing review on this booking — Review.bookingId is
    // also @unique at the DB level, so this is a friendlier pre-check, not
    // the only enforcement.
    findByBookingId: (bookingId) => prisma.review.findUnique({ where: { bookingId } }),

    // Inserts a new review.
    create: (data) => prisma.review.create({ data }),

    // Lists a tutor's reviews, most recent first, for their public profile.
    findByTutorId: (tutorId) =>
      prisma.review.findMany({
        where: { tutorId },
        orderBy: { createdAt: "desc" },
        include: { parent: { select: { fullName: true } } },
      }),
  };
}
