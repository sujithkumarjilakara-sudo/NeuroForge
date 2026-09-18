"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLearning } from "@/lib/learning-context";
import { computeAllMastery, bandColor, bandLabel } from "@/lib/mastery";
import { diagnosticConcepts } from "@/data/diagnostic-questions";

export default function WeaknessesPage() {
  const router = useRouter();
  const { state, selectConcept } = useLearning();

  const weaknesses = useMemo(() => {
    const concepts = state.activeDocument
      ? state.activeDocument.concepts.map((c) => c.name)
      : diagnosticConcepts();
    const allAttempts = [...state.quizAttempts, ...state.practiceAttempts];
    const mastery = computeAllMastery(concepts, allAttempts);
    
    // Filter for concepts that need attention or are in learning phase (score < 70)
    return mastery.filter(m => m.score < 70 && m.attempts > 0);
  }, [state.quizAttempts, state.practiceAttempts, state.activeDocument]);

  return (
    <>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold text-white">Weaknesses</h1>
        <p className="mt-2 text-sm text-zinc-400">
          NeuroForge ranks concept gaps based on your quiz and practice performance.
        </p>

        {weaknesses.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-[#10151f] p-8 text-center">
            <p className="text-zinc-400">No weaknesses detected yet.</p>
            <button
              onClick={() => router.push("/diagnostic")}
              className="mt-4 text-sm text-teal-300 hover:underline"
            >
              Take the Diagnostic Quiz
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {weaknesses.map((item) => (
              <article
                key={item.concept}
                className="rounded-3xl border border-white/10 bg-[#10151f] p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-medium text-white">{item.concept}</h2>
                    <span
                      className="rounded-full px-2.5 py-1 text-[11px] uppercase tracking-wide font-semibold"
                      style={{ color: bandColor(item.band), backgroundColor: `${bandColor(item.band)}1a` }}
                    >
                      {bandLabel(item.band)}
                    </span>
                  </div>
                  <div className="text-right">
                     <p className="text-2xl font-bold" style={{ color: bandColor(item.band) }}>{item.score}%</p>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-4 text-sm text-zinc-400">
                  <p>Accuracy: <span className="text-zinc-200">{item.accuracy}%</span></p>
                  <p>Attempts: <span className="text-zinc-200">{item.attempts}</span></p>
                </div>
                
                <p className="mt-3 text-sm text-zinc-300">
                  {item.score < 40 
                    ? `Critical gap detected in ${item.concept}. Immediate review recommended.`
                    : `Developing understanding of ${item.concept}, but needs more practice.`}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      selectConcept(item.concept);
                      router.push("/tutor");
                    }}
                    className="rounded-full bg-teal-300 px-5 py-2 text-sm font-medium text-zinc-950 hover:bg-teal-200"
                  >
                    Teach Me
                  </button>
                  <button
                    onClick={() => {
                      selectConcept(item.concept);
                      router.push("/practice");
                    }}
                    className="rounded-full border border-white/15 px-5 py-2 text-sm text-zinc-200 hover:bg-white/5"
                  >
                    Practice
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
