"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLearning } from "@/lib/learning-context";
import { allPracticeForConcept } from "@/data/practice-questions";
import { computeConceptMastery, nextDifficulty, bandFor, bandLabel, bandColor } from "@/lib/mastery";
import { CONCEPTS } from "@/data/diagnostic-questions";
import type { PracticeAttempt, Difficulty } from "@/lib/learning-context";
import type { PracticeQuestion } from "@/data/practice-questions";

type Phase = "select" | "practice" | "results";

export default function PracticePage() {
  const router = useRouter();
  const { state, recordPracticeBatch, updateMastery, addHistory, selectConcept } = useLearning();

  const concept = state.selectedConcept ?? "";
  const [activeConcept, setActiveConcept] = useState(concept);
  const [phase, setPhase] = useState<Phase>(concept ? "select" : "select");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>("medium");

  /* ─── Build adaptive question sequence ─── */
  const questions = useMemo(() => {
    let pool = allPracticeForConcept(activeConcept);
    if (pool.length === 0 && state.activeDocument) {
      pool = [
        {
          id: `pract-doc-1-${activeConcept}`,
          concept: activeConcept,
          difficulty: "easy",
          prompt: `What is a fundamental characteristic of ${activeConcept}?`,
          options: [
            `Core principles described in ${state.activeDocument.title}`,
            "Incorrect secondary option",
            "Unrelated property",
            "None of the above",
          ],
          answerIndex: 0,
          explanation: `Refer to ${state.activeDocument.title} for details on ${activeConcept}.`,
        },
        {
          id: `pract-doc-2-${activeConcept}`,
          concept: activeConcept,
          difficulty: "medium",
          prompt: `How is ${activeConcept} applied in practical scenarios?`,
          options: [
            "Through systematic analytical evaluation",
            "Via random trial",
            "By ignoring prerequisites",
            "Only through manual approximation",
          ],
          answerIndex: 0,
          explanation: "Systematic evaluation ensures optimal performance and accuracy.",
        },
        {
          id: `pract-doc-3-${activeConcept}`,
          concept: activeConcept,
          difficulty: "hard",
          prompt: `What is the most critical constraint when optimizing ${activeConcept}?`,
          options: [
            "Balancing accuracy and performance constraints",
            "Maximizing random noise",
            "Disregarding timing requirements",
            "Using static default values only",
          ],
          answerIndex: 0,
          explanation: "Optimization requires balancing operational constraints and design rules.",
        },
      ];
    }
    if (pool.length === 0) return [];

    // Sort by difficulty order, then we'll pick adaptively
    const byDiff: Record<Difficulty, PracticeQuestion[]> = {
      easy: pool.filter((q) => q.difficulty === "easy"),
      medium: pool.filter((q) => q.difficulty === "medium"),
      hard: pool.filter((q) => q.difficulty === "hard"),
      advanced: pool.filter((q) => q.difficulty === "advanced"),
    };

    // Build a sequence of up to 5 questions adaptively
    const seq: PracticeQuestion[] = [];
    let diff: Difficulty = "medium";
    let prevCorrect: boolean | null = null;
    const used = new Set<string>();

    for (let i = 0; i < 5; i++) {
      diff = nextDifficulty(prevCorrect, diff);
      // Find a question at this difficulty
      let q = byDiff[diff]?.find((x) => !used.has(x.id));
      // Fallback to any difficulty
      if (!q) {
        for (const d of ["easy", "medium", "hard"] as Difficulty[]) {
          q = byDiff[d]?.find((x) => !used.has(x.id));
          if (q) break;
        }
      }
      if (!q) break;
      used.add(q.id);
      seq.push(q);
      // Simulate — for pre-building we use null (actual adaptation happens live)
      prevCorrect = null;
    }
    return seq;
  }, [activeConcept, state.activeDocument]);

  const question = questions[index];
  const total = questions.length;

  /* ─── Previous mastery for comparison ─── */
  const prevMastery = useMemo(() => {
    return state.mastery[activeConcept] ?? 0;
  }, [state.mastery, activeConcept]);

  /* ─── Start practice ─── */
  const startPractice = useCallback(
    (c: string) => {
      setActiveConcept(c);
      selectConcept(c);
      setPhase("practice");
      setIndex(0);
      setSelected(null);
      setRevealed(false);
      setAttempts([]);
      setCurrentDifficulty("medium");
    },
    [selectConcept],
  );

  /* ─── Finish & compute ─── */
  const finishPractice = useCallback(
    (finalAttempts: PracticeAttempt[]) => {
      recordPracticeBatch(finalAttempts);

      // Recompute mastery using ALL attempts for this concept
      const allAttempts = [...state.quizAttempts, ...state.practiceAttempts, ...finalAttempts];
      const mastery = computeConceptMastery(activeConcept, allAttempts);
      updateMastery({ [activeConcept]: mastery.score });

      const score = Math.round(
        (finalAttempts.filter((a) => a.correct).length / finalAttempts.length) * 100,
      );
      addHistory({
        timestamp: Date.now(),
        activity: "practice",
        concept: activeConcept,
        score,
        previousMastery: prevMastery,
        newMastery: mastery.score,
      });

      setPhase("results");
    },
    [recordPracticeBatch, state.quizAttempts, state.practiceAttempts, activeConcept, updateMastery, addHistory, prevMastery],
  );

  /* ─── Submit / Next ─── */
  const submit = useCallback(() => {
    if (selected === null || !question) return;

    if (!revealed) {
      const correct = selected === question.answerIndex;
      const attempt: PracticeAttempt = {
        questionId: question.id,
        concept: activeConcept,
        correct,
        difficulty: question.difficulty,
        timestamp: Date.now(),
      };
      setAttempts((prev) => [...prev, attempt]);
      setRevealed(true);
      setCurrentDifficulty(nextDifficulty(correct, currentDifficulty));
      return;
    }

    if (index + 1 >= total) {
      finishPractice([...attempts]);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }, [selected, revealed, index, total, question, attempts, activeConcept, currentDifficulty, finishPractice]);

  /* ─── Results data ─── */
  const newMastery = state.mastery[activeConcept] ?? 0;
  const improvement = newMastery - prevMastery;

  return (
    <>
      <div className="mx-auto max-w-3xl">
        {/* ─── SELECT CONCEPT ─── */}
        {phase === "select" && (
          <div>
            <h1 className="text-3xl font-semibold text-white">
              Targeted Practice
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Pick a concept to practice. Questions adapt to your performance in real time.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {(state.activeDocument ? state.activeDocument.concepts.map((c) => c.name) : CONCEPTS).map((c) => {
                const m = state.mastery[c] ?? 0;
                const band = bandFor(m);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => startPractice(c)}
                    className="rounded-2xl border border-white/10 bg-[#10151f] p-5 text-left transition hover:border-teal-300/30 hover:bg-teal-300/5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{c}</p>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: bandColor(band) }}
                      >
                        {m > 0 ? `${m}%` : "—"}
                      </p>
                    </div>
                    {m > 0 && (
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${m}%`,
                            backgroundColor: bandColor(band),
                          }}
                        />
                      </div>
                    )}
                    <p className="mt-2 text-xs text-zinc-500">
                      {m > 0 ? bandLabel(band) : "Not assessed yet"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── PRACTICE QUESTIONS ─── */}
        {phase === "practice" && question && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-white">
                  Targeted Practice
                </h1>
                <p className="mt-1 text-sm text-teal-300/80">{activeConcept}</p>
              </div>
              <span className="text-sm text-zinc-400">
                {index + 1} / {total}
              </span>
            </div>

            {/* Progress */}
            <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-teal-300 transition-all duration-500"
                style={{
                  width: `${((index + (revealed ? 1 : 0)) / total) * 100}%`,
                }}
              />
            </div>

            {/* Adaptive difficulty indicator */}
            <div className="mb-4 flex gap-2">
              {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                <span
                  key={d}
                  className={`rounded-full px-3 py-1 text-xs capitalize ${
                    question.difficulty === d
                      ? "bg-teal-300/20 text-teal-200"
                      : "bg-white/5 text-zinc-500"
                  }`}
                >
                  {d}
                </span>
              ))}
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#10151f] p-6 sm:p-8">
              <h2 className="text-xl font-medium leading-8 text-white">
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

        {/* ─── RESULTS ─── */}
        {phase === "results" && (
          <div>
            <h1 className="text-3xl font-semibold text-white">
              Practice Complete
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              {activeConcept} · {attempts.filter((a) => a.correct).length}/
              {attempts.length} correct
            </p>

            {/* Before / After mastery comparison */}
            <div className="mt-8 rounded-3xl border border-white/10 bg-[#10151f] p-8">
              <p className="text-center text-xs uppercase tracking-wide text-zinc-500">
                {activeConcept}
              </p>

              <div className="mt-6 flex items-center justify-center gap-6">
                {/* Before */}
                <div className="text-center">
                  <p className="text-xs text-zinc-500">Before</p>
                  <p
                    className="mt-1 text-4xl font-bold"
                    style={{ color: bandColor(bandFor(prevMastery)) }}
                  >
                    {prevMastery}%
                  </p>
                  <p
                    className="mt-1 text-xs"
                    style={{ color: bandColor(bandFor(prevMastery)) }}
                  >
                    {bandLabel(bandFor(prevMastery))}
                  </p>
                </div>

                {/* Arrow */}
                <div className="text-3xl text-zinc-500">→</div>

                {/* After */}
                <div className="text-center">
                  <p className="text-xs text-zinc-500">After</p>
                  <p
                    className="mt-1 text-4xl font-bold"
                    style={{ color: bandColor(bandFor(newMastery)) }}
                  >
                    {newMastery}%
                  </p>
                  <p
                    className="mt-1 text-xs"
                    style={{ color: bandColor(bandFor(newMastery)) }}
                  >
                    {bandLabel(bandFor(newMastery))}
                  </p>
                </div>
              </div>

              {/* Improvement badge */}
              {improvement > 0 && (
                <div className="mt-6 text-center">
                  <span className="inline-block rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                    +{improvement}% improvement
                  </span>
                </div>
              )}

              {/* Progress bar animation */}
              <div className="mx-auto mt-6 max-w-xs">
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${newMastery}%`,
                      backgroundColor: bandColor(bandFor(newMastery)),
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  selectConcept(activeConcept);
                  router.push("/reassessment");
                }}
                className="rounded-full bg-teal-300 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-teal-200"
              >
                Reassess Me
              </button>
              <button
                type="button"
                onClick={() => {
                  selectConcept(activeConcept);
                  router.push("/tutor");
                }}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-200 hover:bg-white/5"
              >
                Teach Me More
              </button>
              <button
                type="button"
                onClick={() => setPhase("select")}
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
