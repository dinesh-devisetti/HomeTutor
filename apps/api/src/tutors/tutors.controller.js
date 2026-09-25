// Tutors controllers: no path/middleware knowledge here, that lives in
// tutors.routes.js.
export function createTutorsController({ tutorsService }) {
  return {
    // First-time profile completion / later edits — same underlying
    // update either way, no behavioral difference.
    async updateProfile(req, res) {
      const profile = await tutorsService.updateProfile(req.user.id, req.body);
      res.status(200).json(profile);
    },

    // Adds a subject/grade/rate/mode the caller teaches — a tutor calls
    // this once per subject they want to offer, building up their
    // subjects list.
    async addSubject(req, res) {
      const subject = await tutorsService.addSubject(req.user.id, req.body);
      res.status(201).json(subject);
    },

    // Adds one weekly availability slot for the caller — bookings are
    // only meant to be placed within slots a tutor has declared (not yet
    // enforced at booking-creation time, just informational to parents
    // in Phase 1).
    async addAvailability(req, res) {
      const slot = await tutorsService.addAvailability(req.user.id, req.body);
      res.status(201).json(slot);
    },

    // Uploads a verification document (ID proof, education cert, etc) for
    // the caller — feeds the admin verification queue's review process.
    async addDocument(req, res) {
      const doc = await tutorsService.addDocument(req.user.id, req.body);
      res.status(201).json({ id: doc.id, docType: doc.docType, uploadedAt: doc.uploadedAt });
    },

    // The caller's own full profile (includes their own uploaded
    // documents, unlike the public shape) — for the onboarding page to
    // show current state on repeat visits.
    async getOwnProfile(req, res) {
      res.status(200).json(await tutorsService.getOwnProfile(req.user.id));
    },

    // Public tutor profile page — no auth required. Works for verified
    // and unverified tutors alike (verification only gates search
    // results, not direct-link profile views).
    async getPublicProfile(req, res) {
      const profile = await tutorsService.getPublicProfile(req.params.id);
      res.status(200).json(profile);
    },
  };
}
