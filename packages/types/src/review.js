import { z } from "zod";

export const CreateReviewInput = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});
