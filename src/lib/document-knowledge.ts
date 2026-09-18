import { z } from "zod";

export const DifficultySchema = z.enum(["easy", "medium", "hard", "advanced"]);

export const ConceptSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  difficulty: DifficultySchema,
  prerequisites: z.array(z.string()).default([]),
});

export const TopicSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  concepts: z.array(ConceptSchema),
});

export const ChapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  topics: z.array(TopicSchema),
});

export const DocumentKnowledgeSchema = z.object({
  title: z.string(),
  subject: z.string().optional(),
  summary: z.string().optional(),
  chapters: z.array(ChapterSchema),
});

export type Difficulty = z.infer<typeof DifficultySchema>;
export type Concept = z.infer<typeof ConceptSchema>;
export type Topic = z.infer<typeof TopicSchema>;
export type Chapter = z.infer<typeof ChapterSchema>;
export type DocumentKnowledge = z.infer<typeof DocumentKnowledgeSchema>;
