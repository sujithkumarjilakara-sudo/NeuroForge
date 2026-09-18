"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLearning } from "@/lib/learning-context";
import { computeAllMastery, bandColor, bandLabel, type MasteryBand } from "@/lib/mastery";
import { diagnosticConcepts } from "@/data/diagnostic-questions";
export default function KnowledgeMapPage() {
  const router = useRouter();
  const { state, selectConcept } = useLearning();

  const concepts = useMemo(() => {
    return state.activeDocument
      ? state.activeDocument.concepts.map((c) => c.name)
      : diagnosticConcepts();
  }, [state.activeDocument]);

  const masteryMap = useMemo(() => {
    const allAttempts = [...state.quizAttempts, ...state.practiceAttempts];
    const mList = computeAllMastery(concepts, allAttempts);
    
    // Convert to a dictionary for easy lookup
    const dict: Record<string, { score: number; band: MasteryBand }> = {};
    for (const m of mList) {
      dict[m.concept] = { score: m.score, band: m.band };
    }
    return dict;
  }, [concepts, state.quizAttempts, state.practiceAttempts]);

  const handleConceptClick = (concept: string) => {
    selectConcept(concept);
    router.push("/tutor");
  };

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white">Knowledge Map</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {state.activeDocument
              ? `Concept map for "${state.activeDocument.title}". Click on any concept to open the AI Tutor.`
              : "Click on any concept to open the AI Tutor and start learning."}
          </p>
        </div>

        <div className="relative min-h-[600px] w-full overflow-hidden rounded-3xl border border-white/10 bg-[#07090f] p-8 shadow-2xl">
          {/* Decorative background grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {concepts.map((concept) => {
              const data = masteryMap[concept] || { score: 0, band: "needs-attention" as MasteryBand };
              const color = bandColor(data.band);
              
              return (
                <button
                  key={concept}
                  onClick={() => handleConceptClick(concept)}
                  className="group relative rounded-2xl border border-white/10 bg-[#10151f] p-6 text-left transition-all hover:-translate-y-1 hover:border-white/20 hover:shadow-xl hover:shadow-teal-900/20"
                >
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-10"
                    style={{ backgroundColor: color }}
                  />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-medium text-white">{concept}</h3>
                      <span
                        className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                        style={{ color: color, backgroundColor: `${color}1a` }}
                      >
                        {data.score}%
                      </span>
                    </div>
                    <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${data.score}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <p className="mt-3 text-xs text-zinc-500">{bandLabel(data.band)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
