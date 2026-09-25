import { prisma } from "../common/prisma.js";
import { createUsersModel } from "./users.model.js";
import { createUsersService } from "./users.service.js";
import { createUsersRoutes } from "./users.routes.js";

// Builds the users module end-to-end (model -> service -> routes). No
// cross-module dependencies, so nothing needs to be threaded in from
// app.js beyond config.
export function createUsersModule({ config }) {
  const model = createUsersModel(prisma);
  const service = createUsersService({ repository: model });
  const router = createUsersRoutes({ usersService: service, config });
  return { router, service };
}
