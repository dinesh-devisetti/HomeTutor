import express from "express";
import { TutorProfileInput, AddSubjectInput, AddAvailabilityInput, UploadDocumentInput } from "@hometutoring/types";
import { requireAuth } from "../common/auth-middleware.js";
import { requireRole } from "../common/role-middleware.js";
import { validateBody } from "../common/validate.js";
import { createTutorsController } from "./tutors.controller.js";

// URL surface for the tutors module. GET/nested /tutors/me routes are
// registered before GET /tutors/:id so "me" isn't swallowed as a literal
// :id value by the param route.
export function createTutorsRoutes({ tutorsService, config }) {
  const router = express.Router();
  const controller = createTutorsController({ tutorsService });
  const auth = requireAuth({ secret: config.JWT_SECRET });
  const tutorOnly = requireRole("TUTOR");

  router.post("/tutors/onboarding", auth, tutorOnly, validateBody(TutorProfileInput), controller.updateProfile);
  router.patch("/tutors/me", auth, tutorOnly, validateBody(TutorProfileInput), controller.updateProfile);
  router.post("/tutors/me/subjects", auth, tutorOnly, validateBody(AddSubjectInput), controller.addSubject);
  router.post(
    "/tutors/me/availability",
    auth,
    tutorOnly,
    validateBody(AddAvailabilityInput),
    controller.addAvailability
  );
  router.post("/tutors/me/documents", auth, tutorOnly, validateBody(UploadDocumentInput), controller.addDocument);
  router.get("/tutors/me", auth, tutorOnly, controller.getOwnProfile);
  router.get("/tutors/:id", controller.getPublicProfile);

  return router;
}
