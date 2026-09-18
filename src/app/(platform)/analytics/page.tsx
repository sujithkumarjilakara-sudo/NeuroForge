"use client";

import { useMemo } from "react";
import { AccuracyLineChart, WeeklyBarChart } from "@/components/charts";
import { useLearning } from "@/lib/learning-context";
import { computeAllMastery, bandFor, bandColor } from "@/lib/mastery";
import { diagnosticConcepts } from "@/data/diagnostic-questions";
import { weeklyProgress } from "@/data/cmos-vlsi"; // Keep for the charts if no real history

export default function AnalyticsPage() {
  const { state } = useLearning();

  const analytics = useMemo(() => {
    const concepts = state.activeDocument
      ? state.activeDocument.concepts.map((c) => c.name)
      : diagnosticConcepts();
    const allAttempts = [...state.quizAttempts, ...state.practiceAttempts];
    const masteryList = computeAllMastery(concepts, allAttempts);
    
    const overallMastery = masteryList.length > 0
      ? Math.round(masteryList.reduce((sum, m) => sum + m.score, 0) / masteryList.length)
      : 0;
      
    const mastered = masteryList.filter(m => m.score >= 85).length;
    const developing = masteryList.filter(m => m.score >= 40 && m.score < 85).length;
    const novice = masteryList.filter(m => m.score < 40).length;
    
    const totalAttempts = allAttempts.length;
    const correctAttempts = allAttempts.filter(a => a.correct).length;
    const overallAccuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    return { masteryList, overallMastery, mastered, developing, novice, overallAccuracy, totalAttempts };
  }, [state.quizAttempts, state.practiceAttempts, state.activeDocument]);

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-white">Analytics</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {state.activeDocument
              ? `Course health for "${state.activeDocument.title}" · overall mastery ${analytics.overallMastery}% · ${analytics.totalAttempts} questions answered`
              : `Course health for CMOS VLSI · overall mastery ${analytics.overallMastery}% · ${analytics.totalAttempts} questions answered`}
          </p>
        </div>
        <section className="grid gap-4 sm:grid-cols-4">
          <Metric label="Overall Accuracy" value={`${analytics.overallAccuracy}%`} />
          <Metric label="Mastered topics" value={String(analytics.mastered)} />
          <Metric label="Developing" value={String(analytics.developing)} />
          <Metric label="Needs Attention" value={String(analytics.novice)} />
        </section>
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-[#10151f] p-6">
            <h2 className="mb-4 text-lg font-medium text-white">Time on task (Demo)</h2>
            <WeeklyBarChart data={weeklyProgress} />
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#10151f] p-6">
            <h2 className="mb-4 text-lg font-medium text-white">Accuracy trend (Demo)</h2>
            <AccuracyLineChart data={weeklyProgress} />
          </div>
        </section>
        <section className="rounded-3xl border border-white/10 bg-[#10151f] p-6">
          <h2 className="text-lg font-medium text-white">Mastery distribution</h2>
          {analytics.masteryList.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-400">Complete the diagnostic quiz to see your mastery distribution.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {analytics.masteryList.map((topic) => (
                <li key={topic.concept} className="grid grid-cols-[1fr_auto] items-center gap-4">
                  <div>
                    <p className="text-sm text-zinc-200">{topic.concept}</p>
                    <div className="mt-1 h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${topic.score}%`,
                          backgroundColor: bandColor(bandFor(topic.score))
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-zinc-400 min-w-8 text-right">{topic.score}%</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#10151f] p-5">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}
