"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { DemoProvider } from "@/lib/demo-context";

const LearningProvider = dynamic(
  () =>
    import("@/lib/learning-context").then(
      (mod) => mod.LearningProvider
    ),
  { ssr: false }
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DemoProvider>
      <LearningProvider>{children}</LearningProvider>
    </DemoProvider>
  );
}
