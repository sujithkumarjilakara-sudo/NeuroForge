"use client";

import { EmptyDemoState } from "@/components/empty-demo";
import { useDemo } from "@/lib/demo-context";

export function DemoGate({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { demoMode, ready } = useDemo();

  if (!ready) {
    return <div className="h-40 animate-pulse rounded-2xl bg-white/5" />;
  }

  if (!demoMode) {
    return <EmptyDemoState title={title} />;
  }

  return <>{children}</>;
}
