import { z } from "zod";

// Self-signup is only for the two roles a person creates directly; STUDENT
// accounts are created by a guardian (students.js), ADMIN only via seed/ops.
export const SignupInput = z.object({
  role: z.enum(["PARENT", "TUTOR"]),
  fullName: z.string().min(1).max(200),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const OtpRequestInput = z.object({
  phone: z.string().min(7).max(20),
});

export const OtpVerifyInput = z.object({
  phone: z.string().min(7).max(20),
  code: z.string().length(6),
});

export const UpdateMeInput = z.object({
  fullName: z.string().min(1).max(200).optional(),
});

export const ForgotPasswordInput = z.object({
  email: z.string().email(),
});

export const ResetPasswordInput = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(200),
});
