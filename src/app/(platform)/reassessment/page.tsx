"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLearning } from "@/lib/learning-context";
import { reassessmentQuestionsFor } from "@/data/practice-questions";
import { computeConceptMastery, bandFor, bandLabel, bandColor } from "@/lib/mastery";
import type { PracticeAttempt } from "@/lib/learning-context";

type Phase = "intro" | "quiz" | "results";

export default function ReassessmentPage() {
  const router = useRouter();
  const { state, recordPracticeBatch, updateMastery, addHistory } = useLearning();
  const concept = state.selectedConcept ?? "";

  /* Already-seen question IDs for this concept */
  const seenIds = useMemo(() => {
    const ids = new Set<string>();
    for (const a of state.quizAttempts) {
      if (a.concept === concept) ids.add(a.questionId);
    }
    for (const a of state.practiceAttempts) {
      if (a.concept === concept) ids.add(a.questionId);
    }
    return ids;
  }, [state.quizAttempts, state.practiceAttempts, concept]);

  const questions = useMemo(
    () => reassessmentQuestionsFor(concept, seenIds, 3),
    [concept, seenIds],
  );

  const prevMastery = state.mastery[concept] ?? 0;

  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);

  const question = questions[index];
  const total = questions.length;

  const finish = useCallback(
    (finalAttempts: PracticeAttempt[]) => {
      recordPracticeBatch(finalAttempts);

      const allAttempts = [
        ...state.quizAttempts,
        ...state.practiceAttempts,
        ...finalAttempts,
      ];
      const mastery = computeConceptMastery(concept, allAttempts);
      updateMastery({ [concept]: mastery.score });

      const score = Math.round(
        (finalAttempts.filter((a) => a.correct).length / finalAttempts.length) * 100,
      );
      addHistory({
        timestamp: Date.now(),
        activity: "reassessment",
        concept,
        score,
        previousMastery: prevMastery,
        newMastery: mastery.score,
      });

      setPhase("results");
    },
    [recordPracticeBatch, state.quizAttempts, state.practiceAttempts, concept, updateMastery, addHistory, prevMastery],
  );

  const submit = useCallback(() => {
    if (selected === null || !question) return;

    if (!revealed) {
      const attempt: PracticeAttempt = {
        questionId: question.id,
        concept,
        correct: selected === question.answerIndex,
        difficulty: question.difficulty,
        timestamp: Date.now(),
      };
      setAttempts((prev) => [...prev, attempt]);
      setRevealed(true);
      return;
    }

    if (index + 1 >= total) {
      finish([...attempts]);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }, [selected, revealed, index, total, question, attempts, concept, finish]);

  const newMastery = state.mastery[concept] ?? prevMastery;
  const improvement = newMastery - prevMastery;

  if (!concept) {
    return (
      <>
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-semibold text-white">Reassessment</h1>
          <p className="mt-4 text-sm text-zinc-400">
            No concept is selected. Complete a diagnostic quiz or practice session first.
          </p>
          <button
            type="button"
            onClick={() => router.push("/diagnostic")}
            className="mt-6 rounded-full bg-teal-300 px-5 py-2.5 text-sm font-medium text-zinc-950"
          >
            Take Diagnostic Quiz
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-3xl">
        {/* ─── INTRO ─── */}
        {phase === "intro" && (
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-white">Reassessment</h1>
            <p className="mt-4 text-sm text-zinc-400">
              Ready to check your improvement in{" "}
              <span className="text-teal-300">{concept}</span>?
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Current mastery: {prevMastery}% · {total} new questions
            </p>
            <button
              type="button"
              onClick={() => setPhase("quiz")}
              className="mt-6 rounded-full bg-teal-300 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-teal-200"
            >
              Reassess Me
            </button>
          </div>
        )}

        {/* ─── QUIZ ─── */}
        {phase === "quiz" && question && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-white">
                  Reassessment
                </h1>
                <p className="mt-1 text-sm text-teal-300/80">{concept}</p>
              </div>
              <span className="text-sm text-zinc-400">
                {index + 1} / {total}
              </span>
            </div>

            <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-teal-300 transition-all duration-500"
                style={{
                  width: `${((index + (revealed ? 1 : 0)) / total) * 100}%`,
                }}
              />
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#10151f] p-6 sm:p-8">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                {question.difficulty}
              </p>
              <h2 className="mt-3 text-xl font-medium leading-8 text-white">
                {question.prompt}
              </h2>
              <div className="mt-6 space-y-3">
                {question.options.map((option, oi) => {
                  const isCorrect = oi === question.answerIndex;
                  const isPicked = selected === oi;
                  let tone = "border-white/10 hover:bg-white/5";
                  if (revealed && isCorrect)
                    tone = "border-emerald-400/50 bg-emerald-400/10";
                  else if (revealed && isPicked)
                    tone = "border-rose-400/40 bg-rose-400/10";
                  else if (isPicked) tone = "border-teal-300/50 bg-teal-300/10";

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={revealed}
                      onClick={() => setSelected(oi)}
                      className={`block w-full rounded-2xl border px-4 py-3 text-left text-sm text-zinc-200 transition ${tone}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {revealed && (
                <p className="mt-5 text-sm leading-6 text-zinc-300">
                  {question.explanation}
                </p>
              )}
              <button
                type="button"
                onClick={submit}
                disabled={selected === null}
                className="mt-6 rounded-full bg-teal-300 px-5 py-2.5 text-sm font-medium text-zinc-950 disabled:opacity-40"
              >
                {revealed
                  ? index + 1 >= total
                    ? "See Results"
                    : "Next Question"
                  : "Check Answer"}
              </button>
            </div>
          </div>
        )}

        {/* ─── RESULTS — dramatic before/after ─── */}
        {phase === "results" && (
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-white">
              Mastery Improvement
            </h1>
            <p className="mt-2 text-xs uppercase tracking-wide text-zinc-500">
              {concept}
            </p>

            {/* Animated before → after */}
            <div className="mx-auto mt-10 flex max-w-md items-center justify-center gap-8">
              <div>
                <p className="text-sm text-zinc-500">Before</p>
                <p
                  className="mt-2 text-6xl font-bold tabular-nums transition-all duration-1000"
                  style={{ color: bandColor(bandFor(prevMastery)) }}
                >
                  {prevMastery}
                </p>
                <p className="text-sm text-zinc-500">%</p>
                <p
                  className="mt-1 text-xs"
                  style={{ color: bandColor(bandFor(prevMastery)) }}
                >
                  {bandLabel(bandFor(prevMastery))}
                </p>
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-4xl text-zinc-600">→</span>
                {improvement > 0 && (
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                    +{improvement}%
                  </span>
                )}
              </div>

              <div>
                <p className="text-sm text-zinc-500">After</p>
                <p
                  className="mt-2 text-6xl font-bold tabular-nums transition-all duration-1000"
                  style={{ color: bandColor(bandFor(newMastery)) }}
                >
                  {newMastery}
                </p>
                <p className="text-sm text-zinc-500">%</p>
                <p
                  className="mt-1 text-xs"
                  style={{ color: bandColor(bandFor(newMastery)) }}
                >
                  {bandLabel(bandFor(newMastery))}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mx-auto mt-8 max-w-sm">
              <div className="relative h-4 overflow-hidden rounded-full bg-white/10">
                {/* Ghost bar showing previous mastery */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-white/10"
                  style={{ width: `${prevMastery}%` }}
                />
                {/* New mastery bar */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${newMastery}%`,
                    backgroundColor: bandColor(bandFor(newMastery)),
                  }}
                />
              </div>
            </div>

            {/* Status transition */}
            {bandFor(prevMastery) !== bandFor(newMastery) && (
              <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-sm">
                <span style={{ color: bandColor(bandFor(prevMastery)) }}>
                  {bandLabel(bandFor(prevMastery))}
                </span>
                <span className="text-zinc-500">→</span>
                <span
                  className="font-semibold"
                  style={{ color: bandColor(bandFor(newMastery)) }}
                >
                  {bandLabel(bandFor(newMastery))}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/analytics")}
                className="rounded-full bg-teal-300 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-teal-200"
              >
                View Analytics
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-200 hover:bg-white/5"
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => router.push("/practice")}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-200 hover:bg-white/5"
              >
                Practice Another Concept
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
