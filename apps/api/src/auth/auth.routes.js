import express from "express";
import {
  SignupInput,
  LoginInput,
  OtpRequestInput,
  OtpVerifyInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@hometutoring/types";
import { validateBody } from "../common/validate.js";
import { createAuthController } from "./auth.controller.js";

// URL surface for the auth module — no requireAuth on any of these (that's
// the whole point of auth endpoints), just body validation. What each
// route actually does lives in auth.controller.js.
export function createAuthRoutes({ authService, config }) {
  const router = express.Router();
  const controller = createAuthController({ authService, config });

  router.post("/auth/signup", validateBody(SignupInput), controller.signup);
  router.post("/auth/login", validateBody(LoginInput), controller.login);
  router.post("/auth/otp/request", validateBody(OtpRequestInput), controller.requestOtp);
  router.post("/auth/otp/verify", validateBody(OtpVerifyInput), controller.verifyOtp);
  router.post("/auth/refresh", controller.refresh);
  router.post("/auth/logout", controller.logout);
  router.post("/auth/password/forgot", validateBody(ForgotPasswordInput), controller.requestPasswordReset);
  router.post("/auth/password/reset", validateBody(ResetPasswordInput), controller.resetPassword);

  return router;
}
