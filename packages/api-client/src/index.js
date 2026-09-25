export { createHttpClient } from "./http-client.js";

import { createAuthApi } from "./auth.js";
import { createUsersApi } from "./users.js";
import { createStudentsApi } from "./students.js";
import { createTutorsApi } from "./tutors.js";
import { createSearchApi } from "./search.js";
import { createBookingsApi } from "./bookings.js";
import { createMessagesApi } from "./messages.js";
import { createReviewsApi } from "./reviews.js";
import { createVerificationApi } from "./verification.js";
import { createAdminApi } from "./admin.js";

// Bundles every resource module onto one client instance, namespaced by
// resource — apps/web calls e.g. api.bookings.accept(id) rather than
// juggling separate imports per module.
export function createApiClient(client) {
  return {
    auth: createAuthApi(client),
    users: createUsersApi(client),
    students: createStudentsApi(client),
    tutors: createTutorsApi(client),
    search: createSearchApi(client),
    bookings: createBookingsApi(client),
    messages: createMessagesApi(client),
    reviews: createReviewsApi(client),
    verification: createVerificationApi(client),
    admin: createAdminApi(client),
  };
}
