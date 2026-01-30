"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./ui/toast";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
      enableSystem
    >
      <ToastProvider>
        <ConvexProvider client={convex}>
          <NuqsAdapter>{children}</NuqsAdapter>
        </ConvexProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
