"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { useDemo } from "@/lib/demo-context";
import { useLearning } from "@/lib/learning-context";
import { navItems } from "@/lib/nav";
import { demoStudent } from "@/data/cmos-vlsi";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { demoMode, setDemoMode } = useDemo();
  const { resetLearning } = useLearning();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-[#07090f] text-zinc-100">
      {demoMode ? (
        <div className="flex items-center justify-between gap-3 border-b border-teal-400/20 bg-teal-400/10 px-4 py-2 text-xs text-teal-100 sm:px-6">
          <p>
            Demo Mode is on — CMOS VLSI sample data for {demoStudent.name} at{" "}
            {demoStudent.university}.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="shrink-0 rounded-full border border-teal-300/30 px-3 py-1 text-teal-100 hover:bg-teal-300/10"
              onClick={() => {
                 if (confirm("Reset all learning progress and start over?")) {
                    resetLearning();
                    router.push("/dashboard");
                 }
              }}
            >
              Reset Progress
            </button>
            <button
              type="button"
              className="shrink-0 rounded-full border border-teal-300/30 px-3 py-1 text-teal-100 hover:bg-teal-300/10"
              onClick={() => setDemoMode(false)}
            >
              Exit demo
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex min-h-dvh">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-white/8 bg-[#0c111b] p-4 transition-transform lg:static lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight text-white">
              NeuroForge
            </Link>
            <button
              type="button"
              className="rounded-md p-1 text-zinc-400 lg:hidden"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
            >
              <Icon name="close" />
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-teal-400/15 text-teal-200"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                  }`}
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 rounded-2xl border border-white/8 bg-white/3 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Demo Mode
            </p>
            <p className="mt-1 text-sm text-zinc-300">
              Load realistic CMOS VLSI mastery, quizzes, and a study plan.
            </p>
            <button
              type="button"
              onClick={() => {
                setDemoMode(!demoMode);
                if (!demoMode) {
                  resetLearning();
                  router.push("/dashboard");
                }
              }}
              className="mt-3 w-full rounded-xl bg-teal-300 px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-teal-200"
            >
              {demoMode ? "Turn off" : "Enter Demo Mode"}
            </button>
          </div>
        </aside>

        {open ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            aria-label="Close overlay"
            onClick={() => setOpen(false)}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-white/8 px-4 py-3 sm:px-6">
            <button
              type="button"
              className="rounded-md p-2 text-zinc-300 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
            >
              <Icon name="menu" />
            </button>
            <p className="hidden text-sm text-zinc-400 lg:block">
              Adaptive learning for CMOS VLSI
            </p>
            <div className="ml-auto text-right">
              <p className="text-sm font-medium text-white">
                {demoMode ? demoStudent.name : "Guest learner"}
              </p>
              <p className="text-xs text-zinc-500">
                {demoMode ? demoStudent.course : "Enable Demo Mode to load data"}
              </p>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
