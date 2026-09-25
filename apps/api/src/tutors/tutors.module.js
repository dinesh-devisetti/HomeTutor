import { prisma } from "../common/prisma.js";
import { LocalDiskStorageProvider } from "../common/providers/storage/local-disk-storage-provider.js";
import { createTutorsModel } from "./tutors.model.js";
import { createTutorsService } from "./tutors.service.js";
import { createTutorsRoutes } from "./tutors.routes.js";

// Builds the tutors module end-to-end. Also constructs storageProvider
// and returns it — verification reads/writes the same uploaded documents,
// so app.js passes this exact instance into createVerificationModule
// rather than verification constructing a second one.
export function createTutorsModule({ config }) {
  const storageProvider = new LocalDiskStorageProvider({ baseDir: config.STORAGE_LOCAL_DIR });
  const model = createTutorsModel(prisma);
  const service = createTutorsService({ repository: model, storageProvider });
  const router = createTutorsRoutes({ tutorsService: service, config });
  return { router, service, storageProvider };
}
