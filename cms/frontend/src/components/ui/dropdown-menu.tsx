"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const ctx = useContext(DropdownContext);
  if (!ctx)
    throw new Error(
      "Dropdown components must be used inside <DropdownMenu>"
    );
  return ctx;
}

type DropdownAlign = "start" | "end" | "center";

interface DropdownMenuProps {
  children: ReactNode;
  align?: DropdownAlign;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
      <div ref={containerRef} className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

interface DropdownTriggerProps {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
}

export function DropdownTrigger({ children, className, asChild }: DropdownTriggerProps) {
  const { open, setOpen, triggerRef } = useDropdownContext();

  if (asChild) {
    return (
      <div
        ref={triggerRef as any}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen(!open)}
        className={className}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-expanded={open}
      aria-haspopup="menu"
      onClick={() => setOpen(!open)}
      className={cn(
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </button>
  );
}

interface DropdownContentProps {
  children: ReactNode;
  className?: string;
  align?: DropdownAlign;
  sideOffset?: number;
}

const alignClasses: Record<DropdownAlign, string> = {
  start: "left-0",
  end: "right-0",
  center: "left-1/2 -translate-x-1/2",
};

export function DropdownContent({
  children,
  className,
  align = "end",
  sideOffset = 4,
}: DropdownContentProps) {
  const { open } = useDropdownContext();

  if (!open) return null;

  return (
    <div
      role="menu"
      aria-orientation="vertical"
      className={cn(
        "absolute z-50 min-w-[10rem] rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))]",
        "shadow-lg p-1",
        "animate-in fade-in-0 zoom-in-95 duration-150",
        alignClasses[align],
        `mt-${sideOffset / 4}`,
        "top-full mt-1",
        className
      )}
      style={{ marginTop: sideOffset }}
    >
      {children}
    </div>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  icon?: ReactNode;
  asChild?: boolean;
}

export function DropdownItem({
  children,
  className,
  onClick,
  disabled,
  destructive,
  icon,
  asChild,
}: DropdownItemProps) {
  const { setOpen } = useDropdownContext();

  const handleClick = useCallback(() => {
    if (disabled) return;
    onClick?.();
    setOpen(false);
  }, [disabled, onClick, setOpen]);

  const itemClass = cn(
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm",
    "text-[rgb(var(--foreground))] transition-colors duration-100",
    "hover:bg-[rgb(var(--muted))] focus-visible:bg-[rgb(var(--muted))]",
    "focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-50",
    destructive && "text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20",
    className
  );

  if (asChild) {
    return (
      <div role="menuitem" className={itemClass} onClick={handleClick}>
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      className={itemClass}
    >
      {icon && (
        <span className="shrink-0 h-4 w-4" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}

export function DropdownSeparator({ className }: { className?: string }) {
  return (
    <div
      role="separator"
      className={cn(
        "my-1 h-px bg-[rgb(var(--border))]",
        className
      )}
    />
  );
}

export function DropdownLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "px-2 py-1.5 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider",
        className
      )}
    >
      {children}
    </p>
  );
}


// Alias exports for common naming convention
export { DropdownTrigger as DropdownMenuTrigger };
export { DropdownContent as DropdownMenuContent };
export { DropdownItem as DropdownMenuItem };
export { DropdownSeparator as DropdownMenuSeparator };
export { DropdownLabel as DropdownMenuLabel };
