import { z } from "zod";
import { DocumentKnowledgeSchema } from "@/lib/document-knowledge";

// Re-export for convenience
export { DocumentKnowledgeSchema };

export const DifficultySchema = z.enum(["easy", "medium", "hard", "advanced"]);

export const ConceptSchema = z.object({
  name: z.string(),
  description: z.string(),
  difficulty: DifficultySchema,
  prerequisites: z.array(z.string()).default([]),
  definitions: z.array(z.string()).optional(),
  formulas: z.array(z.string()).optional(),
  examples: z.array(z.string()).optional(),
});

export const DocumentAnalysisSchema = z.object({
  title: z.string(),
  subject: z.string(),
  summary: z.string(),
  concepts: z.array(ConceptSchema),
});

export const GeneratedQuestionSchema = z.object({
  id: z.string(),
  concept: z.string(),
  chapterId: z.string().optional(),
  topicId: z.string().optional(),
  conceptId: z.string().optional(),
  difficulty: DifficultySchema,
  prompt: z.string(),
  options: z.array(z.string()).length(4),
  answerIndex: z.number().int().min(0).max(3),
  explanation: z.string(),
});

export const GeneratedQuizSchema = z.array(GeneratedQuestionSchema);

export const FlashcardSchema = z.object({
  id: z.string(),
  concept: z.string(),
  front: z.string(),
  back: z.string(),
});

export const GeneratedFlashcardsSchema = z.array(FlashcardSchema);

export const StudyPlanItemSchema = z.object({
  concept: z.string(),
  focus: z.string(),
  minutes: z.number().int().positive(),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
});

export const GeneratedStudyPlanSchema = z.array(StudyPlanItemSchema);

export const TutorResponseSchema = z.object({
  content: z.string(),
});

// Inferred types
export type DocumentAnalysis = z.infer<typeof DocumentAnalysisSchema>;
export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;
export type GeneratedQuiz = z.infer<typeof GeneratedQuizSchema>;
export type GeneratedFlashcard = z.infer<typeof FlashcardSchema>;
export type GeneratedStudyPlanItem = z.infer<typeof StudyPlanItemSchema>;
export type DocumentKnowledge = z.infer<typeof DocumentKnowledgeSchema>;
