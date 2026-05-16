import React from "react";
import { cn } from "@/lib/utils";

export function Button({ className = "", variant = "default", disabled = false, children, ...props }) {
  const variants = {
    default: "bg-sky-600 text-white hover:bg-sky-700",
    outline: "border border-sky-300 bg-white text-sky-700 hover:bg-sky-50",
    ghost: "bg-transparent hover:bg-sky-50"
  };

  return (
    <button
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
