/**
 * ai-service.ts — Abstraction layer for AI functionality.
 *
 * The demo uses deterministic local implementations.
 * To connect a real LLM (e.g., Gemini), implement the AIService interface
 * and swap the provider without changing any UI code.
 */

import type { Difficulty } from "./learning-context";

// ───────────────────────────────────────────────
// Interfaces — implement these for a real AI back-end
// ───────────────────────────────────────────────

export type GeneratedQuestion = {
  id: string;
  concept: string;
  difficulty: Difficulty;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type TutorResponse = {
  content: string;
};

export interface AIService {
  /** Analyse uploaded material (PDF, etc.) and extract concepts. */
  analyzeMaterial(text: string): Promise<string[]>;

  /** Generate quiz questions for given concepts. */
  generateQuiz(concepts: string[], count: number): Promise<GeneratedQuestion[]>;

  /** Evaluate a free-text answer. */
  evaluateAnswer(question: string, answer: string, correct: string): Promise<{ correct: boolean; feedback: string }>;

  /** Generate a contextual tutor response. */
  generateTutorResponse(concept: string, mastery: number, mode: string, history: string[]): Promise<TutorResponse>;

  /** Generate targeted practice questions for a specific concept. */
  generatePractice(concept: string, difficulty: Difficulty, count: number): Promise<GeneratedQuestion[]>;

  /** Generate a study plan based on mastery data. */
  generateStudyPlan(mastery: Record<string, number>): Promise<{ concept: string; focus: string; minutes: number }[]>;
}

// ───────────────────────────────────────────────
// Local demo implementation
// ───────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-unused-vars */
export class LocalAIService implements AIService {
  async analyzeMaterial(_text: string): Promise<string[]> {
    return ["MOSFET", "CMOS Inverter", "Lambda Rules", "Metal Spacing", "Contacts", "Layout", "SRAM", "Sequential Circuits"];
  }

  async generateQuiz(_concepts: string[], _count: number): Promise<GeneratedQuestion[]> {
    // In demo mode we rely on the static question bank in diagnostic-questions.ts
    return [];
  }

  async evaluateAnswer(_question: string, answer: string, correct: string): Promise<{ correct: boolean; feedback: string }> {
    const isCorrect = answer.trim().toLowerCase() === correct.trim().toLowerCase();
    return {
      correct: isCorrect,
      feedback: isCorrect ? "Correct!" : `The correct answer is: ${correct}`,
    };
  }

  async generateTutorResponse(concept: string, mastery: number, mode: string, _history: string[]): Promise<TutorResponse> {
    // This is intentionally a stub — the real content comes from tutor-content.ts
    return {
      content: `Let me help you with ${concept} (your current mastery: ${mastery}%). Mode: ${mode}.`,
    };
  }

  async generatePractice(_concept: string, _difficulty: Difficulty, _count: number): Promise<GeneratedQuestion[]> {
    // In demo mode we rely on practice-questions.ts
    return [];
  }

  async generateStudyPlan(_mastery: Record<string, number>): Promise<{ concept: string; focus: string; minutes: number }[]> {
    return [];
  }
}

/** Singleton for the demo. Swap this for a real provider later. */
export const aiService: AIService = new LocalAIService();
