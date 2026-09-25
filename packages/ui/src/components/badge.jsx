import { cn } from "../lib/cn.js";

const TONES = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-700",
};

// Small pill label — used for booking statuses, verification statuses,
// and other short state indicators.
export function Badge({ className, tone = "neutral", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONES[tone],
        className
      )}
      {...props}
    />
  );
}
