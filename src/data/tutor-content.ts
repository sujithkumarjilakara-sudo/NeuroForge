/**
 * tutor-content.ts — Structured tutor responses for the demo.
 *
 * Each concept has responses for multiple tutor modes.
 * The architecture allows swapping in real LLM responses later.
 */

export type TutorMode =
  | "explain-simple"
  | "explain-detail"
  | "analogy"
  | "example"
  | "hint"
  | "test-me"
  | "default";

type ConceptContent = Record<TutorMode, string>;

const content: Record<string, ConceptContent> = {
  MOSFET: {
    "explain-simple":
      "A MOSFET is like a voltage-controlled switch. Apply enough voltage to the gate (above Vt), and current flows between source and drain. Below Vt, the transistor is off.",
    "explain-detail":
      "The MOSFET operates in three regions: cutoff (VGS < Vt, no channel), linear/triode (VGS > Vt, VDS < VGS−Vt, acts like a resistor), and saturation (VGS > Vt, VDS ≥ VGS−Vt, current is approximately constant). The saturation current follows ID = ½ μn Cox (W/L)(VGS − Vt)². The body effect modifies Vt when VSB ≠ 0.",
    analogy:
      "Think of a MOSFET like a water faucet. The gate voltage is the faucet handle — turn it enough (past Vt) and water (current) flows. The wider the pipe (W/L), the more water.",
    example:
      "For an NMOS with μn·Cox = 200 μA/V², W/L = 10, Vt = 0.5V, VGS = 1.5V in saturation: ID = 0.5 × 200 × 10 × (1.5 − 0.5)² = 1 mA.",
    hint: "Remember: in saturation, drain current depends on (VGS − Vt)² — it's quadratic, not linear.",
    "test-me": "Quick check: If VGS = 0.8V and Vt = 0.5V with VDS = 2V, what region is the NMOS in? (Answer: Saturation, because VDS > VGS − Vt = 0.3V)",
    default: "The MOSFET is the fundamental building block of CMOS circuits. What aspect would you like to explore — device physics, current equations, or the body effect?",
  },

  "CMOS Inverter": {
    "explain-simple":
      "A CMOS inverter has one NMOS and one PMOS. When input is high, NMOS pulls output low. When input is low, PMOS pulls output high. It always drives a definite logic level — that's 'static' CMOS.",
    "explain-detail":
      "The voltage transfer characteristic (VTC) shows five operating regions as Vin sweeps from 0 to VDD. The switching threshold VM (where Vin = Vout) is set by the PMOS/NMOS strength ratio. Noise margins NMH = VOH − VIH and NML = VIL − VOL quantify robustness. Making PMOS wider than NMOS (typically ~2-3×) compensates for lower hole mobility and centers VM ≈ VDD/2.",
    analogy:
      "Imagine a see-saw with PMOS on one side and NMOS on the other. The input voltage tips the balance. At VM, the see-saw is perfectly level. Making PMOS heavier (wider) shifts the balance point upward.",
    example:
      "For VDD = 1.8V, a symmetric inverter has VM ≈ 0.9V. With VOH = 1.8V, VOL = 0V, VIH ≈ 0.98V, VIL ≈ 0.82V → NMH = 0.82V, NML = 0.82V.",
    hint: "To move VM up, make PMOS wider. To move VM down, make NMOS wider.",
    "test-me": "If you double the PMOS width in a CMOS inverter, does VM go up or down? (Answer: VM increases — the inverter trips at a higher input voltage.)",
    default: "The CMOS inverter is the foundation of all digital CMOS logic. Would you like to explore noise margins, the VTC, or transistor sizing?",
  },

  "Lambda Rules": {
    "explain-simple":
      "Lambda rules express layout dimensions as multiples of λ (half the minimum feature size). This makes your layout portable — if the process shrinks, you just redefine λ.",
    "explain-detail":
      "Key lambda rules: minimum poly width = 2λ, minimum metal width = 3λ, poly-to-poly spacing = 2λ, metal-1 spacing = 3λ, contact size = 2λ × 2λ, metal enclosure of contact = 1λ. The n-well to active spacing is typically 6λ. These rules ensure manufacturability across process variations.",
    analogy:
      "Lambda rules are like building codes for chip layouts. Just as a building code says 'doors must be at least 80 cm wide,' lambda rules say 'poly must be at least 2λ wide.' The actual size of λ depends on the factory (foundry).",
    example:
      "In a 0.5μm process, λ = 0.25μm. So minimum poly width = 2 × 0.25 = 0.5μm, and minimum metal spacing = 3 × 0.25 = 0.75μm.",
    hint: "When in doubt, remember: smaller features need relatively more spacing for manufacturability.",
    "test-me": "What is the minimum poly width in a lambda rule set? (Answer: 2λ)",
    default: "Lambda rules ensure your layout can be fabricated correctly. Would you like to know specific spacing rules or how lambda scales across technology nodes?",
  },

  "Metal Spacing": {
    "explain-simple":
      "Metal spacing is the minimum distance between two metal wires on the same layer. Too close → they short. The rules ensure reliable fabrication.",
    "explain-detail":
      "Metal-1 minimum spacing is typically 3λ. As metal width increases, required spacing also increases (wide-metal rules). Adjacent metals on the same layer couple capacitively — this crosstalk can cause signal integrity issues. Shield lines (grounded wires) between sensitive signals reduce coupling. Higher metal layers often have larger minimum spacing because they are thicker.",
    analogy:
      "Think of metal wires like lanes on a highway. Too narrow a gap between lanes causes accidents (shorts). Wider trucks (wider wires) need even more lane separation. Guard rails (shield lines) prevent cross-lane interference.",
    example:
      "In a 3λ-spacing rule with λ = 0.25μm: minimum Metal-1 spacing = 0.75μm. If a metal line is 6λ wide, the spacing rule might increase to 4λ = 1.0μm.",
    hint: "Metal spacing violations → short circuits. Metal width violations → open circuits. Don't confuse them!",
    "test-me": "What is the typical minimum Metal-1 spacing in lambda rules? (Answer: 3λ)",
    default: "Metal spacing rules prevent shorts and control crosstalk. Shall I explain the rules, crosstalk implications, or wide-metal corrections?",
  },

  Contacts: {
    "explain-simple":
      "A contact is a small vertical hole filled with metal that connects Metal-1 to the layer below (polysilicon or diffusion). It's like a tiny elevator between floors of the chip.",
    "explain-detail":
      "Contact size is typically 2λ × 2λ. Metal must overlap the contact by at least 1λ on each side (enclosure rule). Poly or active must also enclose the contact. Multiple contacts in parallel reduce resistance — each contact has ~10-100Ω depending on the process. Via is the equivalent structure connecting two metal layers.",
    analogy:
      "Contacts are like elevator shafts in a building. Metal-1 is the ground floor, poly/diffusion is the basement. The elevator shaft (contact) must fit entirely within both floors, with some margin for safety.",
    example:
      "A 2λ × 2λ contact with 1λ metal enclosure requires a 4λ × 4λ metal pad centered on the contact.",
    hint: "Contact ≠ Via. Contact goes from Metal-1 to poly/diffusion. Via goes from one metal layer to another.",
    "test-me": "What is the typical contact size in lambda rules? (Answer: 2λ × 2λ)",
    default: "Contacts are critical for connecting different layers in your layout. Would you like to explore sizing rules, resistance, or the difference between contacts and vias?",
  },

  Layout: {
    "explain-simple":
      "Layout is the physical blueprint of your circuit on silicon. You draw rectangles of poly, diffusion, metal, and contacts following design rules to build transistors and wire them up.",
    "explain-detail":
      "A standard cell layout places PMOS transistors in the N-well (top) and NMOS in the p-substrate (bottom). Power rails (VDD, GND) run horizontally. The Euler path technique finds transistor orderings that allow continuous diffusion strips, minimizing area. Stick diagrams abstract layout topology before committing to exact geometries.",
    analogy:
      "Layout is like city planning — you need roads (metal), buildings (transistors), and intersections (contacts) all following zoning laws (design rules). An Euler path is like finding a route that visits every street without backtracking.",
    example:
      "For a 2-input NAND: NMOS transistors A and B are in series (p-substrate). PMOS transistors A and B are in parallel (n-well). The Euler path A-B works for both networks, allowing shared diffusion.",
    hint: "For compact layouts, find a common Euler path for both the NMOS and PMOS networks.",
    "test-me": "In a standard cell, where are NMOS transistors placed? (Answer: In the p-substrate, below the N-well)",
    default: "Layout converts your schematic into physical geometry. Would you like to explore Euler paths, stick diagrams, or standard cell construction?",
  },

  SRAM: {
    "explain-simple":
      "A 6T SRAM cell stores one bit using two cross-coupled inverters (4 transistors) and two access transistors. It's fast but takes more area than DRAM.",
    "explain-detail":
      "The 6T cell has two key ratios: Cell Ratio (CR = W_driver / W_access) controls read stability — higher CR means the stored value is less likely to flip during read. Pull-up Ratio (PR = W_pullup / W_access) controls writeability — lower PR makes it easier to overwrite the cell. Static Noise Margin (SNM) is measured from the butterfly curve (overlapping VTCs of the two inverters).",
    analogy:
      "Think of a 6T SRAM cell as two people arm-wrestling (cross-coupled inverters). The access transistors are like referees who open the door to let someone push on one arm. Read stability means the arm-wrestlers don't get knocked over when the door opens.",
    example:
      "Typical 6T sizing: driver W = 2 units, access W = 1 unit, pull-up W = 1 unit. CR = 2/1 = 2 (good read stability). PR = 1/1 = 1 (balanced writeability).",
    hint: "Remember: CR (cell ratio) ↑ → better read stability. PR (pull-up ratio) ↓ → easier write.",
    "test-me": "What two ratios control 6T SRAM cell stability? (Answer: Cell Ratio CR = Wdriver/Waccess for read, Pull-up Ratio PR = Wpullup/Waccess for write)",
    default: "The 6T SRAM cell is a cornerstone of memory design. Would you like to explore read/write operations, SNM, or transistor sizing trade-offs?",
  },

  "Sequential Circuits": {
    "explain-simple":
      "Sequential circuits remember state using latches and flip-flops. A flip-flop captures data on a clock edge. Setup time says how early data must arrive; hold time says how long it must stay.",
    "explain-detail":
      "A master-slave flip-flop has setup time (tsu), hold time (th), and clock-to-Q delay (tcq). For a timing path: tclk > tcq + tcomb + tsu (setup constraint). For hold: tcq + tcomb > th + tskew (hold constraint). Positive clock skew at the capture flop helps setup but hurts hold. Hold violations are dangerous because they cannot be fixed by reducing clock frequency.",
    analogy:
      "A flip-flop is like a camera that takes a photo (captures data) at the exact moment the shutter clicks (clock edge). Setup time is like saying 'hold still' before the photo. Hold time is 'keep holding' after the click.",
    example:
      "With tsu = 0.1ns, th = 0.05ns, tcq = 0.15ns, and a 1GHz clock (tclk = 1ns): max combinational delay = 1 − 0.15 − 0.1 = 0.75ns.",
    hint: "Hold violations can't be fixed by slowing the clock — you must add delay to the data path.",
    "test-me": "Can you fix a hold-time violation by reducing the clock frequency? (Answer: No — hold timing is independent of clock period. You must add delay buffers.)",
    default: "Sequential circuits are all about timing. Would you like to explore setup/hold constraints, clock skew, or latch vs flip-flop trade-offs?",
  },
};

