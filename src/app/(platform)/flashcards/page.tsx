"use client";

import { useState } from "react";
import { flashcards as cmosFlashcards } from "@/data/cmos-vlsi";
import { useLearning } from "@/lib/learning-context";
import { generateFlashcardsAction } from "@/actions/ai-actions";

export default function FlashcardsPage() {
  const { state, setDocumentFlashcards } = useLearning();
  const activeDoc = state.activeDocument;

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeCards = activeDoc?.generatedFlashcards && activeDoc.generatedFlashcards.length > 0
    ? activeDoc.generatedFlashcards
    : null;

  const cardsList = activeCards || cmosFlashcards;
  const card = cardsList[index];

  function next(delta: number) {
    setFlipped(false);
    setIndex((current) => (current + delta + cardsList.length) % cardsList.length);
  }

  const handleGenerateFlashcards = async () => {
    if (!activeDoc) return;
    try {
      setError(null);
      setIsGenerating(true);

      const conceptNames = activeDoc.concepts.map((c) => c.name);
      const res = await generateFlashcardsAction(conceptNames, activeDoc.extractedText, 10);

      if (res.success && res.data && res.data.length > 0) {
        setDocumentFlashcards(res.data);
        setIndex(0);
        setFlipped(false);
      } else {
        // Fallback flashcards generation
        const fallbackCards = activeDoc.concepts.map((c, i) => ({
          id: `fc-doc-${i}`,
          concept: c.name,
          front: `What is the core principle of ${c.name}?`,
          back: `${c.description}. (Extracted from ${activeDoc.title})`,
        }));
        setDocumentFlashcards(fallbackCards);
        setIndex(0);
        setFlipped(false);
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to generate flashcards");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-xl text-center space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">Flashcards</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {activeDoc
              ? `Study cards for "${activeDoc.title}" (${cardsList.length} cards)`
              : `${index + 1} / ${cardsList.length} · tap the card to reveal`}
          </p>
        </div>

        {/* Generate Flashcards banner for custom document if not generated yet */}
        {activeDoc && !activeCards && (
          <div className="rounded-3xl border border-teal-400/30 bg-teal-400/10 p-6 text-center space-y-4">
            <h3 className="text-lg font-medium text-white">
              Generate Custom Flashcards for {activeDoc.title}
            </h3>
            <p className="text-xs text-zinc-300">
              NeuroForge AI will create ~10 flashcards tailored to concepts extracted from your document.
            </p>
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateFlashcards}
              className="rounded-full bg-teal-300 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-teal-200 disabled:opacity-50"
            >
              {isGenerating ? "Generating Flashcards (Gemini)..." : "Generate Flashcards"}
            </button>
            {error && <p className="text-xs text-rose-400">{error}</p>}
          </div>
        )}

        {card ? (
          <button
            type="button"
            onClick={() => setFlipped((value) => !value)}
            className="min-h-60 w-full rounded-[2rem] border border-white/10 bg-[#10151f] p-8 text-left transition hover:border-teal-400/30 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-teal-300/80">
                  {flipped ? "Answer / Explanation" : "Question / Concept"}
                </span>
                {"concept" in card && (
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-400">
                    {card.concept}
                  </span>
                )}
              </div>
              <p className="mt-6 text-lg leading-8 text-white">
                {flipped ? card.back : card.front}
              </p>
            </div>
            <p className="mt-8 text-xs text-zinc-500 text-center">
              Click or tap to {flipped ? "show prompt" : "flip answer"}
            </p>
          </button>
        ) : null}

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => next(-1)}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => next(1)}
            className="rounded-full bg-teal-300 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-teal-200"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
