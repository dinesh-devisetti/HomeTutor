export function createStudentsModel(prisma) {
  return {
    // Resolves the caller's own Parent record from their User id — needed
    // to stamp guardianId on a new student and to check ownership on reads.
    findParentByUserId: (userId) => prisma.parent.findUnique({ where: { userId } }),
    // Inserts a new Student row (always guardian-linked — see service).
    create: (data) => prisma.student.create({ data }),
    // Loads a student by id for the ownership check in getById.
    findById: (id) => prisma.student.findUnique({ where: { id } }),
    // Lists every student under a given guardian — powers "my students"
    // for the booking-creation form (a parent needs to pick which child).
    findByGuardianId: (guardianId) => prisma.student.findMany({ where: { guardianId }, orderBy: { fullName: "asc" } }),
  };
}
