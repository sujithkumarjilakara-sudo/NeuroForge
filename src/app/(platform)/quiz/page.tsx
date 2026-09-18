"use client";

import { useState } from "react";
import { quizQuestions } from "@/data/cmos-vlsi";

export default function QuizPage() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const question = quizQuestions[index];
  const total = quizQuestions.length;

  function submit() {
    if (selected === null || !question) return;
    if (!revealed) {
      if (selected === question.answerIndex) setScore((value) => value + 1);
      setRevealed(true);
      return;
    }
    if (index + 1 >= total) {
      setDone(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    setRevealed(false);
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setDone(false);
  }

  return (
    <>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold text-white">Quiz</h1>
        <p className="mt-2 text-sm text-zinc-400">
          CMOS VLSI practice set · {total} questions · explanations after each item
        </p>

        {done ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-[#10151f] p-8 text-center">
            <p className="text-sm text-zinc-400">Session complete</p>
            <p className="mt-2 text-4xl font-semibold text-white">
              {score}/{total}
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              {Math.round((score / total) * 100)}% accuracy
            </p>
            <button
              type="button"
              onClick={restart}
              className="mt-6 rounded-full bg-teal-300 px-5 py-2.5 text-sm font-medium text-zinc-950"
            >
              Retry quiz
            </button>
          </div>
        ) : question ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-[#10151f] p-6 sm:p-8">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Question {index + 1} of {total}
            </p>
            <h2 className="mt-3 text-xl font-medium leading-8 text-white">
              {question.prompt}
            </h2>
            <div className="mt-6 space-y-3">
              {question.options.map((option, optionIndex) => {
                const isCorrect = optionIndex === question.answerIndex;
                const isPicked = selected === optionIndex;
                let tone = "border-white/10 hover:bg-white/5";
                if (revealed && isCorrect) tone = "border-emerald-400/50 bg-emerald-400/10";
                else if (revealed && isPicked) tone = "border-rose-400/40 bg-rose-400/10";
                else if (isPicked) tone = "border-teal-300/50 bg-teal-300/10";

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={revealed}
                    onClick={() => setSelected(optionIndex)}
                    className={`block w-full rounded-2xl border px-4 py-3 text-left text-sm text-zinc-200 ${tone}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {revealed ? (
              <p className="mt-5 text-sm leading-6 text-zinc-300">{question.explanation}</p>
            ) : null}
            <button
              type="button"
              onClick={submit}
              disabled={selected === null}
              className="mt-6 rounded-full bg-teal-300 px-5 py-2.5 text-sm font-medium text-zinc-950 disabled:opacity-40"
            >
              {revealed ? (index + 1 >= total ? "See score" : "Next question") : "Check answer"}
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
