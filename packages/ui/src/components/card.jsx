import { cn } from "../lib/cn.js";

// Shared card container — the base layout block for tutor cards, booking
// cards, form panels, etc across the app.
export function Card({ className, ...props }) {
  return <div className={cn("rounded-lg border border-slate-200 bg-white shadow-sm", className)} {...props} />;
}

// Padded header slot inside a Card (title + optional subtitle/actions).
export function CardHeader({ className, ...props }) {
  return <div className={cn("border-b border-slate-100 px-4 py-3", className)} {...props} />;
}

// Card title text, sized to sit inside CardHeader.
export function CardTitle({ className, ...props }) {
  return <h3 className={cn("text-base font-semibold text-slate-900", className)} {...props} />;
}

// Main padded content area of a Card.
export function CardContent({ className, ...props }) {
  return <div className={cn("px-4 py-3", className)} {...props} />;
}
