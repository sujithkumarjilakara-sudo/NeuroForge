"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo-context";

const features = [
  {
    title: "Adaptive mastery",
    body: "Track CMOS VLSI topics from MOSFET physics to SRAM with living mastery scores.",
  },
  {
    title: "Knowledge map",
    body: "See prerequisites, bottlenecks, and the next best node to study.",
  },
  {
    title: "AI tutor",
    body: "Ask about delay, power, timing, and cell design with guided VLSI explanations.",
  },
  {
    title: "Targeted quizzes",
    body: "Practice exam-style items and get immediate, concept-level feedback.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { setDemoMode } = useDemo();

  function enterDemo() {
    setDemoMode(true);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-dvh bg-[#05070c] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <p className="text-lg font-semibold tracking-tight">NeuroForge</p>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/dashboard" className="hidden text-zinc-400 hover:text-white sm:inline">
            Open app
          </Link>
          <button
            type="button"
            onClick={enterDemo}
            className="rounded-full bg-teal-300 px-4 py-2 font-medium text-zinc-950 hover:bg-teal-200"
          >
            Enter Demo Mode
          </button>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
        <p className="text-xs uppercase tracking-[0.28em] text-teal-300/80">
          AI for Learning · 48-hour MVP
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight text-white sm:text-6xl">
          Forge a sharper mind for CMOS VLSI.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          NeuroForge is an adaptive learning platform that maps what you know,
          drills the gaps, and coaches you with an AI tutor. This hackathon MVP
          ships a complete student workspace loaded with realistic CMOS VLSI data.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={enterDemo}
            className="rounded-full bg-teal-300 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-teal-200"
          >
            Launch student demo
          </button>
          <Link
            href="/quiz"
            className="rounded-full border border-white/15 px-6 py-3 text-center text-sm text-zinc-200 hover:bg-white/5"
          >
            Try a VLSI quiz
          </Link>
        </div>

        <section className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-white/10 bg-white/4 p-5"
            >
              <h2 className="text-base font-semibold text-white">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{feature.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-16 grid gap-8 rounded-[2rem] border border-white/10 bg-[#0d1320] p-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-white">Why this demo course?</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              CMOS VLSI is dense: device physics, inverters, logical effort,
              leakage, sequential timing, layout, interconnect, and memory. A
              generic LMS cannot show you that hold-time is the bottleneck while
              inverter noise margins are already strong. NeuroForge can.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-zinc-300">
            <li className="rounded-2xl bg-white/5 px-4 py-3">10-topic mastery graph</li>
            <li className="rounded-2xl bg-white/5 px-4 py-3">Exam-style quizzes with explanations</li>
            <li className="rounded-2xl bg-white/5 px-4 py-3">Weekly study plan and flashcards</li>
            <li className="rounded-2xl bg-white/5 px-4 py-3">Progress charts and weakness routing</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
