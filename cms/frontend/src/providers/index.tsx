"use client";

import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./auth-provider";
import { ToastProvider } from "./toast-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Combines all application providers in the correct dependency order:
 * QueryProvider > ThemeProvider > AuthProvider > ToastProvider
 *
 * - QueryProvider: Must wrap AuthProvider since auth uses React Query internally
 * - ThemeProvider: Must wrap ToastProvider so toasts can access the current theme
 * - AuthProvider: Provides auth context to the entire app
 * - ToastProvider: Renders the Sonner toaster, needs theme context
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          {children}
          <ToastProvider />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
