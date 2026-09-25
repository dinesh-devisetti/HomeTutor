import express from "express";
import { UpdateMeInput } from "@hometutoring/types";
import { requireAuth } from "../common/auth-middleware.js";
import { validateBody } from "../common/validate.js";
import { createUsersController } from "./users.controller.js";

// URL surface for the users module — guarded GET/PATCH /users/me.
export function createUsersRoutes({ usersService, config }) {
  const router = express.Router();
  const controller = createUsersController({ usersService });
  const auth = requireAuth({ secret: config.JWT_SECRET });

  router.get("/users/me", auth, controller.getMe);
  router.patch("/users/me", auth, validateBody(UpdateMeInput), controller.updateMe);

  return router;
}
