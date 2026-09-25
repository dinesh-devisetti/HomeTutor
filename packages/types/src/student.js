import { z } from "zod";

export const CreateStudentInput = z.object({
  fullName: z.string().min(1).max(200),
  dateOfBirth: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date"),
  gradeLevel: z.string().min(1).max(20),
});
