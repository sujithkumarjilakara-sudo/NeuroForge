"use server";

import { GoogleGenAI } from "@google/genai";
import { extractTextFromPdf } from "@/lib/document-parser";
import { DocumentKnowledgeSchema } from "@/lib/document-knowledge";
import type { DocumentKnowledge } from "@/lib/document-knowledge";
import type { Difficulty } from "@/lib/learning-context";
import {
  DocumentAnalysisSchema,
  GeneratedQuizSchema,
  GeneratedFlashcardsSchema,
  GeneratedStudyPlanSchema,
  TutorResponseSchema,
} from "@/lib/ai-schemas";

// Initialize Gemini if API key is present
const getAi = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");
  return new GoogleGenAI({ apiKey });
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// ───────────────────────────────────────────────
// Server Actions
// ───────────────────────────────────────────────

/**
 * 1. Process PDF upload — extract text from PDF binary
 */
export async function processDocumentUploadAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");
    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      throw new Error("Invalid file type. Only PDF is supported.");
    }
    if (file.size === 0) {
      throw new Error("Uploaded file is empty (0 bytes).");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`[PDF Upload Action] Processing "${file.name}" (${file.size} bytes)...`);
    const parsed = await extractTextFromPdf(buffer);

    return { success: true, text: parsed.text, pageCount: parsed.pageCount };
  } catch (error: unknown) {
    console.error("[PDF Upload Action Error]:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * 2. Analyze document — quick analysis for title, subject, summary, concepts
 */
export async function analyzeDocumentAction(text: string) {
  try {
    const ai = getAi();
    const safeText = text.slice(0, 150000);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following educational material and extract the core concepts being taught. Provide a title, subject, a brief summary, and a list of key concepts. Each concept should have a name, description, estimated difficulty (easy, medium, hard, or advanced), and any prerequisite concepts mentioned.

      Document text:
      ${safeText}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text ?? "{}";
    const parsedResponse = DocumentAnalysisSchema.parse(JSON.parse(jsonText));
    return { success: true, data: parsedResponse };
  } catch (error: unknown) {
    console.error("AI Analysis error:", error);
    return { success: false, error: getErrorMessage(error) || "Failed to analyze document" };
  }
}

/**
 * 3. Extract hierarchical document knowledge — chapters → topics → concepts
 *    Chunks large PDFs at ~150k characters and merges results.
 */
export async function extractDocumentKnowledgeAction(text: string): Promise<{
  success: boolean;
  knowledge?: DocumentKnowledge;
  error?: string;
}> {
  try {
    const CHUNK_SIZE = 150000;
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += CHUNK_SIZE) {
      chunks.push(text.slice(i, i + CHUNK_SIZE));
    }

    const allChapters: DocumentKnowledge["chapters"] = [];
    let title = "";
    let subject = "";
    let summary = "";

    const ai = getAi();

    for (let ci = 0; ci < chunks.length; ci++) {
      const chunk = chunks[ci];
      console.log(`[Knowledge Extraction] Processing chunk ${ci + 1}/${chunks.length} (${chunk.length} chars)...`);

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are analyzing an educational PDF document. Extract the hierarchical knowledge structure from this text.

Return a JSON object with this exact structure:
{
  "title": "Document title",
  "subject": "Subject area",
  "summary": "Brief summary of content",
  "chapters": [
    {
      "id": "ch-1",
      "title": "Chapter/Unit title",
      "description": "Brief chapter description",
      "topics": [
        {
          "id": "t-1-1",
          "title": "Topic title",
          "description": "Topic description",
          "concepts": [
            {
              "id": "c-1-1-1",
              "name": "Concept name",
              "description": "Concept explanation",
              "difficulty": "easy|medium|hard|advanced",
              "prerequisites": []
            }
          ]
        }
      ]
    }
  ]
}

IMPORTANT:
- Extract ALL chapters/units/sections you can identify, not just the first few.
- Each chapter should have multiple topics with multiple concepts.
- Use short unique IDs like "ch-1", "t-1-1", "c-1-1-1".
- difficulty must be one of: "easy", "medium", "hard", "advanced".
- Include definitions, key formulas, and important facts as concept descriptions.
- If the text doesn't have explicit chapter divisions, create logical groupings by subject area.

Text chunk ${ci + 1} of ${chunks.length}:
${chunk}`,
        config: { responseMimeType: "application/json" },
      });

      const jsonText = response.text ?? "{}";
      const parsed = DocumentKnowledgeSchema.parse(JSON.parse(jsonText));
      if (!title && parsed.title) title = parsed.title;
      if (!subject && parsed.subject) subject = parsed.subject;
      if (!summary && parsed.summary) summary = parsed.summary;
      if (parsed.chapters) allChapters.push(...parsed.chapters);
    }

    // Deduplicate chapters by title (merge topics from same-named chapters)
    const chapterMap = new Map<string, DocumentKnowledge["chapters"][0]>();
    for (const ch of allChapters) {
      const key = ch.title.toLowerCase().trim();
      if (chapterMap.has(key)) {
        const existing = chapterMap.get(key)!;
        // Merge topics, avoiding duplicates by title
        const existingTopicTitles = new Set(existing.topics.map((t) => t.title.toLowerCase()));
        for (const topic of ch.topics) {
          if (!existingTopicTitles.has(topic.title.toLowerCase())) {
            existing.topics.push(topic);
          }
        }
      } else {
        chapterMap.set(key, { ...ch });
      }
    }

    const merged: DocumentKnowledge = {
      title: title || "Untitled Document",
      subject: subject || "General",
      summary: summary || "Document analysis complete.",
      chapters: Array.from(chapterMap.values()),
    };

    console.log(`[Knowledge Extraction] Complete: ${merged.chapters.length} chapters, ${merged.chapters.reduce((sum, ch) => sum + ch.topics.length, 0)} topics`);

    return { success: true, knowledge: merged };
  } catch (error: unknown) {
    console.error("extractDocumentKnowledgeAction error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * 4. Generate hierarchical quiz — 20 questions with mixed difficulty
 *    5 Easy, 8 Medium, 5 Hard, 2 Advanced
 */
export async function generateHierarchicalQuizAction(
  documentText: string,
  scope: {
    type: "document" | "chapter" | "topic";
    title: string;
    conceptNames: string[];
  },
) {
  try {
    const ai = getAi();
    const safeText = documentText.slice(0, 80000);

    const scopeLabel =
      scope.type === "document"
        ? "the entire document"
        : scope.type === "chapter"
          ? `the chapter "${scope.title}"`
          : `the topic "${scope.title}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate exactly 20 multiple-choice questions covering ${scopeLabel}.
The questions should test these concepts: ${scope.conceptNames.join(", ")}.

DIFFICULTY DISTRIBUTION (MANDATORY — follow exactly):
- 5 questions with difficulty "easy"
- 8 questions with difficulty "medium"
- 5 questions with difficulty "hard"
- 2 questions with difficulty "advanced"

Each question must have:
- id: unique string like "hq-1", "hq-2", etc.
- concept: the specific concept being tested
- chapterId: chapter ID if applicable (or empty string)
- topicId: topic ID if applicable (or empty string)
- conceptId: concept ID if applicable (or empty string)
- difficulty: exactly one of "easy", "medium", "hard", "advanced"
- prompt: clear question text
- options: array of exactly 4 answer choices
- answerIndex: index (0-3) of the correct answer
- explanation: why the answer is correct

Return a JSON array of 20 question objects.

Source material:
${safeText}`,
      config: { responseMimeType: "application/json" },
    });

    const jsonText = response.text ?? "[]";
    const parsed = GeneratedQuizSchema.parse(JSON.parse(jsonText));
    return { success: true, data: parsed };
  } catch (error: unknown) {
    console.error("generateHierarchicalQuizAction error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * 5. Generate quiz (legacy — kept for backward compatibility)
 */
export async function generateQuizAction(concepts: string[], documentText: string, count: number = 20) {
  try {
    const ai = getAi();
    const safeText = documentText.slice(0, 50000);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${count} multiple choice questions based on the following text, focusing on these concepts: ${concepts.join(", ")}.

      Return a JSON array where each object has:
      - id: unique string
      - concept: the concept being tested
      - difficulty: "easy", "medium", "hard" or "advanced"
      - prompt: question text
      - options: array of 4 answers
      - answerIndex: index of correct answer
      - explanation: why correct

      Text: ${safeText}`,
      config: { responseMimeType: "application/json" },
    });
    const jsonText = response.text ?? "[]";
    const parsedResponse = GeneratedQuizSchema.parse(JSON.parse(jsonText));
    return { success: true, data: parsedResponse };
  } catch (error: unknown) {
    console.error("AI Quiz generation error:", error);
    return { success: false, error: getErrorMessage(error) || "Failed to generate quiz" };
  }
}

