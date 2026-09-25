import { cn } from "../lib/cn.js";

// Shared form-field label — used above every Input/Select/Textarea in the app.
export function Label({ className, ...props }) {
  return <label className={cn("mb-1 block text-sm font-medium text-slate-700", className)} {...props} />;
}
