import { notFound } from "../common/errors.js";

// Flattens a User + its Parent/Tutor profile into one row for the admin
// users table — same idea as users.service.js's shapeUser, but this also
// surfaces a tutor's verificationStatus, which the "my own profile" view
// doesn't need to but an admin roster does.
function shapeUserRow(user) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    fullName: user.parent?.fullName ?? user.tutor?.fullName ?? null,
    verificationStatus: user.tutor?.verificationStatus ?? null,
    createdAt: user.createdAt,
  };
}

// Flattens a Booking + its parent/tutor/student names into one row for the
// admin bookings table.
function shapeBookingRow(booking) {
  return {
    id: booking.id,
    status: booking.status,
    subject: booking.subject,
    mode: booking.mode,
    startTime: booking.startTime,
    endTime: booking.endTime,
    pricePaise: booking.pricePaise,
    parentName: booking.parent.fullName,
    tutorName: booking.tutor.fullName,
    studentName: booking.student.fullName,
  };
}

// Flattens a Review + its parent/tutor names into one row for the admin
// reviews table.
function shapeReviewRow(review) {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    parentName: review.parent.fullName,
    tutorName: review.tutor.fullName,
  };
}

export function createAdminService({ repository }) {
  // Platform-wide user roster, optionally filtered by role.
  async function listUsers(query) {
    const users = await repository.listUsers(query);
    return users.map(shapeUserRow);
  }

  // Platform-wide booking list, optionally filtered by status — lets an
  // admin find and act on any booking (existing GET /bookings/:id and its
  // action endpoints already allow ADMIN regardless of ownership; this
  // just gives them a way to find a booking to begin with).
  async function listBookings(query) {
    const bookings = await repository.listBookings(query);
    return bookings.map(shapeBookingRow);
  }

  // Platform-wide review list, for moderation.
  async function listReviews() {
    const reviews = await repository.listReviews();
    return reviews.map(shapeReviewRow);
  }

  // Moderation: hard-deletes a review and writes an audit-log entry
  // recording who deleted it and what it said, since the content itself
  // won't exist to inspect afterward.
  async function deleteReview(adminUserId, reviewId) {
    const review = await repository.findReviewById(reviewId);
    if (!review) throw notFound("Review not found");

    await repository.deleteReview(reviewId);
    await repository.createAuditLog({
      actorId: adminUserId,
      action: "REVIEW_DELETED",
      targetType: "Review",
      targetId: reviewId,
      metadata: { rating: review.rating, comment: review.comment },
    });

    return { deleted: true };
  }

  return { listUsers, listBookings, listReviews, deleteReview };
}
