"use client";

import { useRouter } from "next/navigation";
import { demoStudent, topics } from "@/data/cmos-vlsi";
import { useDemo } from "@/lib/demo-context";

export function EmptyDemoState({ title }: { title: string }) {
  const { setDemoMode } = useDemo();
  const router = useRouter();

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-[#10151f] p-8 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-teal-300/80">Demo Mode off</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-400">
        Turn on Demo Mode to explore NeuroForge with a full CMOS VLSI course:
        {` ${topics.length} `}
        topics, quizzes, flashcards, and {demoStudent.name}&apos;s study plan.
      </p>
      <button
        type="button"
        onClick={() => {
          setDemoMode(true);
          router.push("/dashboard");
        }}
        className="mt-6 inline-flex rounded-full bg-teal-300 px-5 py-2.5 text-sm font-medium text-zinc-950"
      >
        Enable Demo Mode
      </button>
    </div>
  );
}
