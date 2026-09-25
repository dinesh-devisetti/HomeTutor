// Wraps the tutors module — onboarding/editing the caller's own profile,
// plus the public profile read.
export function createTutorsApi(client) {
  return {
    // The caller's own full profile (includes their own documents).
    getMe: () => client.get("/tutors/me"),
    // First-time profile completion (bio, travel radius, location).
    onboard: (input) => client.post("/tutors/onboarding", { body: input }),
    // Same operation as onboard, used for later edits.
    updateMe: (input) => client.patch("/tutors/me", { body: input }),
    // Adds one subject/grade/rate/mode the caller teaches.
    addSubject: (input) => client.post("/tutors/me/subjects", { body: input }),
    // Adds one weekly availability slot.
    addAvailability: (input) => client.post("/tutors/me/availability", { body: input }),
    // Uploads a verification document (base64-encoded — no multipart on
    // the API side, see tutors.service.js on the API).
    uploadDocument: (input) => client.post("/tutors/me/documents", { body: input }),
    // Public tutor profile lookup by id — no auth needed.
    getPublic: (id) => client.get(`/tutors/${id}`),
  };
}
