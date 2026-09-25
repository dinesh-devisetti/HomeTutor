import { notFound } from "../common/errors.js";

// Shapes a Tutor row (with its subjects/availability included) into the
// public profile response — same shape whether the profile is verified or
// not (verification only gates search visibility, not direct profile views).
function shapePublicProfile(tutor) {
  return {
    id: tutor.id,
    fullName: tutor.fullName,
    bio: tutor.bio,
    verificationStatus: tutor.verificationStatus,
    subjects: tutor.subjects.map((s) => ({
      subject: s.subject,
      gradeLevel: s.gradeLevel,
      ratePaisePerHour: s.ratePaisePerHour,
      mode: s.mode,
    })),
    availability: tutor.availability.map((a) => ({
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
    })),
  };
}

export function createTutorsService({ repository, storageProvider }) {
  // Resolves the caller's own Tutor row; every "me" action in this module
  // goes through this first so it's always acting on the caller's own
  // profile, never one passed in as an id.
  async function getOwnTutor(userId) {
    const tutor = await repository.findByUserId(userId);
    if (!tutor) throw notFound("Tutor profile not found");
    return tutor;
  }

  // Public tutor profile lookup by id — no auth required, used both for
  // the public GET /tutors/:id page and internally to return the fresh
  // state after a "me" update.
  async function getPublicProfile(tutorId) {
    const tutor = await repository.findPublicProfile(tutorId);
    if (!tutor) throw notFound("Tutor not found");
    return shapePublicProfile(tutor);
  }

  // Updates the caller's own scalar profile fields (currently just bio).
  // Backs both POST /tutors/onboarding and PATCH /tutors/me — same
  // operation either way. Home location is a FUTURE FEATURE.
  async function updateProfile(userId, input) {
    const tutor = await getOwnTutor(userId);

    if (Object.keys(input).length > 0) {
      await repository.updateProfile(tutor.id, input);
    }

    return getPublicProfile(tutor.id);
  }

  // Adds one subject/grade/rate/mode offering to the caller's own profile.
  async function addSubject(userId, input) {
    const tutor = await getOwnTutor(userId);
    return repository.addSubject(tutor.id, input);
  }

  // Adds one weekly availability slot to the caller's own profile.
  async function addAvailability(userId, input) {
    const tutor = await getOwnTutor(userId);
    return repository.addAvailability(tutor.id, input);
  }

  // Uploads a verification document for the caller's own profile: decodes
  // the base64 payload (no multipart parser in this hand-rolled body-parser,
  // so uploads travel as base64 JSON), writes the bytes via StorageProvider,
  // and records the metadata. Stays UNVERIFIED until an admin approves it
  // (verification module) — uploading a doc doesn't change status by itself.
  async function addDocument(userId, input) {
    const tutor = await getOwnTutor(userId);
    const buffer = Buffer.from(input.contentBase64, "base64");
    const key = `tutors/${tutor.id}/${Date.now()}-${input.fileName}`;

    await storageProvider.upload(key, buffer, input.mimeType);
    return repository.addDocument(tutor.id, { docType: input.docType, storageKey: key });
  }

  // Returns the caller's own full profile (including uploaded documents,
  // unlike the public shape) — for the tutor onboarding page to render
  // current state on repeat visits, not just blank add-forms.
  async function getOwnProfile(userId) {
    const tutor = await repository.findOwnProfile(userId);
    if (!tutor) throw notFound("Tutor profile not found");
    return {
      ...shapePublicProfile(tutor),
      documents: tutor.documents.map((d) => ({ id: d.id, docType: d.docType, uploadedAt: d.uploadedAt })),
    };
  }

  return { getOwnTutor, getOwnProfile, getPublicProfile, updateProfile, addSubject, addAvailability, addDocument };
}
