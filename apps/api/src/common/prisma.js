import { PrismaClient } from "@prisma/client";

// Single shared PrismaClient instance for the whole process — every
// module's repository imports this rather than constructing its own, so
// there's one connection pool, not one per module.
export const prisma = new PrismaClient();
