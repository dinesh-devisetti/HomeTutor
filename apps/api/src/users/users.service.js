import { notFound } from "../common/errors.js";

// Flattens User + its Parent/Tutor profile into one response shape, so
// clients don't need to know profile fields live on a different table.
function shapeUser(user) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    fullName: user.parent?.fullName ?? user.tutor?.fullName ?? null,
    createdAt: user.createdAt,
  };
}

export function createUsersService({ repository }) {
  // Returns the caller's own profile — used by GET /users/me and reused by
  // updateMe to return the post-update state.
  async function getMe(userId) {
    const user = await repository.findById(userId);
    if (!user) throw notFound("User not found");
    return shapeUser(user);
  }

  // Updates the caller's display name on whichever profile table (Parent
  // or Tutor) applies to their role, then returns the refreshed profile.
  async function updateMe(userId, input) {
    const user = await repository.findById(userId);
    if (!user) throw notFound("User not found");

    if (input.fullName) {
      if (user.role === "PARENT") await repository.updateParentName(userId, input.fullName);
      if (user.role === "TUTOR") await repository.updateTutorName(userId, input.fullName);
    }

    return getMe(userId);
  }

  return { getMe, updateMe };
}