/**
 * 6. Generate tutor response
 */
export async function generateTutorResponseAction(
  concept: string,
  mastery: number,
  mode: string,
  history: string[],
  documentText: string,
  subject?: string
) {
  try {
    const ai = getAi();
    const safeText = documentText ? documentText.slice(0, 50000) : "";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an AI Tutor named NeuroForge. The student is asking about the concept "${concept}" ${subject ? `in the subject of "${subject}"` : ""}.
      Their current estimated mastery of this concept is ${mastery}%.
      The student has requested to learn using this approach/mode: "${mode}".
      
      ${safeText ? `Base your explanation heavily on the following course material:\n${safeText}\n` : ""}
      
      Recent conversation history:
      ${history.join("\n")}
      
      Provide a helpful, educational response. Return JSON with a single "content" field containing your response text. Use markdown for formatting.`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text ?? "{}";
    const parsedResponse = TutorResponseSchema.parse(JSON.parse(jsonText));
    return { success: true, data: parsedResponse };
  } catch (error: unknown) {
    console.error("AI Tutor error:", error);
    return { success: false, error: getErrorMessage(error) || "Failed to generate tutor response" };
  }
}

/**
 * 7. Generate targeted practice questions
 */
export async function generatePracticeAction(concept: string, difficulty: Difficulty, count: number, documentText: string) {
  try {
    const ai = getAi();
    const safeText = documentText ? documentText.slice(0, 50000) : "";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${count} ${difficulty} difficulty multiple choice questions focused on the concept: "${concept}".
      
      ${safeText ? `Ensure the questions are aligned with this source material:\n${safeText}\n` : ""}
      
      Return a JSON array where each object has:
      - id: a unique string like "pract-q1"
      - concept: "${concept}"
      - difficulty: "${difficulty}"
      - prompt: the question text
      - options: array of 4 possible answers
      - answerIndex: the index (0-3) of the correct answer
      - explanation: why the answer is correct`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text ?? "[]";
    const parsedResponse = GeneratedQuizSchema.parse(JSON.parse(jsonText));
    return { success: true, data: parsedResponse };
  } catch (error: unknown) {
    console.error("AI Practice generation error:", error);
    return { success: false, error: getErrorMessage(error) || "Failed to generate practice" };
  }
}

