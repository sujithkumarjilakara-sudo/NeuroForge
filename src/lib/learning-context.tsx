"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DocumentKnowledge } from "@/lib/document-knowledge";

// ───────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────

export type Difficulty = "easy" | "medium" | "hard" | "advanced";

export type QuizAttempt = {
  questionId: string;
  concept: string;
  correct: boolean;
  difficulty: Difficulty;
  timestamp: number;
};

export type PracticeAttempt = {
  questionId: string;
  concept: string;
  correct: boolean;
  difficulty: Difficulty;
  timestamp: number;
};

export type LearningHistoryEntry = {
  timestamp: number;
  activity: "diagnostic-quiz" | "practice" | "reassessment" | "tutor";
  concept: string;
  score: number; // percentage 0-100
  previousMastery: number;
  newMastery: number;
};

export type ActiveDocumentConcept = {
  name: string;
  description: string;
  difficulty: Difficulty;
  prerequisites: string[];
};

export type ActiveDocumentQuestion = {
  id: string;
  concept: string;
  difficulty: Difficulty;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type ActiveDocumentFlashcard = {
  id: string;
  concept: string;
  front: string;
  back: string;
};

export type ActiveDocumentStudyPlanItem = {
  concept: string;
  focus: string;
  minutes: number;
  priority?: "high" | "medium" | "low";
};

export type ActiveDocument = {
  id: string;
  filename: string;
  title: string;
  subject: string;
  summary: string;
  extractedText: string;
  concepts: ActiveDocumentConcept[];
  generatedQuiz: ActiveDocumentQuestion[];
  generatedFlashcards?: ActiveDocumentFlashcard[];
  generatedStudyPlan?: ActiveDocumentStudyPlanItem[];
};

export type LearningState = {
  /** All diagnostic quiz attempts */
  quizAttempts: QuizAttempt[];
  /** All targeted-practice attempts */
  practiceAttempts: PracticeAttempt[];
  /** Per-concept mastery scores 0-100 */
  mastery: Record<string, number>;
  /** Learning history timeline */
  history: LearningHistoryEntry[];
  /** Whether the initial diagnostic has been completed */
  diagnosticComplete: boolean;
  /** Currently active document */
  activeDocument?: ActiveDocument;
  /** Currently selected concept for practice/tutor */
  selectedConcept?: string;
  /** Hierarchical document knowledge (chapters/topics/concepts) */
  documentKnowledge?: DocumentKnowledge;
  /** Diagnostic quiz questions */
  diagnosticQuiz?: ActiveDocumentQuestion[];
  /** Flashcards */
  flashcards?: ActiveDocumentFlashcard[];
  /** Study plan */
  studyPlan?: ActiveDocumentStudyPlanItem[];
};

// ───────────────────────────────────────────────
// Defaults
// ───────────────────────────────────────────────

const STORAGE_KEY = "neuroforge-learning-state";

const defaultState: LearningState = {
  quizAttempts: [],
  practiceAttempts: [],
  mastery: {},
  history: [],
  diagnosticComplete: false,
};

// ───────────────────────────────────────────────
// Context
// ───────────────────────────────────────────────

type LearningContextValue = {
  state: LearningState;
  /** Replace the entire state (prefer helpers below). */
  setState: React.Dispatch<React.SetStateAction<LearningState>>;
  /** Record a single diagnostic-quiz answer. */
  recordQuizAttempt: (attempt: QuizAttempt) => void;
  /** Record a batch of diagnostic-quiz answers and mark diagnostic as complete. */
  recordQuizBatch: (attempts: QuizAttempt[]) => void;
  /** Record a single targeted-practice answer. */
  recordPracticeAttempt: (attempt: PracticeAttempt) => void;
  /** Record a batch of practice answers. */
  recordPracticeBatch: (attempts: PracticeAttempt[]) => void;
  /** Set the concept the student wants to focus on next. */
  selectConcept: (concept: string) => void;
  /** Update mastery for one or more concepts. */
  updateMastery: (updates: Record<string, number>) => void;
  /** Append an entry to the learning history. */
  addHistory: (entry: LearningHistoryEntry) => void;
  /** Set or clear active document uploaded by student. */
  setActiveDocument: (doc: ActiveDocument | undefined) => void;
  clearActiveDocument: () => void;
  setDocumentFlashcards: (flashcards: ActiveDocumentFlashcard[]) => void;
  setDocumentStudyPlan: (plan: ActiveDocumentStudyPlanItem[]) => void;
  /** Set hierarchical document knowledge */
  setDocumentKnowledge: (knowledge: DocumentKnowledge) => void;
  /** Wipe everything and return to clean demo state. */
  resetLearning: () => void;
};

const LearningContext = createContext<LearningContextValue | null>(null);

// ───────────────────────────────────────────────
// Provider
// ───────────────────────────────────────────────

export function LearningProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LearningState>(() => {
    if (typeof window === "undefined") return defaultState;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as LearningState;
    } catch {
      /* ignore corrupt data */
    }

    return defaultState;
  });

  // Persist every state change.
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  /* ─── helpers ─── */

  const recordQuizAttempt = useCallback((a: QuizAttempt) => {
    setState((prev) => ({ ...prev, quizAttempts: [...prev.quizAttempts, a] }));
  }, []);

  const recordQuizBatch = useCallback((batch: QuizAttempt[]) => {
    setState((prev) => ({
      ...prev,
      quizAttempts: [...prev.quizAttempts, ...batch],
      diagnosticComplete: true,
    }));
  }, []);

  const recordPracticeAttempt = useCallback((a: PracticeAttempt) => {
    setState((prev) => ({
      ...prev,
      practiceAttempts: [...prev.practiceAttempts, a],
    }));
  }, []);

  const recordPracticeBatch = useCallback((batch: PracticeAttempt[]) => {
    setState((prev) => ({
      ...prev,
      practiceAttempts: [...prev.practiceAttempts, ...batch],
    }));
  }, []);

  const selectConcept = useCallback((concept: string) => {
    setState((prev) => ({ ...prev, selectedConcept: concept }));
  }, []);

  const updateMastery = useCallback((updates: Record<string, number>) => {
    setState((prev) => ({
      ...prev,
      mastery: { ...prev.mastery, ...updates },
    }));
  }, []);

  const addHistory = useCallback((entry: LearningHistoryEntry) => {
    setState((prev) => ({ ...prev, history: [...prev.history, entry] }));
  }, []);

  const setActiveDocument = useCallback((doc: ActiveDocument | undefined) => {
    setState((prev) => ({
      ...prev,
      activeDocument: doc,
      // Reset related knowledge fields when new document is set
      documentKnowledge: undefined,
      diagnosticQuiz: undefined,
      flashcards: undefined,
      studyPlan: undefined,
      // When a new document is activated, reset quizAttempts and mastery for fresh evaluation
      quizAttempts: [],
      practiceAttempts: [],
      mastery: {},
      diagnosticComplete: false,
      selectedConcept: doc?.concepts[0]?.name,
    }));
  }, []);

  const clearActiveDocument = useCallback(() => {
    setState((prev) => {
      const next = { ...prev };
      delete next.activeDocument;
      delete next.documentKnowledge;
      delete next.diagnosticQuiz;
      delete next.flashcards;
      delete next.studyPlan;
      return {
        ...next,
        quizAttempts: [],
        practiceAttempts: [],
        mastery: {},
        diagnosticComplete: false,
        selectedConcept: undefined,
      };
    });
  }, []);

  const setDocumentFlashcards = useCallback((flashcards: ActiveDocumentFlashcard[]) => {
    setState((prev) => {
      if (!prev.activeDocument) return prev;
      return {
        ...prev,
        activeDocument: {
          ...prev.activeDocument,
          generatedFlashcards: flashcards,
        },
      };
    });
  }, []);

  const setDocumentStudyPlan = useCallback((plan: ActiveDocumentStudyPlanItem[]) => {
    setState((prev) => {
      if (!prev.activeDocument) return prev;
      return {
        ...prev,
        activeDocument: {
          ...prev.activeDocument,
          generatedStudyPlan: plan,
        },
      };
    });
  }, []);

  const setDocumentKnowledge = useCallback((knowledge: DocumentKnowledge) => {
    setState((prev) => ({
      ...prev,
      documentKnowledge: knowledge,
    }));
  }, []);

  const resetLearning = useCallback(() => {
    setState(defaultState);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<LearningContextValue>(
    () => ({
      state,
      setState,
      recordQuizAttempt,
      recordQuizBatch,
      recordPracticeAttempt,
      recordPracticeBatch,
      selectConcept,
      updateMastery,
      addHistory,
      setActiveDocument,
      clearActiveDocument,
      setDocumentFlashcards,
      setDocumentStudyPlan,
      setDocumentKnowledge,
      resetLearning,
    }),
    [
      state,
      recordQuizAttempt,
      recordQuizBatch,
      recordPracticeAttempt,
      recordPracticeBatch,
      selectConcept,
      updateMastery,
      addHistory,
      setActiveDocument,
      clearActiveDocument,
      setDocumentFlashcards,
      setDocumentStudyPlan,
      setDocumentKnowledge,
      resetLearning,
    ],
  );

  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
}

// ───────────────────────────────────────────────
// Hook
// ───────────────────────────────────────────────

export function useLearning() {
  const ctx = useContext(LearningContext);
  if (!ctx) throw new Error("useLearning must be inside <LearningProvider>");
  return ctx;
}
