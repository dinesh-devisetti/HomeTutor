import { prisma } from "../common/prisma.js";
import { createAdminModel } from "./admin.model.js";
import { createAdminService } from "./admin.service.js";
import { createAdminRoutes } from "./admin.routes.js";

// Builds the admin module end-to-end. No cross-module dependencies.
export function createAdminModule({ config }) {
  const model = createAdminModel(prisma);
  const service = createAdminService({ repository: model });
  const router = createAdminRoutes({ adminService: service, config });
  return { router, service };
}
