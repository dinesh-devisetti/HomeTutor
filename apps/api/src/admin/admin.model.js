// Cross-cutting platform-oversight queries — unlike every other module,
// this one deliberately reads across User/Booking/Review without regard
// to ownership, since every route it backs is admin-only.
export function createAdminModel(prisma) {
  return {
    // Lists every user, optionally filtered by role, with their
    // Parent/Tutor display name (and verification status for tutors)
    // joined in — a platform-wide roster, not scoped to any one user's own data.
    listUsers: ({ role } = {}) =>
      prisma.user.findMany({
        where: role ? { role } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          parent: { select: { fullName: true } },
          tutor: { select: { fullName: true, verificationStatus: true } },
        },
      }),

    // Lists bookings across every user, optionally filtered by status,
    // most recent first — the admin equivalent of GET /bookings/mine,
    // which only ever returns the caller's own bookings.
    listBookings: ({ status } = {}) =>
      prisma.booking.findMany({
        where: status ? { status } : undefined,
        orderBy: { startTime: "desc" },
        take: 100,
        include: {
          parent: { select: { fullName: true } },
          tutor: { select: { fullName: true } },
          student: { select: { fullName: true } },
        },
      }),

    // Lists every review platform-wide, most recent first.
    listReviews: () =>
      prisma.review.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          parent: { select: { fullName: true } },
          tutor: { select: { fullName: true } },
        },
      }),

    // Loads a review by id — the existence check before deleteReview.
    findReviewById: (id) => prisma.review.findUnique({ where: { id } }),

    // Hard-deletes a review — a moderation action, not something a review's
    // own author can do (there's no "delete my own review" route).
    deleteReview: (id) => prisma.review.delete({ where: { id } }),

    // Writes one audit trail entry — same convention as the verification
    // module: every moderation action gets a permanent record of who did
    // it and when.
    createAuditLog: (data) => prisma.auditLog.create({ data }),
  };
}
