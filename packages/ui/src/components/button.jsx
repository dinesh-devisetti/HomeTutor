import { forwardRef } from "react";
import { cn } from "../lib/cn.js";

const VARIANTS = {
  primary: "bg-slate-900 text-white hover:bg-slate-700",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  ghost: "bg-transparent text-slate-900 hover:bg-slate-100",
};

// Shared button primitive — one component instead of re-styling <button>
// per page, so every action across the app looks/behaves the same way.
export const Button = forwardRef(function Button(
  { className, variant = "primary", type = "button", disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
});
