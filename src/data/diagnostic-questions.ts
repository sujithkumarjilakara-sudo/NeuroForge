/**
 * diagnostic-questions.ts — Expanded diagnostic quiz for CMOS VLSI.
 *
 * 12 questions covering 8 concepts:
 *   MOSFET, CMOS Inverter, Lambda Rules, Metal Spacing,
 *   Contacts, Layout, SRAM, Sequential Circuits
 */

import type { Difficulty } from "@/lib/learning-context";

export type DiagnosticQuestion = {
  id: string;
  concept: string;
  difficulty: Difficulty;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export const CONCEPTS = [
  "MOSFET",
  "CMOS Inverter",
  "Lambda Rules",
  "Metal Spacing",
  "Contacts",
  "Layout",
  "SRAM",
  "Sequential Circuits",
] as const;

export type ConceptName = (typeof CONCEPTS)[number];

export const diagnosticQuestions: DiagnosticQuestion[] = [
  // ── MOSFET ──────────────────────────────────
  {
    id: "dq-1",
    concept: "MOSFET",
    difficulty: "medium",
    prompt:
      "In saturation, first-order long-channel NMOS drain current depends on VGS as:",
    options: [
      "Linear in (VGS − Vt)",
      "Quadratic in (VGS − Vt)",
      "Independent of VGS",
      "Exponential in VDS",
    ],
    answerIndex: 1,
    explanation:
      "The Shockley model gives ID = 0.5 μn Cox (W/L) (VGS − Vt)² in saturation.",
  },
  {
    id: "dq-2",
    concept: "MOSFET",
    difficulty: "easy",
    prompt: "The threshold voltage Vt of an NMOS transistor increases with:",
    options: [
      "Increasing substrate doping concentration",
      "Decreasing oxide thickness",
      "Increasing drain voltage",
      "Decreasing channel length",
    ],
    answerIndex: 0,
    explanation:
      "Higher substrate (body) doping widens the depletion region and raises Vt through the body-effect term.",
  },

  // ── CMOS Inverter ───────────────────────────
  {
    id: "dq-3",
    concept: "CMOS Inverter",
    difficulty: "medium",
    prompt:
      "For a symmetric CMOS inverter with equal rise and fall times, which statement is correct?",
    options: [
      "NMOS and PMOS widths should be equal.",
      "PMOS is typically sized wider to compensate for lower hole mobility.",
      "NMOS must always be twice as wide as PMOS.",
      "Threshold voltages must be identical and device widths do not matter.",
    ],
    answerIndex: 1,
    explanation:
      "Hole mobility is ~2-3× lower than electron mobility, so PMOS is widened so pull-up strength matches NMOS pull-down.",
  },

  // ── Lambda Rules ────────────────────────────
  {
    id: "dq-4",
    concept: "Lambda Rules",
    difficulty: "easy",
    prompt: "In lambda-based design rules, 'lambda' (λ) represents:",
    options: [
      "Half the minimum channel length of the process",
      "The metal pitch",
      "The oxide thickness",
      "The threshold voltage",
    ],
    answerIndex: 0,
    explanation:
      "Lambda is a technology-independent unit equal to half the minimum feature size. All layout spacings are expressed as multiples of λ.",
  },
  {
    id: "dq-5",
    concept: "Lambda Rules",
    difficulty: "medium",
    prompt: "The minimum width for a polysilicon line in a typical lambda-based rule set is:",
    options: ["1λ", "2λ", "3λ", "4λ"],
    answerIndex: 1,
    explanation:
      "Most standard lambda rule sets specify the minimum poly width as 2λ to ensure reliable patterning.",
  },

  // ── Metal Spacing ───────────────────────────
  {
    id: "dq-6",
    concept: "Metal Spacing",
    difficulty: "medium",
    prompt:
      "Minimum metal-1 spacing in a lambda rule set is typically:",
    options: ["2λ", "3λ", "4λ", "5λ"],
    answerIndex: 1,
    explanation:
      "Standard MOSIS/SCMOS rules set minimum Metal-1 spacing at 3λ to avoid shorts and ensure manufacturable spacing.",
  },
  {
    id: "dq-7",
    concept: "Metal Spacing",
    difficulty: "hard",
    prompt:
      "If the minimum metal spacing is violated in a layout, the most likely fabrication failure is:",
    options: [
      "Threshold voltage shift",
      "Short circuit between adjacent wires",
      "Gate oxide breakdown",
      "Electromigration",
    ],
    answerIndex: 1,
    explanation:
      "Insufficient spacing between metal lines leads to bridging defects and short circuits during lithography/etch.",
  },

  // ── Contacts ────────────────────────────────
  {
    id: "dq-8",
    concept: "Contacts",
    difficulty: "easy",
    prompt: "In CMOS layout, a contact connects:",
    options: [
      "Metal-1 to polysilicon or diffusion",
      "Two metal layers to each other",
      "Substrate to the gate",
      "N-well to polysilicon",
    ],
    answerIndex: 0,
    explanation:
      "Contacts are vertical connections from Metal-1 down to polysilicon or active/diffusion. Via connects metal layers to each other.",
  },

  // ── Layout ──────────────────────────────────
  {
    id: "dq-9",
    concept: "Layout",
    difficulty: "medium",
    prompt:
      "An Euler path through a CMOS gate graph is used to find:",
    options: [
      "Minimum transistor count",
      "Optimal ordering of transistors for unbroken diffusion strips",
      "The critical timing path",
      "Power dissipation",
    ],
    answerIndex: 1,
    explanation:
      "An Euler path traversal identifies a transistor ordering where source/drain nodes can be shared, yielding compact diffusion strips.",
  },

  // ── SRAM ────────────────────────────────────
  {
    id: "dq-10",
    concept: "SRAM",
    difficulty: "medium",
    prompt: "Static noise margin (SNM) of a 6T SRAM cell is measured as:",
    options: [
      "The bitline voltage swing during read",
      "The side of the largest square nested in the butterfly curve",
      "Wordline pulse width",
      "The ratio of pull-up to access transistor only",
    ],
    answerIndex: 1,
    explanation:
      "SNM is extracted from the overlapping voltage transfer curves (butterfly plot) of the two cross-coupled inverters.",
  },
  {
    id: "dq-11",
    concept: "SRAM",
    difficulty: "hard",
    prompt:
      "To improve read stability of a 6T SRAM cell, the designer should:",
    options: [
      "Increase the access transistor width relative to pull-down",
      "Increase the pull-down transistor width relative to access transistor",
      "Increase the PMOS pull-up width only",
      "Decrease VDD",
    ],
    answerIndex: 1,
    explanation:
      "Read stability improves by making pull-down (driver) stronger than access transistor, increasing the cell ratio (CR = Wdriver / Waccess).",
  },

  // ── Sequential Circuits ─────────────────────
  {
    id: "dq-12",
    concept: "Sequential Circuits",
    difficulty: "hard",
    prompt: "Hold-time violations are most directly aggravated by:",
    options: [
      "Long combinational delay on the launching path",
      "Clock delay to the launching flop much larger than to the capturing flop",
      "Clock delay to the capturing flop much larger than to the launching flop",
      "Higher VDD",
    ],
    answerIndex: 2,
    explanation:
      "If the capture clock arrives late relative to the launch clock, data can race through and violate hold. Positive skew at the capture flop helps setup but hurts hold.",
  },
];

/**
 * Return all unique concepts present in the diagnostic question bank.
 */
export function diagnosticConcepts(): string[] {
  return [...new Set(diagnosticQuestions.map((q) => q.concept))];
}
