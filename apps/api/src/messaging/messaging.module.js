import { prisma } from "../common/prisma.js";
import { createMessagingModel } from "./messaging.model.js";
import { createMessagingService } from "./messaging.service.js";
import { createMessagingRoutes } from "./messaging.routes.js";

// Builds the messaging module end-to-end. No cross-module dependencies.
export function createMessagingModule({ config }) {
  const model = createMessagingModel(prisma);
  const service = createMessagingService({ repository: model });
  const router = createMessagingRoutes({ messagingService: service, config });
  return { router, service };
}
