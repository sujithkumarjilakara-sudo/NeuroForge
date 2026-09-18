"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { masteryColor, topics as cmosTopics } from "@/data/cmos-vlsi";
import { useLearning, type ActiveDocument, type ActiveDocumentQuestion } from "@/lib/learning-context";
import {
  processDocumentUploadAction,
  analyzeDocumentAction,
  generateQuizAction,
} from "@/actions/ai-actions";

export default function LearnPage() {
  const router = useRouter();
  const { state, setActiveDocument, clearActiveDocument } = useLearning();
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const activeDoc = state.activeDocument;

  const handleFileUpload = async (file: File) => {
    if (!file || (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf"))) {
      setError("Invalid file type. Please select a valid PDF document.");
      return;
    }

    const MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB limit
    if (file.size > MAX_SIZE_BYTES) {
      setError("File size exceeds 100 MB limit. PDFs larger than 100 MB are not accepted.");
      return;
    }

    try {
      setError(null);
      setIsUploading(true);
      setUploadStep("Analyzing your material...");

      const formData = new FormData();
      formData.append("file", file);

      // 1. Extract text server-side using pdf-parse
      const parseResult = await processDocumentUploadAction(formData);
      if (!parseResult.success || !parseResult.text) {
        throw new Error(parseResult.error || "Failed to extract text from PDF");
      }

      const extractedText = parseResult.text;
      setUploadStep("AI analyzing material & extracting concepts (Gemini)...");

      // 2. Analyze document with Gemini AI (or fallback locally if fails)
      let docTitle = file.name.replace(/\.pdf$/i, "");
      let docSubject = "Uploaded Study Material";
      let docSummary = "Extracted study material from uploaded PDF.";
      let docConcepts: Array<{
        name: string;
        description: string;
        difficulty: "easy" | "medium" | "hard" | "advanced";
        prerequisites: string[];
      }> = [];
      let generatedQuiz: ActiveDocumentQuestion[] = [];

      const analysisResult = await analyzeDocumentAction(extractedText);

      if (analysisResult.success && analysisResult.data) {
        docTitle = analysisResult.data.title || docTitle;
        docSubject = analysisResult.data.subject || docSubject;
        docSummary = analysisResult.data.summary || docSummary;
        docConcepts = analysisResult.data.concepts;

        setUploadStep("Generating custom diagnostic quiz (Gemini)...");
        const conceptNames = docConcepts.map((c) => c.name);
        const quizResult = await generateQuizAction(conceptNames, extractedText, 20);
        if (quizResult.success && quizResult.data) {
          generatedQuiz = quizResult.data;
        }
      } else {
        // Fallback locally if Gemini API key is missing or call fails
        console.warn("Gemini analysis unavailable, using local fallback structure:", analysisResult.error);
        const snippet = extractedText.slice(0, 500);
        docConcepts = [
          {
            name: "Core Principles",
            description: "Fundamental concepts extracted from " + file.name,
            difficulty: "easy",
            prerequisites: [],
          },
          {
            name: "Key Methods & Mechanisms",
            description: "Operational details and workflows from the material",
            difficulty: "medium",
            prerequisites: ["Core Principles"],
          },
          {
            name: "Advanced Applications",
            description: "Synthesis and problem solving based on the text",
            difficulty: "hard",
            prerequisites: ["Key Methods & Mechanisms"],
          },
        ];
        // Even if document analysis fails, generate a full 20-question
        // diagnostic from the extracted PDF text.
        setUploadStep("Generating 20-question diagnostic from extracted material...");
        const fallbackConceptNames = docConcepts.map((c) => c.name);

        const fallbackQuizResult = await generateQuizAction(
          fallbackConceptNames,
          extractedText,
          20
        );

        if (fallbackQuizResult.success && fallbackQuizResult.data?.length) {
          generatedQuiz = fallbackQuizResult.data;
        } else {
          // Last-resort fallback so the demo never has fewer than 20 questions.
          generatedQuiz = Array.from({ length: 20 }, (_, i) => ({
            id: `fallback-q${i + 1}`,
            concept: docConcepts[i % docConcepts.length]?.name || "Core Principles",
            difficulty:
              i < 5
                ? "easy"
                : i < 13
                  ? "medium"
                  : i < 18
                    ? "hard"
                    : "advanced",
            prompt:
              i === 0
                ? `What is the primary subject covered in "${file.name}"?`
                : `Question ${i + 1}: Based on the uploaded study material, which statement best represents a key idea from the document?`,
            options: [
              docSubject,
              "An unrelated topic",
              "A concept not discussed in the material",
              "None of the above",
            ],
            answerIndex: 0,
            explanation:
              `This question is based on the uploaded document "${file.name}".`,
          }));
        }
      }

      const newDoc: ActiveDocument = {
        id: "doc-" + Date.now(),
        filename: file.name,
        title: docTitle,
        subject: docSubject,
        summary: docSummary,
        extractedText,
        concepts: docConcepts,
        generatedQuiz,
      };

      setActiveDocument(newDoc);
      setUploadStep("");
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to process document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-white">Learn & Course Materials</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Upload your lecture notes, textbook chapters, or research papers. NeuroForge&apos;s AI pipeline extracts text, maps core concepts, and generates an adaptive learning program.
          </p>
        </div>

        {/* ─── UPLOAD CARD ─── */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative rounded-3xl border-2 border-dashed p-8 text-center transition ${
            dragOver
              ? "border-teal-400 bg-teal-400/10"
              : "border-white/15 bg-[#10151f] hover:border-white/30"
          }`}
        >
          {isUploading ? (
            <div className="py-6 space-y-4">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-teal-300 border-t-transparent" />
              <p className="text-sm font-medium text-teal-300">{uploadStep}</p>
              <p className="text-xs text-zinc-500">Executing server actions securely via Gemini AI...</p>
            </div>
          ) : (
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400/10 text-teal-300">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-white">
                Upload Study Material (PDF)
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Drag and drop your PDF file here, or click to browse
              </p>
              <label className="mt-4 inline-flex cursor-pointer rounded-full bg-teal-300 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-teal-200">
                <span>Select PDF File</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </label>
              {error && (
                <p className="mt-3 text-xs text-rose-400 font-medium">{error}</p>
              )}
            </div>
          )}
        </div>

        {/* ─── ACTIVE DOCUMENT BANNER OR CMOS DEMO BANNER ─── */}
        {activeDoc ? (
          <div className="rounded-3xl border border-teal-400/30 bg-teal-400/10 p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-300">
                  <span className="h-2 w-2 rounded-full bg-teal-300 animate-pulse" />
                  Active Custom Course
                </span>
                <h2 className="mt-2 text-2xl font-bold text-white">{activeDoc.title}</h2>
                <p className="text-xs text-zinc-400">File: {activeDoc.filename} · Subject: {activeDoc.subject}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/diagnostic")}
                  className="rounded-full bg-teal-300 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-teal-200"
                >
                  Start Diagnostic Quiz
                </button>
                <button
                  type="button"
                  onClick={clearActiveDocument}
                  className="rounded-full border border-white/20 px-4 py-2.5 text-xs text-zinc-300 hover:bg-white/10"
                >
                  Clear Document
                </button>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-zinc-300 border-t border-teal-400/20 pt-4">
              {activeDoc.summary}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#10151f] p-4 text-xs text-zinc-400">
            <span>Currently showing: <strong>Default CMOS VLSI Demo Course</strong></span>
            <span>Upload a PDF above to analyze your custom material!</span>
          </div>
        )}

        {/* ─── CONCEPT MODULES LIST ─── */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            {activeDoc ? `Concepts Extracted from ${activeDoc.title}` : "CMOS VLSI Modules"}
          </h2>

          <div className="space-y-4">
            {activeDoc ? (
              activeDoc.concepts.map((concept, idx) => {
                const currentMastery = state.mastery[concept.name] ?? 0;
                return (
                  <article
                    key={idx}
                    className="rounded-3xl border border-white/10 bg-[#10151f] p-5 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="max-w-2xl">
                        <p className="text-xs uppercase tracking-wide text-teal-300/80">
                          {concept.difficulty} Difficulty
                        </p>
                        <h3 className="mt-1 text-xl font-medium text-white">{concept.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">{concept.description}</p>
                        {concept.prerequisites.length > 0 && (
                          <p className="mt-3 text-xs text-zinc-500">
                            Prerequisites: {concept.prerequisites.join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="min-w-40">
                        <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                          <span className="capitalize">Mastery</span>
                          <span>{currentMastery}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${currentMastery}%`,
                              background: masteryColor(currentMastery),
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              cmosTopics.map((topic) => (
                <article
                  key={topic.id}
                  className="rounded-3xl border border-white/10 bg-[#10151f] p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-2xl">
                      <p className="text-xs uppercase tracking-wide text-teal-300/80">
                        {topic.module}
                      </p>
                      <h2 className="mt-1 text-xl font-medium text-white">{topic.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">{topic.summary}</p>
                      <p className="mt-3 text-xs text-zinc-500">
                        {topic.hoursSpent}h studied · Last touched {topic.lastStudied}
                        {topic.prerequisites.length
                          ? ` · Requires ${topic.prerequisites.join(", ")}`
                          : ""}
                      </p>
                    </div>
                    <div className="min-w-40">
                      <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                        <span className="capitalize">{topic.level}</span>
                        <span>{topic.mastery}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${topic.mastery}%`,
                            background: masteryColor(topic.mastery),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
