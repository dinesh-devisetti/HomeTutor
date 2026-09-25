// Prisma access for the "own profile" module — deliberately tiny, since
// most user data actually lives on Parent/Tutor, not User itself.
export function createUsersModel(prisma) {
  return {
    // Loads a user plus their Parent/Tutor profile (whichever applies) in
    // one query, so the service can shape a single "me" response.
    findById: (id) =>
      prisma.user.findUnique({
        where: { id },
        include: { parent: true, tutor: true },
      }),
    // Updates the display name on a parent's profile (fullName actually
    // lives on Parent, not User).
    updateParentName: (userId, fullName) => prisma.parent.update({ where: { userId }, data: { fullName } }),
    // Same as above but for a tutor's profile.
    updateTutorName: (userId, fullName) => prisma.tutor.update({ where: { userId }, data: { fullName } }),
  };
}
