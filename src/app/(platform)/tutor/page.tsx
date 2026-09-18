"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLearning } from "@/lib/learning-context";
import { getTutorIntro, getTutorResponse, TUTOR_MODES } from "@/data/tutor-content";
import type { TutorMode } from "@/data/tutor-content";
import ReactMarkdown from "react-markdown";
import { generateTutorResponseAction } from "@/actions/ai-actions";

type Message = {
  role: "tutor" | "student";
  content: string;
};

export default function TutorPage() {
  const router = useRouter();
  const { state, addHistory } = useLearning();
  const concept = state.selectedConcept;
  const activeDoc = state.activeDocument;
  const mastery = concept ? (state.mastery[concept] ?? 0) : 0;

  const initialIntro = useMemo(() => {
    if (concept) {
      return activeDoc
        ? `Hello! I'm your NeuroForge AI Tutor, configured with material from **"${activeDoc.title}"** (${activeDoc.subject}). Let's work on **${concept}** (your current estimated mastery is ${mastery}%). How would you like to learn today?`
        : getTutorIntro(concept, mastery);
    }
    return activeDoc
      ? `Welcome to the NeuroForge AI Tutor for **"${activeDoc.title}"**. Select a concept from the Course page or Knowledge Map to begin.`
      : "Welcome to the NeuroForge AI Tutor. Please select a concept from the Dashboard or Knowledge Map to begin, or take the Diagnostic Quiz if you haven't yet.";
  }, [concept, mastery, activeDoc]);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "tutor",
      content: initialIntro,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleMode = async (mode: TutorMode, label: string) => {
    if (!concept || isLoading) return;
    
    const userMsg: Message = { role: "student", content: label };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let tutorText = "";
    if (activeDoc?.extractedText) {
      const historyStrings = messages.map((m) => `${m.role}: ${m.content}`);
      const res = await generateTutorResponseAction(
        concept,
        mastery,
        mode,
        historyStrings,
        activeDoc.extractedText,
        activeDoc.subject
      );
      if (res.success && res.data?.content) {
        tutorText = res.data.content;
      }
    }

    if (!tutorText) {
      tutorText = getTutorResponse(concept, mode);
    }

    setMessages((prev) => [...prev, { role: "tutor", content: tutorText }]);
    setIsLoading(false);
    
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    addHistory({
      timestamp: now,
      activity: "tutor",
      concept,
      score: 100,
      previousMastery: mastery,
      newMastery: mastery,
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !concept || isLoading) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "student", content: userText }]);
    setIsLoading(true);

    let tutorText = "";
    if (activeDoc?.extractedText) {
      const historyStrings = [...messages, { role: "student", content: userText }].map(
        (m) => `${m.role}: ${m.content}`
      );
      const res = await generateTutorResponseAction(
        concept,
        mastery,
        `Question: ${userText}`,
        historyStrings,
        activeDoc.extractedText,
        activeDoc.subject
      );
      if (res.success && res.data?.content) {
        tutorText = res.data.content;
      }
    }

    if (!tutorText) {
      tutorText =
        "I couldn't generate an AI response from the uploaded study material. Please check that the Gemini API key is configured for this deployment and try again.";
    }

    setMessages((prev) => [...prev, { role: "tutor", content: tutorText }]);
    setIsLoading(false);
  };

  return (
    <>
      <div className="mx-auto flex max-w-4xl flex-col h-[calc(100vh-10rem)]">
        <div>
          <h1 className="text-3xl font-semibold text-white">AI Tutor</h1>
          {concept ? (
             <p className="mt-2 text-sm text-zinc-400">
              Focusing on <span className="text-teal-300">{concept}</span> · Current mastery: {mastery}%
              {activeDoc && <span className="ml-2 text-xs text-teal-400/80">({activeDoc.title})</span>}
            </p>
          ) : (
            <p className="mt-2 text-sm text-zinc-400">
              Select a concept to start learning.
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#10151f]">
          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                  m.role === "tutor"
                    ? "self-start bg-teal-400/10 text-teal-50 border border-teal-400/20"
                    : "self-end ml-auto bg-white/10 text-zinc-100"
                }`}
              >
                {m.role === "tutor" ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  m.content
                )}
              </div>
            ))}
            {isLoading && (
              <div className="self-start rounded-2xl bg-teal-400/10 px-5 py-3.5 text-sm text-teal-300 animate-pulse border border-teal-400/20">
                NeuroForge AI Tutor is thinking...
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Controls */}
          <div className="border-t border-white/10 bg-[#0d1320] p-4">
            {concept ? (
              <>
                <div className="mb-4 flex flex-wrap gap-2">
                  {TUTOR_MODES.map((mode) => (
                    <button
                      key={mode.mode}
                      disabled={isLoading}
                      onClick={() => handleMode(mode.mode, mode.label)}
                      className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                      <span>{mode.icon}</span>
                      {mode.label}
                    </button>
                  ))}
                </div>
                <form onSubmit={handleSend} className="flex gap-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask a question about ${concept}...`}
                    disabled={isLoading}
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-zinc-500 focus:border-teal-400/50 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="rounded-2xl bg-teal-300 px-6 py-3 text-sm font-semibold text-zinc-950 disabled:opacity-50"
                  >
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                 <button
                    onClick={() => router.push("/diagnostic")}
                    className="rounded-full bg-teal-300 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-teal-200"
                  >
                    Take Diagnostic Quiz
                  </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
