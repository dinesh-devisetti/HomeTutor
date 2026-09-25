import { prisma } from "../common/prisma.js";
import { createBookingsModel } from "./bookings.model.js";
import { createBookingsService } from "./bookings.service.js";
import { createBookingsRoutes } from "./bookings.routes.js";

// Builds the bookings module end-to-end. Self-contained: this basic build
// has no payments module to record earnings into and no notifications
// module to announce transitions, so the service takes no external
// collaborators beyond its own repository.
export function createBookingsModule({ config }) {
  const model = createBookingsModel(prisma);
  const service = createBookingsService({ repository: model });
  const router = createBookingsRoutes({ bookingsService: service, config });
  return { router, service };
}
