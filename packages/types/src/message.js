import { z } from "zod";

export const SendMessageInput = z.object({
  body: z.string().min(1).max(2000),
});
