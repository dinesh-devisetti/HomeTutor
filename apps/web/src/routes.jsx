import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/protected-route.jsx";
import { Home } from "./pages/Home.jsx";
import { Login } from "./pages/Login.jsx";
import { Signup } from "./pages/Signup.jsx";
import { ForgotPassword } from "./pages/ForgotPassword.jsx";
import { ResetPassword } from "./pages/ResetPassword.jsx";
import { Search } from "./pages/Search.jsx";
import { Profile } from "./pages/Profile.jsx";
import { TutorProfile } from "./pages/TutorProfile.jsx";
import { BookingNew } from "./pages/BookingNew.jsx";
import { BookingList } from "./pages/BookingList.jsx";
import { BookingDetail } from "./pages/BookingDetail.jsx";
import { BookingMessages } from "./pages/BookingMessages.jsx";
import { BookingReview } from "./pages/BookingReview.jsx";
import { TutorOnboarding } from "./pages/tutor/Onboarding.jsx";
import { TutorAvailability } from "./pages/tutor/Availability.jsx";
import { AdminVerificationQueue } from "./pages/admin/VerificationQueue.jsx";
import { AdminVerificationDetail } from "./pages/admin/VerificationDetail.jsx";
import { AdminAuditLog } from "./pages/admin/AuditLog.jsx";
import { AdminUsers } from "./pages/admin/Users.jsx";
import { AdminBookings } from "./pages/admin/Bookings.jsx";
import { AdminReviews } from "./pages/admin/Reviews.jsx";

// Central route table for this basic build: auth, search + tutor profile,
// booking flow, messaging/reviews, tutor onboarding/availability, and the
// admin area (verification, users, bookings, reviews, audit log).
// Payments, notifications, progress reports and analytics are not part of
// this build.
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/search" element={<Search />} />
      <Route path="/tutors/:id" element={<TutorProfile />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bookings/new"
        element={
          <ProtectedRoute roles={["PARENT"]}>
            <BookingNew />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute roles={["PARENT"]}>
            <BookingList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tutor/bookings"
        element={
          <ProtectedRoute roles={["TUTOR"]}>
            <BookingList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/:id"
        element={
          <ProtectedRoute>
            <BookingDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/:id/messages"
        element={
          <ProtectedRoute>
            <BookingMessages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/:id/review"
        element={
          <ProtectedRoute roles={["PARENT"]}>
            <BookingReview />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tutor/onboarding"
        element={
          <ProtectedRoute roles={["TUTOR"]}>
            <TutorOnboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tutor/availability"
        element={
          <ProtectedRoute roles={["TUTOR"]}>
            <TutorAvailability />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/verification"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminVerificationQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/verification/:tutorId"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminVerificationDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-log"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminAuditLog />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminReviews />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
