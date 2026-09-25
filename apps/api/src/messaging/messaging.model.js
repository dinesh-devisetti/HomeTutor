export function createMessagingModel(prisma) {
  return {
    // Loads just enough of a booking (status + parent/tutor userIds) to
    // check whether the caller is a participant and whether messages
    // should be masked — not a full booking read.
    findBookingForAccess: (id) =>
      prisma.booking.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          parent: { select: { userId: true } },
          tutor: { select: { userId: true } },
        },
      }),

    // Inserts a new message on a booking's thread.
    create: (data) => prisma.message.create({ data }),

    // Loads a booking's full message thread, oldest first (chat order).
    findByBooking: (bookingId) =>
      prisma.message.findMany({ where: { bookingId }, orderBy: { createdAt: "asc" } }),
  };
}
