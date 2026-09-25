import { prisma } from "../common/prisma.js";
import { createSearchModel } from "./search.model.js";
import { createSearchService } from "./search.service.js";
import { createSearchRoutes } from "./search.routes.js";

// Builds the search module end-to-end. No cross-module dependencies.
export function createSearchModule() {
  const model = createSearchModel(prisma);
  const service = createSearchService({ repository: model });
  const router = createSearchRoutes({ searchService: service });
  return { router, service };
}
