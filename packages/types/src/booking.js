import { z } from "zod";
import { TutoringMode } from "./enums.js";

export const CreateBookingInput = z.object({
  studentId: z.string().min(1),
  tutorId: z.string().min(1),
  subject: z.string().min(1).max(100),
  mode: z.enum(TutoringMode),
  startTime: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date"),
  endTime: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date"),
});

export const BookingReasonInput = z.object({
  reason: z.string().min(1).max(500).optional(),
});
