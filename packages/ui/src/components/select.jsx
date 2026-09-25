import { forwardRef } from "react";
import { cn } from "../lib/cn.js";

// Shared native <select> primitive — used for role/subject/grade/mode
// pickers. Plain native select rather than a custom dropdown, matching
// "functional minimal" scope.
export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-slate-400",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
