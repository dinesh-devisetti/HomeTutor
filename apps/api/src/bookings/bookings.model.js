export function createBookingsModel(prisma) {
  return {
    // Resolves the caller's own Parent record — needed to create a booking
    // (parentId comes from this, never from the request body) and to scope
    // "my bookings" reads.
    findParentByUserId: (userId) => prisma.parent.findUnique({ where: { userId } }),
    // Loads a student by id, for the "is this your own child" ownership
    // check when creating a booking.
    findStudentById: (id) => prisma.student.findUnique({ where: { id } }),
    // Loads a tutor by id, for the existence check when creating a booking.
    findTutorById: (id) => prisma.tutor.findUnique({ where: { id } }),
    // Resolves the caller's own Tutor record — needed to scope "my
    // bookings" reads and ownership checks for a tutor.
    findTutorByUserId: (userId) => prisma.tutor.findUnique({ where: { userId } }),

    // Finds the tutor's rate card entry for a given subject+mode, so the
    // server (never the client) can compute the booking's price.
    findMatchingSubject: (tutorId, subject, mode) =>
      prisma.tutorSubject.findFirst({
        where: { tutorId, subject: { equals: subject, mode: "insensitive" }, mode },
      }),

    // Inserts a new booking. May throw a Postgres exclusion-constraint
    // violation (bookings_no_overlap) if the tutor is already booked for an
    // overlapping time — the service layer catches and translates that.
    create: (data) => prisma.booking.create({ data }),

    // Loads a booking with just enough of its parent/tutor/student relations
    // to run ownership checks (parent.userId / tutor.userId) without pulling
    // back full nested records.
    findById: (id) =>
      prisma.booking.findUnique({
        where: { id },
        include: {
          parent: { select: { userId: true, fullName: true } },
          tutor: { select: { userId: true, fullName: true } },
          student: true,
        },
      }),

    // Lists a parent's own bookings, most recent session first.
    findMineAsParent: (parentId) => prisma.booking.findMany({ where: { parentId }, orderBy: { startTime: "desc" } }),
    // Lists a tutor's own bookings, most recent session first.
    findMineAsTutor: (tutorId) => prisma.booking.findMany({ where: { tutorId }, orderBy: { startTime: "desc" } }),

    // Guarded UPDATE (WHERE status = fromStatus) — the enforcement
    // mechanism for "no ad-hoc status writes": this is the only place in
    // the codebase that changes booking.status, and it double-checks the
    // precondition at the DB level (protects against races even though
    // the service layer already gate-checks via BookingStateMachine).
    updateStatus: async (id, fromStatus, toStatus, extra = {}) => {
      const result = await prisma.booking.updateMany({
        where: { id, status: fromStatus },
        data: { status: toStatus, ...extra },
      });
      if (result.count === 0) return null;
      return prisma.booking.findUnique({ where: { id } });
    },
  };
}
