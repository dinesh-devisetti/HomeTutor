import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../apps/api/src/common/crypto/password.js";

const prisma = new PrismaClient();

const DEV_PASSWORD = "password123";

// Creates or fetches a seed user with a known dev password — every seeded
// account logs in with DEV_PASSWORD, so manual testing/demoing never needs
// to look up a real credential.
async function upsertUser({ email, role }) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      role,
      passwordHash: hashPassword(DEV_PASSWORD),
    },
  });
}

async function main() {
  // --- Admin ---
  const adminUser = await upsertUser({ email: "admin@hometutoring.test", role: "ADMIN" });
  console.log(`admin: ${adminUser.email}`);

  // --- Tutors (3 verified, 1 unverified — same subject/city as a verified
  // one, so the "unverified never in search" rule is directly testable) ---
  const tutorSeeds = [
    {
      key: "asha",
      email: "asha.rao@hometutoring.test",
      fullName: "Asha Rao",
      bio: "10+ years teaching CBSE Mathematics.",
      verificationStatus: "VERIFIED",
      subjects: [{ subject: "Mathematics", gradeLevel: "10", ratePaisePerHour: 80000, mode: "ONLINE" }],
    },
    {
      key: "ravi",
      email: "ravi.kumar@hometutoring.test",
      fullName: "Ravi Kumar",
      bio: "Physics tutor, ex-IIT.",
      verificationStatus: "VERIFIED",
      subjects: [{ subject: "Physics", gradeLevel: "12", ratePaisePerHour: 120000, mode: "IN_HOME" }],
    },
    {
      key: "meera",
      email: "meera.iyer@hometutoring.test",
      fullName: "Meera Iyer",
      bio: "English & creative writing.",
      verificationStatus: "VERIFIED",
      subjects: [{ subject: "English", gradeLevel: "8", ratePaisePerHour: 60000, mode: "ONLINE" }],
    },
    {
      key: "sanjay",
      email: "sanjay.unverified@hometutoring.test",
      fullName: "Sanjay Verma",
      bio: "New tutor, pending verification.",
      verificationStatus: "UNVERIFIED",
      subjects: [{ subject: "Mathematics", gradeLevel: "10", ratePaisePerHour: 70000, mode: "ONLINE" }],
    },
  ];

  // Keyed refs to seeded tutors, so the bookings section below can address
  // "Asha" / "Ravi" by name instead of re-querying.
  const tutorsByKey = {};

  for (const seed of tutorSeeds) {
    const user = await upsertUser({ email: seed.email, role: "TUTOR" });

    const tutor = await prisma.tutor.upsert({
      where: { userId: user.id },
      update: {
        verificationStatus: seed.verificationStatus,
      },
      create: {
        userId: user.id,
        fullName: seed.fullName,
        bio: seed.bio,
        verificationStatus: seed.verificationStatus,
      },
    });

    await prisma.tutorSubject.deleteMany({ where: { tutorId: tutor.id } });
    await prisma.tutorSubject.createMany({
      data: seed.subjects.map((s) => ({ ...s, tutorId: tutor.id })),
    });

    await prisma.availability.deleteMany({ where: { tutorId: tutor.id } });
    await prisma.availability.create({
      data: { tutorId: tutor.id, dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
    });

    if (seed.verificationStatus === "UNVERIFIED") {
      await prisma.verificationDoc.deleteMany({ where: { tutorId: tutor.id } });
      await prisma.verificationDoc.create({
        data: { tutorId: tutor.id, docType: "ID_PROOF", storageKey: `dev/${tutor.id}/id-proof.pdf` },
      });
    }

    tutorsByKey[seed.key] = tutor;
    console.log(`tutor: ${tutor.fullName} (${seed.verificationStatus})`);
  }

  // --- Parents + students (one minor each, guardian-linked) ---
  const parentSeeds = [
    { key: "priya", email: "priya.parent@hometutoring.test", fullName: "Priya Sharma", child: "Aarav Sharma", grade: "10" },
    { key: "kiran", email: "kiran.parent@hometutoring.test", fullName: "Kiran Nair", child: "Diya Nair", grade: "8" },
  ];

  // Keyed refs to seeded {parent, student} pairs, for the bookings section.
  const parentsByKey = {};

  for (const seed of parentSeeds) {
    const user = await upsertUser({ email: seed.email, role: "PARENT" });

    const parent = await prisma.parent.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, fullName: seed.fullName },
    });

    let student = await prisma.student.findFirst({
      where: { guardianId: parent.id, fullName: seed.child },
    });

    if (!student) {
      student = await prisma.student.create({
        data: {
          fullName: seed.child,
          dateOfBirth: new Date("2013-04-15"),
          gradeLevel: seed.grade,
          guardianId: parent.id,
        },
      });
    }

    parentsByKey[seed.key] = { parent, student };
    console.log(`parent: ${parent.fullName} + student: ${seed.child}`);
  }

  // --- Bookings across every status, so the web app (build step 14) has
  // real data in every UI state instead of an empty screen. Wiped and
  // recreated each run (deleteMany children first, FK order) so the seed
  // stays deterministic and safe to re-run. ---
  const seededTutorIds = [tutorsByKey.asha.id, tutorsByKey.ravi.id];
  const seededParentIds = [parentsByKey.priya.parent.id, parentsByKey.kiran.parent.id];

  await prisma.review.deleteMany({
    where: { tutorId: { in: seededTutorIds }, parentId: { in: seededParentIds } },
  });
  await prisma.message.deleteMany({
    where: { booking: { tutorId: { in: seededTutorIds }, parentId: { in: seededParentIds } } },
  });
  await prisma.booking.deleteMany({
    where: { tutorId: { in: seededTutorIds }, parentId: { in: seededParentIds } },
  });

  const hour = (dateStr) => new Date(dateStr);

  const bookingSeeds = [
    {
      key: "requested",
      status: "REQUESTED",
      parent: "priya",
      tutor: "asha",
      subject: "Mathematics",
      mode: "ONLINE",
      start: "2026-09-10T09:00:00.000Z",
      end: "2026-09-10T10:00:00.000Z",
      pricePaise: 80000,
    },
    {
      key: "accepted",
      status: "ACCEPTED",
      parent: "priya",
      tutor: "asha",
      subject: "Mathematics",
      mode: "ONLINE",
      start: "2026-09-11T09:00:00.000Z",
      end: "2026-09-11T10:00:00.000Z",
      pricePaise: 80000,
    },
    {
      key: "confirmed",
      status: "CONFIRMED",
      parent: "priya",
      tutor: "asha",
      subject: "Mathematics",
      mode: "ONLINE",
      start: "2026-09-12T09:00:00.000Z",
      end: "2026-09-12T10:00:00.000Z",
      pricePaise: 80000,
    },
    {
      key: "inProgress",
      status: "IN_PROGRESS",
      parent: "kiran",
      tutor: "asha",
      subject: "Mathematics",
      mode: "ONLINE",
      start: "2026-09-02T14:00:00.000Z",
      end: "2026-09-02T15:00:00.000Z",
      pricePaise: 80000,
    },
    {
      key: "completed",
      status: "COMPLETED",
      parent: "priya",
      tutor: "asha",
      subject: "Mathematics",
      mode: "ONLINE",
      start: "2026-08-20T09:00:00.000Z",
      end: "2026-08-20T10:00:00.000Z",
      pricePaise: 80000,
      completedAt: "2026-08-20T10:05:00.000Z",
    },
    {
      key: "declined",
      status: "DECLINED",
      parent: "kiran",
      tutor: "asha",
      subject: "Mathematics",
      mode: "ONLINE",
      start: "2026-09-13T09:00:00.000Z",
      end: "2026-09-13T10:00:00.000Z",
      pricePaise: 80000,
      cancelReason: "Not available at that time",
    },
    {
      key: "cancelled",
      status: "CANCELLED",
      parent: "priya",
      tutor: "asha",
      subject: "Mathematics",
      mode: "ONLINE",
      start: "2026-09-14T09:00:00.000Z",
      end: "2026-09-14T10:00:00.000Z",
      pricePaise: 80000,
      cancelReason: "Parent's schedule changed",
    },
    {
      key: "noShow",
      status: "NO_SHOW",
      parent: "priya",
      tutor: "ravi",
      subject: "Physics",
      mode: "IN_HOME",
      start: "2026-08-25T09:00:00.000Z",
      end: "2026-08-25T10:00:00.000Z",
      pricePaise: 120000,
    },
    {
      key: "refunded",
      status: "REFUNDED",
      parent: "kiran",
      tutor: "ravi",
      subject: "Physics",
      mode: "IN_HOME",
      start: "2026-08-27T09:00:00.000Z",
      end: "2026-08-27T10:00:00.000Z",
      pricePaise: 120000,
    },
  ];

  const bookingsByKey = {};

  for (const seed of bookingSeeds) {
    const { parent, student } = parentsByKey[seed.parent];
    const tutor = tutorsByKey[seed.tutor];

    const booking = await prisma.booking.create({
      data: {
        parentId: parent.id,
        studentId: student.id,
        tutorId: tutor.id,
        subject: seed.subject,
        mode: seed.mode,
        status: seed.status,
        startTime: hour(seed.start),
        endTime: hour(seed.end),
        pricePaise: seed.pricePaise,
        cancelReason: seed.cancelReason ?? null,
        completedAt: seed.completedAt ? hour(seed.completedAt) : null,
      },
    });

    bookingsByKey[seed.key] = booking;
  }
  console.log(`bookings: ${bookingSeeds.length} seeded, one per status`);

  // --- Sample messages: one on the still-REQUESTED booking (contains a
  // phone number, so GET /bookings/:id/messages demonstrates masking
  // immediately), and a couple on the CONFIRMED booking (shows unmasked). ---
  await prisma.message.createMany({
    data: [
      {
        bookingId: bookingsByKey.requested.id,
        senderId: parentsByKey.priya.parent.userId,
        body: "Hi Asha, looking forward to the session! You can also reach me at 9876543210 if needed.",
      },
      {
        bookingId: bookingsByKey.confirmed.id,
        senderId: parentsByKey.priya.parent.userId,
        body: "Thanks for confirming! Aarav is excited for the class.",
      },
      {
        bookingId: bookingsByKey.confirmed.id,
        senderId: tutorsByKey.asha.userId,
        body: "Great, see you then. I'll share the online session link 10 minutes before.",
      },
    ],
  });
  console.log("messages: 3 seeded");

  // --- One review on the COMPLETED booking ---
  await prisma.review.create({
    data: {
      bookingId: bookingsByKey.completed.id,
      parentId: parentsByKey.priya.parent.id,
      tutorId: tutorsByKey.asha.id,
      rating: 5,
      comment: "Excellent tutor, very patient with Aarav!",
    },
  });
  console.log("review: 1 seeded");

  console.log(`\nSeed complete. Dev login password for every seeded user: "${DEV_PASSWORD}"`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
