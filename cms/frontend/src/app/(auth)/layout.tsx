import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Sign In",
    template: "%s | Trinity CMS",
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 via-primary-50/30 to-indigo-100 dark:from-neutral-950 dark:via-primary-950/20 dark:to-indigo-950/30 p-4">
      {/* Background decorative elements */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-primary-500/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-[400px]">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 shadow-lg shadow-primary-500/25">
              <span className="text-sm font-bold text-white">T</span>
            </div>
            <div>
              <p className="text-lg font-bold text-[rgb(var(--foreground))]">
                Trinity CMS
              </p>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                Content Management System
              </p>
            </div>
          </div>
        </div>

        {/* Auth card */}
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]/80 p-8 shadow-xl shadow-black/5 backdrop-blur-sm dark:shadow-black/20">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[rgb(var(--muted-foreground))]">
          &copy; {new Date().getFullYear()} Trinity Agency. All rights reserved.
        </p>
      </div>
    </div>
  );
}
