import { z } from "zod";

export const RejectTutorInput = z.object({
  reason: z.string().min(1).max(1000),
});

export const AuditLogQuery = z.object({
  targetType: z.string().min(1).max(50).optional(),
});
