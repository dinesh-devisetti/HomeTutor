export function createVerificationModel(prisma) {
  return {
    // Tutors awaiting admin review — oldest first, so the queue behaves
    // like a FIFO for admins working through it.
    findQueue: () =>
      prisma.tutor.findMany({
        where: { verificationStatus: { in: ["UNVERIFIED", "PENDING"] } },
        include: { user: true, documents: true },
        orderBy: { createdAt: "asc" },
      }),

    // Loads a tutor by id for approve/reject (existence check).
    findTutorById: (id) => prisma.tutor.findUnique({ where: { id } }),

    // Loads one document scoped to a specific tutor — prevents a doc id
    // from one tutor being read under a different tutor's path.
    findDocument: (tutorId, docId) => prisma.verificationDoc.findFirst({ where: { id: docId, tutorId } }),

    // Flips a tutor's verificationStatus (VERIFIED or REJECTED).
    setVerificationStatus: (id, status) =>
      prisma.tutor.update({ where: { id }, data: { verificationStatus: status } }),

    // Writes one audit trail entry — called for every doc read and every
    // approve/reject action, per the "every read audit-logged" domain rule.
    createAuditLog: (data) => prisma.auditLog.create({ data }),

    // Lists recent audit entries (optionally filtered by targetType) with
    // the acting admin's info, for the admin audit-log page.
    listAuditLog: ({ targetType, limit = 50 } = {}) =>
      prisma.auditLog.findMany({
        where: targetType ? { targetType } : undefined,
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { actor: true },
      }),
  };
}
