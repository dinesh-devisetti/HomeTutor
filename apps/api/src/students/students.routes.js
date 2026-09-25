import express from "express";
import { CreateStudentInput } from "@hometutoring/types";
import { requireAuth } from "../common/auth-middleware.js";
import { requireRole } from "../common/role-middleware.js";
import { validateBody } from "../common/validate.js";
import { createStudentsController } from "./students.controller.js";

// URL surface for the students module. GET /students/mine is registered
// before GET /students/:id so "mine" isn't swallowed as a literal :id
// value by the param route (Express matches routes in registration order,
// same as the hand-rolled router before it).
export function createStudentsRoutes({ studentsService, config }) {
  const router = express.Router();
  const controller = createStudentsController({ studentsService });
  const auth = requireAuth({ secret: config.JWT_SECRET });
  const parentOnly = requireRole("PARENT");

  router.post("/students", auth, parentOnly, validateBody(CreateStudentInput), controller.create);
  router.get("/students/mine", auth, parentOnly, controller.listMine);
  router.get("/students/:id", auth, controller.getById);

  return router;
}
