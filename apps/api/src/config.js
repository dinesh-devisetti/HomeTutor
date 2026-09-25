import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  FIELD_ENCRYPTION_KEY: z.string().length(64),
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().min(1),
  STORAGE_LOCAL_DIR: z.string().min(1),
});

// Validates process.env against EnvSchema at startup and exits immediately
// with a clear error if anything required is missing/malformed — fails
// fast before the server ever binds a port, rather than crashing later on
// first use of a bad config value.
export function loadConfig(env = process.env) {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    console.error("Invalid environment configuration:", result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}