/**
 * Get a tutor response for a concept and mode.
 * Falls back to a generic default if the concept or mode is not found.
 */
export function getTutorResponse(concept: string, mode: TutorMode): string {
  const conceptContent = content[concept];
  if (!conceptContent) {
    return `Let me help you with ${concept}. What specific aspect would you like to explore?`;
  }
  return conceptContent[mode] ?? conceptContent.default;
}

/**
 * Get a context-aware introduction based on mastery level.
 */
export function getTutorIntro(concept: string, mastery: number): string {
  if (mastery < 40) {
    return `I see you're still building your foundation in ${concept} (${mastery}% mastery). Let's start with the basics and build up from there.`;
  }
  if (mastery < 70) {
    return `You have a working understanding of ${concept} (${mastery}% mastery), but there are some gaps. Let's strengthen your knowledge.`;
  }
  if (mastery < 85) {
    return `You're making great progress with ${concept} (${mastery}% mastery)! Let's refine the details and tackle the harder aspects.`;
  }
  return `Excellent command of ${concept} (${mastery}% mastery)! Let's review advanced nuances or test your mastery.`;
}

export const TUTOR_MODES: { mode: TutorMode; label: string; icon: string }[] = [
  { mode: "explain-simple", label: "Explain Simply", icon: "💡" },
  { mode: "explain-detail", label: "Explain in Detail", icon: "📖" },
  { mode: "analogy", label: "Give an Analogy", icon: "🔗" },
  { mode: "example", label: "Give an Example", icon: "📐" },
  { mode: "hint", label: "Give Me a Hint", icon: "🎯" },
  { mode: "test-me", label: "Test Me", icon: "✏️" },
];
