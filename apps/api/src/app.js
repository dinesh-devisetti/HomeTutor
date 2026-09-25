import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { AppError } from "./common/errors.js";

import { createAuthModule } from "./auth/auth.module.js";
import { createUsersModule } from "./users/users.module.js";
import { createStudentsModule } from "./students/students.module.js";
import { createTutorsModule } from "./tutors/tutors.module.js";
import { createVerificationModule } from "./verification/verification.module.js";
import { createSearchModule } from "./search/search.module.js";
import { createBookingsModule } from "./bookings/bookings.module.js";
import { createMessagingModule } from "./messaging/messaging.module.js";
import { createReviewsModule } from "./reviews/reviews.module.js";
import { createAdminModule } from "./admin/admin.module.js";

/**
 * Composition root: wires config into an Express app. Each module's
 * *.module.js factory builds its own model -> service -> routes
 * internally — this function's job is just deciding *construction order*
 * and explicitly threading the one genuinely shared cross-module
 * dependency (storageProvider, shared by tutors and verification because
 * both read/write the same uploaded documents). That's still the whole
 * dependency graph, visible in one place — just without each module's
 * internal model/service/routes wiring repeated inline here too.
 */
export function createApp(config) {
  const app = express();

  // CORS: allows only the configured web origin (not "*") with credentials
  // enabled, since the SPA sends the httpOnly refresh-token cookie
  // cross-origin (different port in dev) and needs
  // Access-Control-Allow-Credentials for that cookie to actually be
  // sent/accepted.
  app.use(cors({ origin: config.WEB_ORIGIN, credentials: true }));
  // Parses the incoming Cookie header into req.cookies — used by
  // auth.controller.js to read the refresh-token cookie.
  app.use(cookieParser());
  // Parses JSON bodies. 6MB cap: plain JSON payloads plus base64-encoded
  // verification-doc uploads (no multipart/form-data parser, so tutor
  // documents travel as {contentBase64} in a normal JSON body).
  app.use(express.json({ limit: "6mb" }));

  // Liveness/readiness check — used by the build-order checkpoints and by
  // ops/deploy tooling to confirm the process is up before routing traffic.
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  const auth = createAuthModule({ config });
  const users = createUsersModule({ config });
  const students = createStudentsModule({ config });

  // tutors builds storageProvider and hands it to verification below —
  // both read/write the same uploaded documents, so it must be one
  // shared instance, not two.
  const tutors = createTutorsModule({ config });
  const verification = createVerificationModule({
    config,
    storageProvider: tutors.storageProvider,
  });

  const search = createSearchModule();
  const bookings = createBookingsModule({ config });

  const messaging = createMessagingModule({ config });
  const reviews = createReviewsModule({ config });
  const admin = createAdminModule({ config });

  for (const module of [
    auth,
    users,
    students,
    tutors,
    verification,
    search,
    bookings,
    messaging,
    reviews,
    admin,
  ]) {
    app.use(module.router);
  }

  // Anything not matched by a mounted router falls through here.
  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Central error-handling middleware — must be registered last, and must
  // take exactly 4 arguments for Express to recognize it as an error
  // handler. Every thrown AppError (from a service, from validateBody/
  // validateQuery, from requireAuth/requireRole) lands here — Express 5
  // forwards a rejected promise from an async handler/middleware
  // automatically, so no per-route try/catch is needed anywhere upstream.
  app.use((err, req, res, next) => {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.message, details: err.details });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return { app };
}
