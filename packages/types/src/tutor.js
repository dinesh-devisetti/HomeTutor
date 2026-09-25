import { z } from "zod";
import { TutoringMode } from "./enums.js";

export const TutorProfileInput = z.object({
  bio: z.string().max(2000).optional(),
  // FUTURE FEATURE: travelRadiusKm + lat/lng, once geographic search lands.
});

export const AddSubjectInput = z.object({
  subject: z.string().min(1).max(100),
  gradeLevel: z.string().min(1).max(20),
  ratePaisePerHour: z.coerce.number().int().positive(),
  mode: z.enum(TutoringMode),
});

export const AddAvailabilityInput = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Expected HH:mm"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Expected HH:mm"),
});

export const UploadDocumentInput = z.object({
  docType: z.string().min(1).max(50),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  contentBase64: z.string().min(1),
});
