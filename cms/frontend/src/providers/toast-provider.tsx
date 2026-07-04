"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function ToastProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      theme={theme as "light" | "dark" | "system" | undefined}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: "font-sans text-sm",
        },
      }}
    />
  );
}
