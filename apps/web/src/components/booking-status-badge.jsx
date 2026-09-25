import { Badge } from "@hometutoring/ui";

const STATUS_TONES = {
  REQUESTED: "warning",
  ACCEPTED: "info",
  CONFIRMED: "success",
  IN_PROGRESS: "info",
  COMPLETED: "success",
  DECLINED: "danger",
  CANCELLED: "neutral",
  NO_SHOW: "danger",
  REFUNDED: "neutral",
};

// Renders a booking's status as a colored pill — one shared mapping so
// every page (list, detail) shows the same color for the same status.
export function BookingStatusBadge({ status }) {
  return <Badge tone={STATUS_TONES[status] ?? "neutral"}>{status.replace("_", " ")}</Badge>;
}
