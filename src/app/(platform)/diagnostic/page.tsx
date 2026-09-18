"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { diagnosticQuestions, diagnosticConcepts } from "@/data/diagnostic-questions";
import { useLearning } from "@/lib/learning-context";
import { computeAllMastery, bandFor, bandLabel, bandColor } from "@/lib/mastery";
import type { QuizAttempt } from "@/lib/learning-context";

type Phase = "intro" | "quiz" | "results";

export default function DiagnosticPage() {
  const router = useRouter();
  const { recordQuizBatch, updateMastery, addHistory, selectConcept, state } = useLearning();

  const [phase, setPhase] = useState<Phase>(
    state.diagnosticComplete ? "results" : "intro",
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  const activeDoc = state.activeDocument;
  const questions = useMemo(() => {
    if (activeDoc?.generatedQuiz && activeDoc.generatedQuiz.length > 0) {
      return activeDoc.generatedQuiz;
    }
    return diagnosticQuestions;
  }, [activeDoc]);

  const concepts = useMemo(() => {
    if (activeDoc?.concepts && activeDoc.concepts.length > 0) {
      return activeDoc.concepts.map((c) => c.name);
    }
    return diagnosticConcepts();
  }, [activeDoc]);

  const total = questions.length;
  const question = questions[index];

  /* ─── finish & compute mastery ─── */
  const finishQuiz = useCallback(
    (finalAttempts: QuizAttempt[]) => {
      // Record all attempts in the central state
      recordQuizBatch(finalAttempts);

      // Compute mastery per concept
      const masteryResults = computeAllMastery(concepts, finalAttempts);
      const masteryMap: Record<string, number> = {};
      for (const m of masteryResults) {
        masteryMap[m.concept] = m.score;
      }
      updateMastery(masteryMap);

      // Add history entries
      for (const m of masteryResults) {
        addHistory({
          timestamp: Date.now(),
          activity: "diagnostic-quiz",
          concept: m.concept,
          score: m.accuracy,
          previousMastery: 0,
          newMastery: m.score,
        });
      }

      // Auto-select weakest concept
      const weakest = masteryResults[0]; // sorted ascending
      if (weakest) selectConcept(weakest.concept);

      setPhase("results");
    },
    [concepts, recordQuizBatch, updateMastery, addHistory, selectConcept],
  );

  /* ─── submit / next ─── */
  const submit = useCallback(() => {
    if (selected === null || !question) return;

    if (!revealed) {
      const attempt: QuizAttempt = {
        questionId: question.id,
        concept: question.concept,
        correct: selected === question.answerIndex,
        difficulty: question.difficulty,
        timestamp: Date.now(),
      };
      setAttempts((prev) => [...prev, attempt]);
      setRevealed(true);
      return;
    }

    // Move to next question or finish
    if (index + 1 >= total) {
      finishQuiz([...attempts]);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }, [selected, revealed, index, total, question, attempts, finishQuiz]);

  /* ─── computed results ─── */
  const results = useMemo(() => {
    const allAttempts = state.diagnosticComplete
      ? state.quizAttempts
      : attempts;
    const masteryList = computeAllMastery(concepts, allAttempts);
    const correct = allAttempts.filter((a) => a.correct).length;
    const totalQ = allAttempts.length;
    return { masteryList, correct, totalQ };
  }, [state.diagnosticComplete, state.quizAttempts, attempts, concepts]);

  /* ─── Restart diagnostic ─── */
  const restart = useCallback(() => {
    setPhase("intro");
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setAttempts([]);
  }, []);

  return (
    <>
      <div className="mx-auto max-w-3xl">
        {/* ─── INTRO ─── */}
        {phase === "intro" && (
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-white">
              {activeDoc ? `Diagnostic: ${activeDoc.title}` : "Diagnostic Assessment"}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-400">
              {activeDoc
                ? `NeuroForge will evaluate your understanding of key concepts from "${activeDoc.title}" with ${total} AI-generated questions.`
                : `NeuroForge will evaluate your current CMOS VLSI knowledge across ${concepts.length} concepts with ${total} questions. Your results determine a personalised learning path.`}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
              {concepts.map((c) => (
                <div
                  key={c}
                  className="rounded-2xl border border-white/10 bg-[#10151f] px-4 py-3"
                >
                  <p className="text-sm font-medium text-white">{c}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPhase("quiz")}
              className="mt-8 rounded-full bg-teal-300 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-teal-200"
            >
              Start Diagnostic
            </button>
            {state.diagnosticComplete && (
              <button
                type="button"
                onClick={() => setPhase("results")}
                className="ml-3 mt-8 rounded-full border border-white/15 px-6 py-3 text-sm text-zinc-200 hover:bg-white/5"
              >
                View Previous Results
              </button>
            )}
          </div>
        )}

        {/* ─── QUIZ ─── */}
        {phase === "quiz" && question && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-white">
                Diagnostic Quiz
              </h1>
              <span className="text-sm text-zinc-400">
                {index + 1} / {total}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-teal-300 transition-all duration-500"
                style={{ width: `${((index + (revealed ? 1 : 0)) / total) * 100}%` }}
              />
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#10151f] p-6 sm:p-8">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                {question.concept} · {question.difficulty}
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
                  else if (isPicked)
                    tone = "border-teal-300/50 bg-teal-300/10";

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
              Diagnostic Results
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              {results.correct} / {results.totalQ} correct ·{" "}
              {results.totalQ > 0
                ? Math.round((results.correct / results.totalQ) * 100)
                : 0}
              % accuracy
            </p>

            {/* Overall score card */}
            <div className="mt-6 rounded-3xl border border-white/10 bg-[#10151f] p-6 text-center">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Overall Score
              </p>
              <p className="mt-2 text-5xl font-bold text-white">
                {results.totalQ > 0
                  ? Math.round((results.correct / results.totalQ) * 100)
                  : 0}
                %
              </p>
            </div>

            {/* Per-concept breakdown */}
            <h2 className="mb-4 mt-8 text-lg font-medium text-white">
              Concept Mastery
            </h2>
            <div className="space-y-3">
              {results.masteryList.map((m) => (
                <div
                  key={m.concept}
                  className="rounded-2xl border border-white/10 bg-[#10151f] p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {m.concept}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {m.attempts} questions · {m.accuracy}% accuracy
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-lg font-semibold"
                        style={{ color: bandColor(bandFor(m.score)) }}
                      >
                        {m.score}%
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: bandColor(bandFor(m.score)) }}
                      >
                        {bandLabel(bandFor(m.score))}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${m.score}%`,
                        backgroundColor: bandColor(bandFor(m.score)),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendation card */}
            {results.masteryList.length > 0 && (
              <div className="mt-8 rounded-3xl border border-teal-400/20 bg-teal-400/5 p-6">
                <p className="text-xs uppercase tracking-wide text-teal-300/80">
                  NeuroForge Recommendation
                </p>
                <p className="mt-2 text-lg font-medium text-white">
                  Your weakest concept is{" "}
                  <span className="text-teal-300">
                    {results.masteryList[0].concept}
                  </span>
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  Current mastery: {results.masteryList[0].score}%.
                  Strengthening this concept could improve your overall mastery.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      selectConcept(results.masteryList[0].concept);
                      router.push("/tutor");
                    }}
                    className="rounded-full bg-teal-300 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-teal-200"
                  >
                    Teach Me
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      selectConcept(results.masteryList[0].concept);
                      router.push("/practice");
                    }}
                    className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-200 hover:bg-white/5"
                  >
                    Practice Now
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={restart}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-200 hover:bg-white/5"
              >
                Retake Diagnostic
              </button>
              <button
                type="button"
                onClick={() => router.push("/weaknesses")}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-200 hover:bg-white/5"
              >
                View Weaknesses
              </button>
              <button
                type="button"
                onClick={() => router.push("/analytics")}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-200 hover:bg-white/5"
              >
                View Analytics
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
