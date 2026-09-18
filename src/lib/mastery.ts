/**
 * mastery.ts — Deterministic adaptive mastery engine for NeuroForge.
 *
 * Mastery formula (all values 0-100):
 *
 *   masteryScore =
 *     accuracy          × 0.50
 *   + recentPerformance × 0.20
 *   + difficultyBonus   × 0.15
 *   + consistency       × 0.15
 *
 * Classification:
 *   0–39   Needs Attention
 *   40–69  Learning
 *   70–84  Developing
 *   85–100 Mastered
 */

import type { Difficulty, QuizAttempt, PracticeAttempt } from "./learning-context";

// ───────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────

export type MasteryBand = "needs-attention" | "learning" | "developing" | "mastered";

export type ConceptMastery = {
  concept: string;
  score: number;        // 0-100
  band: MasteryBand;
  accuracy: number;     // 0-100
  attempts: number;
  recentCorrect: number;
  recentTotal: number;
};

// ───────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function bandFor(score: number): MasteryBand {
  if (score >= 85) return "mastered";
  if (score >= 70) return "developing";
  if (score >= 40) return "learning";
  return "needs-attention";
}

export function bandLabel(band: MasteryBand): string {
  switch (band) {
    case "mastered":        return "Mastered";
    case "developing":      return "Developing";
    case "learning":        return "Learning";
    case "needs-attention":  return "Needs Attention";
  }
}

export function bandColor(band: MasteryBand): string {
  switch (band) {
    case "mastered":        return "#34d399"; // emerald-400
    case "developing":      return "#5eead4"; // teal-300
    case "learning":        return "#fbbf24"; // amber-400
    case "needs-attention":  return "#f87171"; // rose-400
  }
}

const DIFFICULTY_WEIGHT: Record<Difficulty, number> = {
  easy: 0.6,
  medium: 1.0,
  hard: 1.4,
  advanced: 1.8,
};

// ───────────────────────────────────────────────
// Core calculation
// ───────────────────────────────────────────────

type Attempt = QuizAttempt | PracticeAttempt;

/**
 * Compute mastery for a single concept given all relevant attempts.
 * Returns 0 when there are no attempts.
 */
export function computeConceptMastery(
  concept: string,
  allAttempts: Attempt[],
): ConceptMastery {
  const attempts = allAttempts.filter((a) => a.concept === concept);
  if (attempts.length === 0) {
    return { concept, score: 0, band: "needs-attention", accuracy: 0, attempts: 0, recentCorrect: 0, recentTotal: 0 };
  }

  // 1) Overall accuracy (0-100)
  const correct = attempts.filter((a) => a.correct).length;
  const accuracy = (correct / attempts.length) * 100;

  // 2) Recent performance — last 5 attempts (0-100)
  const recent = attempts.slice(-5);
  const recentCorrect = recent.filter((a) => a.correct).length;
  const recentPerformance = (recentCorrect / recent.length) * 100;

  // 3) Difficulty-weighted performance (0-100)
  //    Answering harder questions correctly yields a higher score.
  let weightedCorrect = 0;
  let weightedTotal = 0;
  for (const a of attempts) {
    const w = DIFFICULTY_WEIGHT[a.difficulty];
    weightedTotal += w;
    if (a.correct) weightedCorrect += w;
  }
  const difficultyBonus = weightedTotal > 0 ? (weightedCorrect / weightedTotal) * 100 : 0;

  // 4) Consistency — ratio of correct streaks to total (0-100)
  //    A student who always gets it right is more consistent than one
  //    who alternates. We use a simple "proportion of non-flip" metric.
  let consistent = 0;
  for (let i = 1; i < attempts.length; i++) {
    if (attempts[i].correct === attempts[i - 1].correct) consistent++;
  }
  const consistency = attempts.length <= 1
    ? accuracy // fallback: treat single attempt accuracy as consistency
    : (consistent / (attempts.length - 1)) * 100;

  // Weighted sum
  const raw =
    accuracy * 0.50 +
    recentPerformance * 0.20 +
    difficultyBonus * 0.15 +
    consistency * 0.15;

  const score = Math.round(clamp(raw, 0, 100));

  return {
    concept,
    score,
    band: bandFor(score),
    accuracy: Math.round(accuracy),
    attempts: attempts.length,
    recentCorrect,
    recentTotal: recent.length,
  };
}

/**
 * Compute mastery for every concept that appears in the attempts list.
 * Returns an array sorted by mastery ascending (weakest first).
 */
export function computeAllMastery(
  concepts: string[],
  allAttempts: Attempt[],
): ConceptMastery[] {
  return concepts
    .map((c) => computeConceptMastery(c, allAttempts))
    .sort((a, b) => a.score - b.score);
}

/**
 * Return overall mastery across all concepts.
 */
export function overallMasteryFromAttempts(
  concepts: string[],
  allAttempts: Attempt[],
): number {
  const all = computeAllMastery(concepts, allAttempts);
  if (all.length === 0) return 0;
  return Math.round(all.reduce((s, c) => s + c.score, 0) / all.length);
}

/**
 * Pick the next difficulty for adaptive practice.
 * - If the last answer was correct, step up.
 * - If incorrect, step down.
 * - First question defaults to "medium".
 */
export function nextDifficulty(lastCorrect: boolean | null, current: Difficulty): Difficulty {
  if (lastCorrect === null) return "medium";
  if (lastCorrect) {
    if (current === "easy") return "medium";
    if (current === "medium") return "hard";
    return "hard";
  }
  if (current === "hard") return "medium";
  if (current === "medium") return "easy";
  return "easy";
}
