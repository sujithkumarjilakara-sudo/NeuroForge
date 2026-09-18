"use client";

import type { ReactNode } from "react";
import { DemoProvider } from "@/lib/demo-context";
import { LearningProvider } from "@/lib/learning-context";

/**
 * All client-side context providers, composed in one place
 * so the root layout stays a server component.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <DemoProvider>
      <LearningProvider>{children}</LearningProvider>
    </DemoProvider>
  );
}
