import { forwardRef } from "react";
import { cn } from "../lib/cn.js";

// Shared text-input primitive used by every form across the app.
export const Input = forwardRef(function Input({ className, type = "text", ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
        "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
