import { z } from "zod";
import { TutoringMode } from "./enums.js";

export const SearchQueryInput = z.object({
  subject: z.string().min(1).max(100).optional(),
  gradeLevel: z.string().min(1).max(20).optional(),
  mode: z.enum(TutoringMode).optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  // FUTURE FEATURE: lat/lng/radiusKm for geographic "near me" search.
});
