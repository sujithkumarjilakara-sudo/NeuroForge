"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AccuracyLineChart, MasteryRing, WeeklyBarChart } from "@/components/charts";
import { demoStudent, weeklyProgress } from "@/data/cmos-vlsi";
import { useLearning } from "@/lib/learning-context";
import { computeAllMastery, bandLabel } from "@/lib/mastery";
import { diagnosticConcepts } from "@/data/diagnostic-questions";

export default function DashboardPage() {
  const router = useRouter();
  const { state, selectConcept } = useLearning();

  const {
    masteryList,
    overallMastery,
    topicsTracked,
    weakestConcept,
    recentImprovement,
    conceptsCount,
  } = useMemo(() => {
    const concepts = state.activeDocument
      ? state.activeDocument.concepts.map((c) => c.name)
      : diagnosticConcepts();
    const allAttempts = [...state.quizAttempts, ...state.practiceAttempts];
    const mList = computeAllMastery(concepts, allAttempts);
    
    // Sort by score ascending to find weakest
    const weakest = mList.length > 0 && mList[0].score < 85 ? mList[0] : null;

    const overall = mList.length > 0
      ? Math.round(mList.reduce((sum, m) => sum + m.score, 0) / mList.length)
      : 0;

    // Find the most recent improvement from history
    let recentImp = null;
    for (let i = state.history.length - 1; i >= 0; i--) {
      const entry = state.history[i];
      if (entry.newMastery > entry.previousMastery) {
        recentImp = entry;
        break;
      }
    }

    return {
      masteryList: mList,
      overallMastery: overall,
      topicsTracked: allAttempts.length > 0 ? mList.filter(m => m.attempts > 0).length : 0,
      weakestConcept: weakest,
      recentImprovement: recentImp,
      conceptsCount: concepts.length,
    };
  }, [state.quizAttempts, state.practiceAttempts, state.history, state.activeDocument]);

  const leading = [...masteryList].sort((a, b) => b.score - a.score).filter(m => m.attempts > 0).slice(0, 4);

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-sm text-teal-300/80">
            {state.activeDocument ? `Active Course: ${state.activeDocument.title}` : `Welcome back, ${demoStudent.name}`}
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-white">
            {state.activeDocument ? state.activeDocument.title : "Student dashboard"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            {state.activeDocument
              ? `Subject: ${state.activeDocument.subject} · File: ${state.activeDocument.filename}`
              : `${demoStudent.course} · ${demoStudent.university} · ${demoStudent.streak}-day streak`}
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Overall mastery" value={`${overallMastery}%`} />
          <Stat label="Minutes this week" value={`${demoStudent.minutesThisWeek}`} />
          <Stat
            label="Weekly goal"
            value={`${Math.round((demoStudent.minutesThisWeek / demoStudent.weeklyGoalMinutes) * 100)}%`}
          />
          <Stat label="Topics tracked" value={`${topicsTracked} / ${conceptsCount}`} />
        </section>

        {/* Dynamic Recommendation */}
        {weakestConcept && (
          <section className="rounded-3xl border border-teal-400/20 bg-teal-400/5 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-300">
                  NeuroForge Recommendation
                </p>
                <h2 className="mt-2 text-2xl font-medium text-white">
                  Focus on <span className="text-teal-300">{weakestConcept.concept}</span>
                </h2>
                <p className="mt-2 text-sm text-zinc-400 max-w-xl">
                  Your current mastery is <span className="font-semibold text-white">{weakestConcept.score}%</span> ({bandLabel(weakestConcept.band)}). 
                  Strengthening this concept will improve your overall course performance.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <button
                  onClick={() => {
                    selectConcept(weakestConcept.concept);
                    router.push("/tutor");
                  }}
                  className="rounded-full bg-teal-300 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-teal-200"
                >
                  Teach Me
                </button>
                <button
                  onClick={() => {
                    selectConcept(weakestConcept.concept);
                    router.push("/practice");
                  }}
                  className="rounded-full border border-teal-300/30 bg-teal-400/10 px-6 py-3 text-sm font-medium text-teal-100 hover:bg-teal-400/20"
                >
                  Practice Now
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Recent Improvement */}
        {recentImprovement && (
          <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300 text-xl">
                ↑
              </div>
              <div>
                <p className="text-sm font-medium text-white">Recent Improvement: {recentImprovement.concept}</p>
                <p className="text-sm text-zinc-400">
                  Mastery increased from {recentImprovement.previousMastery}% to <span className="font-semibold text-emerald-300">{recentImprovement.newMastery}%</span> 
                  <span className="ml-2 rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs font-medium text-emerald-300">
                    +{recentImprovement.newMastery - recentImprovement.previousMastery}%
                  </span>
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-[#10151f] p-6">
            <h2 className="text-lg font-medium text-white">Study minutes (Demo)</h2>
            <p className="mb-4 text-sm text-zinc-500">Last 7 days</p>
            <WeeklyBarChart data={weeklyProgress} />
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#10151f] p-6">
            <h2 className="text-lg font-medium text-white">Quiz accuracy (Demo)</h2>
            <AccuracyLineChart data={weeklyProgress} />
          </div>
        </section>

        {leading.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-medium text-white">Strongest Concepts</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {leading.map((topic) => (
                <article
                  key={topic.concept}
                  className="rounded-3xl border border-white/10 bg-[#10151f] p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-500">
                        {bandLabel(topic.band)}
                      </p>
                      <h3 className="mt-1 text-base font-medium text-white">{topic.concept}</h3>
                    </div>
                    <MasteryRing value={topic.score} label="" size={72} />
                  </div>
                  <p className="mt-3 text-sm text-zinc-400">{topic.accuracy}% accuracy over {topic.attempts} attempts</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {!state.diagnosticComplete && (
          <section className="rounded-3xl border border-white/10 bg-[#10151f] p-8 text-center">
             <h2 className="text-xl font-medium text-white">Let&apos;s get started</h2>
             <p className="mt-2 text-sm text-zinc-400">Take the diagnostic quiz to establish your baseline mastery and get personalized recommendations.</p>
             <button
                onClick={() => router.push("/diagnostic")}
                className="mt-6 rounded-full bg-teal-300 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-teal-200"
              >
                Take Diagnostic Quiz
              </button>
          </section>
        )}

      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#10151f] p-5">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
