import * as React from "react"
import { cn } from "@/lib/utils"

// Componente Dialog simple para modal básico
export const Dialog = ({ open, onClose, children }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-lg bg-white rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ className, children, ...props }) => (
  <div className={cn("p-6", className)} {...props}>
    {children}
  </div>
);

export const DialogHeader = ({ className, children, ...props }) => (
  <div className={cn("mb-4", className)} {...props}>
    {children}
  </div>
);

export const DialogTitle = ({ className, children, ...props }) => (
  <h2 className={cn("text-lg font-semibold", className)} {...props}>
    {children}
  </h2>
);