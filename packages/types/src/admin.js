import { z } from "zod";
import { Role, BookingStatus } from "./enums.js";

export const AdminUsersQuery = z.object({
  role: z.enum(Role).optional(),
});

export const AdminBookingsQuery = z.object({
  status: z.enum(BookingStatus).optional(),
});
