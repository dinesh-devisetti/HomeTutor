import express from "express";
import { RejectTutorInput, AuditLogQuery } from "@hometutoring/types";
import { requireAuth } from "../common/auth-middleware.js";
import { requireRole } from "../common/role-middleware.js";
import { validateBody, validateQuery } from "../common/validate.js";
import { createVerificationController } from "./verification.controller.js";

// URL surface for the verification module — admin-only throughout.
export function createVerificationRoutes({ verificationService, config }) {
  const router = express.Router();
  const controller = createVerificationController({ verificationService });
  const auth = requireAuth({ secret: config.JWT_SECRET });
  const adminOnly = requireRole("ADMIN");

  router.get("/admin/verification/queue", auth, adminOnly, controller.getQueue);
  router.post("/admin/verification/:tutorId/approve", auth, adminOnly, controller.approve);
  router.post(
    "/admin/verification/:tutorId/reject",
    auth,
    adminOnly,
    validateBody(RejectTutorInput),
    controller.reject
  );
  router.get("/admin/verification/:tutorId/documents/:docId", auth, adminOnly, controller.readDocument);
  router.get("/admin/audit-log", auth, adminOnly, validateQuery(AuditLogQuery), controller.listAuditLog);

  return router;
}
