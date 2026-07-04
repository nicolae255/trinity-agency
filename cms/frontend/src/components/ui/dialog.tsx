"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogContextValue {
  onClose: () => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("Dialog components must be used inside <Dialog>");
  return ctx;
}

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses: Record<NonNullable<DialogProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-4xl",
};

export function Dialog({
  open,
  onClose,
  children,
  size = "md",
}: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const content = (
    <DialogContext.Provider value={{ onClose }}>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        aria-modal="true"
        role="dialog"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Dialog panel */}
        <div
          className={cn(
            "relative z-10 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]",
            "shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200",
            sizeClasses[size]
          )}
          role="document"
        >
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  );

  return createPortal(content, document.body);
}

export function DialogHeader({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const { onClose } = useDialogContext();

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-[rgb(var(--border))] p-6",
        className
      )}
    >
      <div className="flex-1">{children}</div>
      <button
        onClick={onClose}
        className={cn(
          "rounded-md p-1 text-[rgb(var(--muted-foreground))] transition-colors",
          "hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        )}
        aria-label="Close dialog"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function DialogTitle({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>
  );
}

export function DialogDescription({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "mt-1 text-sm text-[rgb(var(--muted-foreground))]",
        className
      )}
    >
      {children}
    </p>
  );
}

export function DialogBody({
  className,
  children,
  style,
}: {
  className?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return <div className={cn("p-6", className)} style={style}>{children}</div>;
}

export function DialogFooter({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 border-t border-[rgb(var(--border))] p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
