import { Prisma } from "@prisma/client";

export function createSearchModel(prisma) {
  // Builds and runs the public tutor-search query. Raw SQL (not Prisma's
  // query builder) because the result shape is one row per tutor+subject
  // pair, which a JOIN expresses directly. All filters are optional and
  // additive; only verificationStatus='VERIFIED' is always applied,
  // unconditionally.
  //
  // FUTURE FEATURE — geographic search: distance/radius filtering
  // (PostGIS ST_DWithin/ST_Distance against a tutor's home location) is
  // deliberately not implemented in this build. Results are filtered by
  // subject/grade/mode/price only, with no notion of "near me".
  async function searchTutors({ subject, gradeLevel, mode, minPrice, maxPrice }) {
    // Excluding unverified tutors is a WHERE clause on the base query, not a
    // post-filter on results — so it can never be bypassed by pagination
    // or by a caller inspecting raw rows.
    const conditions = [Prisma.sql`t."verificationStatus" = 'VERIFIED'`];

    if (subject) conditions.push(Prisma.sql`s.subject ILIKE ${subject}`);
    if (gradeLevel) conditions.push(Prisma.sql`s."gradeLevel" = ${gradeLevel}`);
    if (mode) conditions.push(Prisma.sql`s.mode = ${mode}::"TutoringMode"`);
    if (minPrice !== undefined) conditions.push(Prisma.sql`s."ratePaisePerHour" >= ${minPrice}`);
    if (maxPrice !== undefined) conditions.push(Prisma.sql`s."ratePaisePerHour" <= ${maxPrice}`);

    const whereClause = Prisma.join(conditions, " AND ");

    return prisma.$queryRaw`
      SELECT
        t.id AS "tutorId",
        t."fullName",
        t.bio,
        s.subject,
        s."gradeLevel",
        s."ratePaisePerHour",
        s.mode
      FROM tutors t
      JOIN tutor_subjects s ON s."tutorId" = t.id
      WHERE ${whereClause}
      ORDER BY s."ratePaisePerHour" ASC
      LIMIT 50
    `;
  }

  return { searchTutors };
}
