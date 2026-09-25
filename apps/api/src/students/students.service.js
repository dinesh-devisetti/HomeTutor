import { forbidden, notFound } from "../common/errors.js";

export function createStudentsService({ repository }) {
  // Creates a new student record under the caller's own Parent record —
  // enforces the "minors always have a guardian account" domain rule by
  // construction (guardianId is always set from the authenticated parent,
  // never taken from the request body).
  async function create(userId, input) {
    const parent = await repository.findParentByUserId(userId);
    if (!parent) throw forbidden("Only parents can add students");

    return repository.create({
      fullName: input.fullName,
      dateOfBirth: new Date(input.dateOfBirth),
      gradeLevel: input.gradeLevel,
      guardianId: parent.id,
    });
  }

  // Reads a single student, restricted to that student's own guardian —
  // prevents one parent from reading another parent's child's record by id.
  async function getById(userId, studentId) {
    const student = await repository.findById(studentId);
    if (!student) throw notFound("Student not found");

    const parent = await repository.findParentByUserId(userId);
    if (!parent || student.guardianId !== parent.id) {
      throw forbidden("Not your student");
    }

    return student;
  }

  // Lists the caller's own students — used by the booking-creation form
  // so a parent can pick which of their children a booking is for.
  async function listMine(userId) {
    const parent = await repository.findParentByUserId(userId);
    if (!parent) throw forbidden("Only parents have students");
    return repository.findByGuardianId(parent.id);
  }

  return { create, getById, listMine };
}
