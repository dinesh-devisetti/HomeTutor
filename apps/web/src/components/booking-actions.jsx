import { useState } from "react";
import { Button, Input } from "@hometutoring/ui";
import { useAuth } from "../context/auth-context.jsx";
import { api } from "../lib/api.js";
import { useMutation } from "../lib/use-mutation.js";

// Renders only the transition buttons valid for (current booking status ×
// current user's role/ownership) — mirrors the API's BookingStateMachine +
// EVENT_RULES matrix for UX (so the page never offers an action that would
// just fail). The server independently re-checks everything on every
// request; this is not itself a security boundary.
export function BookingActions({ booking, onChanged }) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [pendingAction, setPendingAction] = useState(null);

  const isParentOwner = user?.role === "PARENT" && booking.parent?.userId === user.id;
  const isTutorOwner = user?.role === "TUTOR" && booking.tutor?.userId === user.id;
  const isAdmin = user?.role === "ADMIN";

  const { mutate, loading } = useMutation(async (action) => {
    const call = {
      accept: () => api.bookings.accept(booking.id),
      decline: () => api.bookings.decline(booking.id, reason || undefined),
      confirm: () => api.bookings.confirm(booking.id),
      start: () => api.bookings.start(booking.id),
      cancel: () => api.bookings.cancel(booking.id, reason || undefined),
      complete: () => api.bookings.complete(booking.id),
      noShow: () => api.bookings.noShow(booking.id),
      refund: () => api.bookings.refund(booking.id),
    }[action];
    const result = await call();
    onChanged?.(result);
    return result;
  });

  // Runs one transition action, tracking which button is mid-flight so
  // only that button shows a loading state.
  async function run(action) {
    setPendingAction(action);
    try {
      await mutate(action);
    } finally {
      setPendingAction(null);
    }
  }

  const status = booking.status;
  const buttons = [];

  if (status === "REQUESTED" && isTutorOwner) {
    buttons.push({ action: "accept", label: "Accept", variant: "primary" });
    buttons.push({ action: "decline", label: "Decline", variant: "destructive" });
  }
  if (status === "ACCEPTED" && (isParentOwner || isAdmin)) {
    buttons.push({ action: "confirm", label: "Confirm & pay (mock)", variant: "primary" });
  }
  if (status === "CONFIRMED" && isTutorOwner) {
    buttons.push({ action: "start", label: "Start session", variant: "primary" });
  }
  if (status === "IN_PROGRESS" && isTutorOwner) {
    buttons.push({ action: "complete", label: "Mark completed", variant: "primary" });
  }
  if ((status === "CONFIRMED" || status === "IN_PROGRESS") && (isTutorOwner || isAdmin)) {
    buttons.push({ action: "noShow", label: "Mark no-show", variant: "secondary" });
  }

  // Parent can only back out pre-payment; tutor/admin can cancel through
  // CONFIRMED — mirrors bookings.service.js's EVENT_RULES.CANCEL exactly.
  const cancelAllowed =
    (isParentOwner && ["REQUESTED", "ACCEPTED"].includes(status)) ||
    ((isTutorOwner || isAdmin) && ["REQUESTED", "ACCEPTED", "CONFIRMED"].includes(status));
  if (cancelAllowed) {
    buttons.push({ action: "cancel", label: "Cancel", variant: "destructive" });
  }

  if (status === "CONFIRMED" && isAdmin) {
    buttons.push({ action: "refund", label: "Refund", variant: "destructive" });
  }

  if (buttons.length === 0) return null;

  const showReasonInput = buttons.some((b) => ["decline", "cancel"].includes(b.action));

  return (
    <div className="space-y-2">
      {showReasonInput && (
        <Input placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
      )}
      <div className="flex flex-wrap gap-2">
        {buttons.map((b) => (
          <Button key={b.action} variant={b.variant} disabled={loading} onClick={() => run(b.action)}>
            {loading && pendingAction === b.action ? "Working..." : b.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
