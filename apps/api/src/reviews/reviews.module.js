import { prisma } from "../common/prisma.js";
import { createReviewsModel } from "./reviews.model.js";
import { createReviewsService } from "./reviews.service.js";
import { createReviewsRoutes } from "./reviews.routes.js";

// Builds the reviews module end-to-end. No cross-module dependencies.
export function createReviewsModule({ config }) {
  const model = createReviewsModel(prisma);
  const service = createReviewsService({ repository: model });
  const router = createReviewsRoutes({ reviewsService: service, config });
  return { router, service };
}
