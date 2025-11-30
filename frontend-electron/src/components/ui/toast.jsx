import * as React from "react"
import { cn } from "@/lib/utils"

// Sistema de toast simple
export const toast = (message, type = 'success') => {
  // Por ahora usamos alert, se puede mejorar con una librería de toast
  if (type === 'error') {
    alert(`Error: ${message}`);
  } else {
    alert(message);
  }
};

export const Toast = ({ className, children, ...props }) => (
  <div
    className={cn(
      "fixed bottom-4 right-4 rounded-lg border bg-card p-4 shadow-lg",
      className
    )}
    {...props}
  >
    {children}
  </div>
);