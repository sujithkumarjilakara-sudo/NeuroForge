/**
 * practice-questions.ts — Targeted practice questions per concept.
 *
 * These are DIFFERENT from the diagnostic questions so the student
 * gets fresh material during targeted practice and reassessment.
 */

import type { Difficulty } from "@/lib/learning-context";

export type PracticeQuestion = {
  id: string;
  concept: string;
  difficulty: Difficulty;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

const bank: PracticeQuestion[] = [
  // ── MOSFET ──────────────────────────────────
  { id: "pq-mos-1", concept: "MOSFET", difficulty: "easy", prompt: "The body effect in an NMOS transistor causes Vt to:", options: ["Decrease with increasing VSB", "Increase with increasing VSB", "Remain constant", "Become negative"], answerIndex: 1, explanation: "A positive source-body voltage VSB widens the depletion region and increases the threshold voltage." },
  { id: "pq-mos-2", concept: "MOSFET", difficulty: "medium", prompt: "Channel length modulation in saturation is modeled by the parameter:", options: ["μn", "Cox", "λ (lambda)", "γ (gamma)"], answerIndex: 2, explanation: "λ models the slight increase in drain current with VDS in saturation: ID ∝ (1 + λ·VDS)." },
  { id: "pq-mos-3", concept: "MOSFET", difficulty: "hard", prompt: "DIBL (Drain-Induced Barrier Lowering) is a short-channel effect that:", options: ["Increases threshold voltage", "Reduces threshold voltage as VDS increases", "Is only relevant for PMOS", "Occurs only at cryogenic temperatures"], answerIndex: 1, explanation: "In short channels, high VDS lowers the source-channel potential barrier, reducing Vt." },

  // ── CMOS Inverter ───────────────────────────
  { id: "pq-inv-1", concept: "CMOS Inverter", difficulty: "easy", prompt: "The switching threshold VM of a CMOS inverter is the input voltage where:", options: ["Output equals VDD", "Output equals 0", "Vin = Vout", "The gate current is maximum"], answerIndex: 2, explanation: "VM is defined as the point on the VTC where Vin = Vout, meaning both transistors are in saturation." },
  { id: "pq-inv-2", concept: "CMOS Inverter", difficulty: "medium", prompt: "Noise Margin High (NMH) of a CMOS inverter equals:", options: ["VOH − VIH", "VIH − VOL", "VDD − Vt", "VOL − VIL"], answerIndex: 0, explanation: "NMH = VOH − VIH measures how much noise a logic-1 signal can tolerate." },
  { id: "pq-inv-3", concept: "CMOS Inverter", difficulty: "hard", prompt: "Widening the PMOS transistor in a CMOS inverter while keeping NMOS constant will:", options: ["Lower VM toward ground", "Raise VM toward VDD", "Not affect VM", "Increase power dissipation only"], answerIndex: 1, explanation: "A stronger PMOS pull-up shifts the switching threshold higher because the inverter fights harder to maintain a high output." },

  // ── Lambda Rules ────────────────────────────
  { id: "pq-lr-1", concept: "Lambda Rules", difficulty: "easy", prompt: "Lambda-based design rules are advantageous because they are:", options: ["Process-specific", "Technology-independent and scalable", "Only applicable to digital circuits", "Used only in 90nm and below"], answerIndex: 1, explanation: "Lambda rules express spacings as multiples of λ, making layouts portable across technology nodes." },
  { id: "pq-lr-2", concept: "Lambda Rules", difficulty: "medium", prompt: "The minimum spacing between N-well and active in many lambda rule sets is:", options: ["3λ", "5λ", "6λ", "8λ"], answerIndex: 2, explanation: "N-well to active spacing is typically 6λ to prevent latchup and ensure proper isolation." },
  { id: "pq-lr-3", concept: "Lambda Rules", difficulty: "hard", prompt: "When a layout violates the minimum poly extension beyond active, the risk is:", options: ["Increased capacitance only", "Gate may not fully cover the channel, causing leakage", "Metal will short to poly", "Supply voltage drop"], answerIndex: 1, explanation: "Insufficient poly extension means the gate might not overlap the full channel width, leading to edge leakage paths." },

  // ── Metal Spacing ───────────────────────────
  { id: "pq-ms-1", concept: "Metal Spacing", difficulty: "easy", prompt: "Metal spacing rules exist primarily to prevent:", options: ["Electromigration", "Short circuits between adjacent wires", "Power supply noise", "Clock jitter"], answerIndex: 1, explanation: "Minimum spacing ensures wires don't merge during fabrication, avoiding shorts." },
  { id: "pq-ms-2", concept: "Metal Spacing", difficulty: "medium", prompt: "As metal width increases beyond the minimum, design rules typically require:", options: ["Reduced spacing", "Increased spacing", "Same spacing", "Wider vias only"], answerIndex: 1, explanation: "Wide metal lines have tighter lithographic tolerances, so DRC rules typically require wider spacing for wider wires." },
  { id: "pq-ms-3", concept: "Metal Spacing", difficulty: "hard", prompt: "Crosstalk between two parallel metal lines can be reduced by:", options: ["Increasing their spacing and adding shielding lines", "Decreasing their width", "Using higher resistivity metal", "Removing ground connections"], answerIndex: 0, explanation: "Greater spacing reduces coupling capacitance. Shield lines (grounded metal) between signal lines further reduce crosstalk." },

  // ── Contacts ────────────────────────────────
  { id: "pq-ct-1", concept: "Contacts", difficulty: "easy", prompt: "The minimum contact size in a typical lambda rule set is:", options: ["1λ × 1λ", "2λ × 2λ", "3λ × 3λ", "4λ × 4λ"], answerIndex: 1, explanation: "Standard SCMOS rules specify a 2λ × 2λ minimum contact cut." },
  { id: "pq-ct-2", concept: "Contacts", difficulty: "medium", prompt: "The metal overlap required around a contact ensures:", options: ["Lower resistance", "Reliable electrical connection even with alignment errors", "Higher capacitance", "Reduced area"], answerIndex: 1, explanation: "Metal overlap (enclosure) around the contact compensates for mask misalignment during fabrication." },
  { id: "pq-ct-3", concept: "Contacts", difficulty: "hard", prompt: "Multiple contacts in parallel are used to:", options: ["Increase capacitance", "Reduce contact resistance and improve current handling", "Simplify routing", "Reduce area"], answerIndex: 1, explanation: "Each contact has finite resistance. Parallel contacts reduce the total resistance and distribute current more evenly." },

  // ── Layout ──────────────────────────────────
  { id: "pq-lay-1", concept: "Layout", difficulty: "easy", prompt: "In a CMOS standard cell, NMOS transistors are placed in:", options: ["N-well", "P-substrate", "Buried oxide", "Deep trench"], answerIndex: 1, explanation: "NMOS devices need a p-type body, so they sit in the p-substrate. PMOS devices go in the N-well." },
  { id: "pq-lay-2", concept: "Layout", difficulty: "medium", prompt: "Stick diagrams are used for:", options: ["Timing analysis", "Quick topology sketches of transistor layouts", "Power estimation", "Floorplanning only"], answerIndex: 1, explanation: "Stick diagrams abstract away exact dimensions and show the topological connectivity of a gate layout." },
  { id: "pq-lay-3", concept: "Layout", difficulty: "hard", prompt: "Sharing diffusion between adjacent transistors in a standard cell reduces:", options: ["Threshold voltage", "Cell area and parasitic capacitance", "Supply voltage", "Clock frequency"], answerIndex: 1, explanation: "Merged source/drain diffusions eliminate one diffusion region per shared pair, saving area and reducing junction capacitance." },

  // ── SRAM ────────────────────────────────────
  { id: "pq-sr-1", concept: "SRAM", difficulty: "easy", prompt: "A 6T SRAM cell contains:", options: ["4 NMOS + 2 PMOS", "2 NMOS + 4 PMOS", "3 NMOS + 3 PMOS", "6 NMOS"], answerIndex: 0, explanation: "The 6T cell has two cross-coupled inverters (2 NMOS drivers + 2 PMOS loads) and 2 NMOS access transistors." },
  { id: "pq-sr-2", concept: "SRAM", difficulty: "medium", prompt: "During a read operation, the 6T SRAM cell is most vulnerable to:", options: ["Write disturb", "Read disturb (flipping the stored value)", "Soft errors only", "Electromigration"], answerIndex: 1, explanation: "When the wordline is high during read, charge sharing between the bitline and the internal node can disturb the stored value if the cell ratio is too low." },
  { id: "pq-sr-3", concept: "SRAM", difficulty: "hard", prompt: "The pull-up ratio (PR) of a 6T SRAM cell is defined as:", options: ["W_access / W_pulldown", "W_pullup / W_access", "W_pulldown / W_access", "W_pullup / W_pulldown"], answerIndex: 1, explanation: "PR = W_PMOS / W_access. A lower PR (weaker pull-up relative to access) makes write easier but can hurt hold stability." },

  // ── Sequential Circuits ─────────────────────
  { id: "pq-seq-1", concept: "Sequential Circuits", difficulty: "easy", prompt: "A latch is transparent when:", options: ["Clock is low", "Clock is high (for a positive-level-sensitive latch)", "Reset is active", "Data is changing"], answerIndex: 1, explanation: "A positive-level-sensitive latch passes input to output while the clock is high." },
  { id: "pq-seq-2", concept: "Sequential Circuits", difficulty: "medium", prompt: "Setup time is the minimum time data must be stable:", options: ["After the clock edge", "Before the clock edge", "During reset", "Between two clock edges only"], answerIndex: 1, explanation: "Setup time ensures the data signal has settled and propagated through the master stage before the clock edge captures it." },
  { id: "pq-seq-3", concept: "Sequential Circuits", difficulty: "hard", prompt: "To fix a hold-time violation, a designer can:", options: ["Add buffers in the data path to increase delay", "Increase the clock frequency", "Reduce VDD", "Remove the flip-flop"], answerIndex: 0, explanation: "Adding delay buffers slows down the data path so data doesn't arrive at the capture flop too early after the clock edge." },
];

/**
 * Return practice questions for a specific concept, optionally filtered by difficulty.
 */
export function practiceQuestionsFor(
  concept: string,
  difficulty?: "easy" | "medium" | "hard",
): PracticeQuestion[] {
  return bank.filter(
    (q) => q.concept === concept && (!difficulty || q.difficulty === difficulty),
  );
}

/**
 * Return all practice questions for a concept sorted by difficulty (easy → hard).
 */
export function allPracticeForConcept(concept: string): PracticeQuestion[] {
  const order = { easy: 0, medium: 1, hard: 2, advanced: 3 };
  return bank
    .filter((q) => q.concept === concept)
    .sort((a, b) => order[a.difficulty] - order[b.difficulty]);
}

/**
 * Get reassessment questions — returns questions not yet seen by the student.
 * Falls back to all questions if the student has seen them all.
 */
export function reassessmentQuestionsFor(
  concept: string,
  seenIds: Set<string>,
  count: number = 3,
): PracticeQuestion[] {
  const unseen = bank.filter(
    (q) => q.concept === concept && !seenIds.has(q.id),
  );
  const pool = unseen.length >= count ? unseen : bank.filter((q) => q.concept === concept);
  return pool.slice(0, count);
}
