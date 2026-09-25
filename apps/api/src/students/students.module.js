import { prisma } from "../common/prisma.js";
import { createStudentsModel } from "./students.model.js";
import { createStudentsService } from "./students.service.js";
import { createStudentsRoutes } from "./students.routes.js";

// Builds the students module end-to-end. No cross-module dependencies.
export function createStudentsModule({ config }) {
  const model = createStudentsModel(prisma);
  const service = createStudentsService({ repository: model });
  const router = createStudentsRoutes({ studentsService: service, config });
  return { router, service };
}
