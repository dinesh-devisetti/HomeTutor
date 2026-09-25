import { forwardRef } from "react";
import { cn } from "../lib/cn.js";

// Shared multi-line text input — used for message bodies, review
// comments, tutor bios, and rejection reasons.
export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
        "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