/**
 * 8. Generate targeted practice for weak concepts — 20 questions mixed difficulty
 */
export async function generateTargetedPracticeAction(
  weakConcepts: { name: string; mastery: number }[],
  documentText: string,
) {
  try {
    const ai = getAi();
    const safeText = documentText.slice(0, 80000);
    const conceptList = weakConcepts.map((c) => `${c.name} (mastery: ${c.mastery}%)`).join(", ");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate exactly 20 targeted practice questions for a student who is weak in these concepts: ${conceptList}.

Prioritize concepts with lower mastery scores — generate more questions for weaker concepts.

DIFFICULTY DISTRIBUTION (MANDATORY):
- 5 questions with difficulty "easy"
- 8 questions with difficulty "medium"  
- 5 questions with difficulty "hard"
- 2 questions with difficulty "advanced"

Each question must have:
- id: unique string like "tp-1", "tp-2", etc.
- concept: the specific concept being tested
- difficulty: exactly one of "easy", "medium", "hard", "advanced"
- prompt: clear question text
- options: array of exactly 4 answer choices
- answerIndex: index (0-3) of the correct answer
- explanation: why the answer is correct

Return a JSON array of 20 question objects.

Source material:
${safeText}`,
      config: { responseMimeType: "application/json" },
    });

    const jsonText = response.text ?? "[]";
    const parsed = GeneratedQuizSchema.parse(JSON.parse(jsonText));
    return { success: true, data: parsed };
  } catch (error: unknown) {
    console.error("generateTargetedPracticeAction error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * 9. Generate flashcards
 */
export async function generateFlashcardsAction(concepts: string[], documentText: string, count: number = 10) {
  try {
    const ai = getAi();
    const safeText = documentText.slice(0, 50000);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${count} study flashcards based on the following text focusing on concepts: ${concepts.join(", ")}.
      
      Return a JSON array where each object has:
      - id: unique string like "fc-1"
      - concept: concept name
      - front: clear, concise term or question for front of card
      - back: comprehensive explanation or answer for back of card

      Text: ${safeText}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text ?? "[]";
    const parsedResponse = GeneratedFlashcardsSchema.parse(JSON.parse(jsonText));
    return { success: true, data: parsedResponse };
  } catch (error: unknown) {
    console.error("AI Flashcard generation error:", error);
    return { success: false, error: getErrorMessage(error) || "Failed to generate flashcards" };
  }
}

/**
 * 10. Generate study plan
 */
export async function generateStudyPlanAction(
  concepts: string[],
  masteryMap: Record<string, number>,
  documentText: string
) {
  try {
    const ai = getAi();
    const safeText = documentText.slice(0, 40000);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a customized adaptive study plan for a student based on these concepts and their current mastery scores (0-100%):
      ${JSON.stringify(masteryMap)}

      Concepts list: ${concepts.join(", ")}

      Return a JSON array of study tasks where each object has:
      - concept: string concept name
      - focus: recommended focus area or strategy
      - minutes: estimated study duration in minutes (e.g. 15, 30, 45)
      - priority: "high", "medium", or "low" (prioritize weak concepts with lower mastery scores)

      Course Material context: ${safeText}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text ?? "[]";
    const parsedResponse = GeneratedStudyPlanSchema.parse(JSON.parse(jsonText));
    return { success: true, data: parsedResponse };
  } catch (error: unknown) {
    console.error("AI Study Plan generation error:", error);
    return { success: false, error: getErrorMessage(error) || "Failed to generate study plan" };
  }
}
