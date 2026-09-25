import clsx from "clsx";

// Merges conditional class name fragments — the one shared utility every
// component below uses instead of manual template-string concatenation.
export function cn(...inputs) {
  return clsx(inputs);
}
