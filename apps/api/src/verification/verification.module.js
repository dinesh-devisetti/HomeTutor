import { prisma } from "../common/prisma.js";
import { createVerificationModel } from "./verification.model.js";
import { createVerificationService } from "./verification.service.js";
import { createVerificationRoutes } from "./verification.routes.js";

// Builds the verification module end-to-end. Takes storageProvider
// (shared with tutors — same uploaded documents) as an explicit external
// dependency, rather than
// constructing its own copies.
export function createVerificationModule({ config, storageProvider }) {
  const model = createVerificationModel(prisma);
  const service = createVerificationService({ repository: model, storageProvider });
  const router = createVerificationRoutes({ verificationService: service, config });
  return { router, service };
}
