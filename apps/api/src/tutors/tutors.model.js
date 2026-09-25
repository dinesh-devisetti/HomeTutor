export function createTutorsModel(prisma) {
  return {
    // Resolves the caller's own Tutor record from their User id — the
    // basis for every "me" write in this module (onboarding, subjects,
    // availability, documents).
    findByUserId: (userId) => prisma.tutor.findUnique({ where: { userId } }),

    // Same lookup, but with subjects/availability/documents included — for
    // the caller's own "my profile" view (GET /tutors/me), which needs to
    // show its own uploaded documents too, unlike the public profile shape.
    findOwnProfile: (userId) =>
      prisma.tutor.findUnique({
        where: { userId },
        include: { subjects: true, availability: true, documents: true },
      }),

    // Loads a tutor's full public-facing profile (subjects + availability)
    // for the GET /tutors/:id page and for reuse right after a "me" update.
    findPublicProfile: (id) =>
      prisma.tutor.findUnique({
        where: { id },
        include: { subjects: true, availability: true },
      }),

    // Updates scalar Tutor fields (currently just bio). A tutor's home
    // location is a FUTURE FEATURE — nothing geographic is stored today.
    updateProfile: (id, data) => prisma.tutor.update({ where: { id }, data }),

    // Adds one subject/grade/rate/mode offering for a tutor.
    addSubject: (tutorId, data) => prisma.tutorSubject.create({ data: { ...data, tutorId } }),

    // Adds one weekly availability slot for a tutor.
    addAvailability: (tutorId, data) => prisma.availability.create({ data: { ...data, tutorId } }),

    // Records a verification document upload (the actual file bytes go to
    // StorageProvider; this just stores the metadata + storage key).
    addDocument: (tutorId, data) => prisma.verificationDoc.create({ data: { ...data, tutorId } }),
  };
}
