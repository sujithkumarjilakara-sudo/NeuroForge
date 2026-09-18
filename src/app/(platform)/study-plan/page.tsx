"use client";

import { useState } from "react";
import { studyPlan as cmosStudyPlan } from "@/data/cmos-vlsi";
import { useLearning } from "@/lib/learning-context";
import { generateStudyPlanAction } from "@/actions/ai-actions";

export default function StudyPlanPage() {
  const { state, setDocumentStudyPlan } = useLearning();
  const activeDoc = state.activeDocument;

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customPlan = activeDoc?.generatedStudyPlan;

  const handleGenerateStudyPlan = async () => {
    if (!activeDoc) return;
    try {
      setError(null);
      setIsGenerating(true);

      const conceptNames = activeDoc.concepts.map((c) => c.name);
      const res = await generateStudyPlanAction(
        conceptNames,
        state.mastery,
        activeDoc.extractedText
      );

      if (res.success && res.data && res.data.length > 0) {
        setDocumentStudyPlan(res.data);
      } else {
        // Fallback study plan generation
        const fallbackPlan = activeDoc.concepts.map((c) => {
          const score = state.mastery[c.name] ?? 0;
          return {
            concept: c.name,
            focus: `Review ${c.description} and strengthen core understanding`,
            minutes: score < 40 ? 45 : score < 70 ? 30 : 15,
            priority: score < 40 ? ("high" as const) : score < 70 ? ("medium" as const) : ("low" as const),
          };
        });
        setDocumentStudyPlan(fallbackPlan);
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to create study plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const cmosTotalMinutes = cmosStudyPlan.reduce((sum, session) => sum + session.minutes, 0);
  const customTotalMinutes = customPlan?.reduce((sum, item) => sum + item.minutes, 0) ?? 0;

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">Study Plan</h1>
            <p className="mt-2 text-sm text-zinc-400">
              {activeDoc
                ? `Custom schedule for "${activeDoc.title}" (${customTotalMinutes} minutes total)`
                : `This week: ${cmosTotalMinutes} minutes of CMOS VLSI, sequenced from strengths into weak areas.`}
            </p>
          </div>
          {activeDoc && (
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateStudyPlan}
              className="rounded-full bg-teal-300 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-teal-200 disabled:opacity-50"
            >
              {isGenerating ? "Generating Plan (Gemini)..." : customPlan ? "Regenerate Study Plan" : "Create Study Plan"}
            </button>
          )}
        </div>

        {error && <p className="text-xs text-rose-400">{error}</p>}

        {activeDoc && !customPlan && (
          <div className="rounded-3xl border border-teal-400/30 bg-teal-400/10 p-8 text-center space-y-4">
            <h3 className="text-xl font-medium text-white">Create AI Study Plan</h3>
            <p className="text-sm text-zinc-300 max-w-lg mx-auto">
              NeuroForge will construct a personalized weekly study schedule targeting your weakest concepts in <strong>{activeDoc.title}</strong>.
            </p>
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateStudyPlan}
              className="rounded-full bg-teal-300 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-teal-200 disabled:opacity-50"
            >
              {isGenerating ? "Creating Plan..." : "Generate AI Study Plan"}
            </button>
          </div>
        )}

        <ol className="space-y-3">
          {activeDoc && customPlan ? (
            customPlan.map((session, idx) => (
              <li
                key={idx}
                className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-[#10151f] p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      session.priority === "high"
                        ? "bg-rose-400/20 text-rose-300"
                        : session.priority === "medium"
                        ? "bg-amber-400/20 text-amber-300"
                        : "bg-teal-400/20 text-teal-300"
                    }`}
                  >
                    {session.priority || "medium"} priority
                  </span>
                  <h2 className="mt-1 text-lg font-medium text-white">{session.concept}</h2>
                  <p className="text-sm text-zinc-400">{session.focus}</p>
                </div>
                <div className="text-sm text-right">
                  <p className="text-teal-300 font-semibold">{session.minutes} mins</p>
                  <p className="text-xs text-zinc-500">Targeted session</p>
                </div>
              </li>
            ))
          ) : !activeDoc ? (
            cmosStudyPlan.map((session) => (
              <li
                key={session.id}
                className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-[#10151f] p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">{session.day}</p>
                  <h2 className="mt-1 text-lg font-medium text-white">{session.title}</h2>
                  <p className="text-sm text-zinc-400">{session.focus}</p>
                </div>
                <div className="text-sm">
                  <p className={session.status === "done" ? "text-emerald-300" : session.status === "today" ? "text-teal-300" : "text-zinc-400"}>
                    {session.status}
                  </p>
                  <p className="text-zinc-500">{session.minutes} min</p>
                </div>
              </li>
            ))
          ) : null}
        </ol>
      </div>
    </>
  );
}
