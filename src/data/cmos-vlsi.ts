export type MasteryLevel = "novice" | "developing" | "proficient" | "mastered";

export type Topic = {
  id: string;
  title: string;
  module: string;
  summary: string;
  mastery: number;
  level: MasteryLevel;
  hoursSpent: number;
  lastStudied: string;
  prerequisites: string[];
};

export type QuizQuestion = {
  id: string;
  topicId: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type Flashcard = {
  id: string;
  topicId: string;
  front: string;
  back: string;
};

export type StudySession = {
  id: string;
  day: string;
  title: string;
  focus: string;
  minutes: number;
  status: "done" | "today" | "upcoming";
};

export type WeeklyPoint = {
  day: string;
  minutes: number;
  accuracy: number;
};

export type Weakness = {
  id: string;
  topicId: string;
  title: string;
  gap: string;
  recommendedAction: string;
  severity: "high" | "medium" | "low";
};

export type TutorMessage = {
  role: "student" | "tutor";
  content: string;
};

export const demoStudent = {
  name: "Alex Chen",
  role: "M.Tech VLSI student",
  university: "IIT Madras",
  course: "CMOS VLSI Design",
  streak: 12,
  weeklyGoalMinutes: 360,
  minutesThisWeek: 248,
};

export const topics: Topic[] = [
  {
    id: "mosfet",
    title: "MOSFET Device Physics",
    module: "Devices",
    summary:
      "Threshold voltage, inversion, body effect, and current equations in saturation and linear regions.",
    mastery: 86,
    level: "mastered",
    hoursSpent: 9.5,
    lastStudied: "Today",
    prerequisites: [],
  },
  {
    id: "inverter",
    title: "CMOS Inverter",
    module: "Static CMOS",
    summary:
      "Voltage transfer characteristic, noise margins, switching threshold, and ratioed sizing.",
    mastery: 78,
    level: "proficient",
    hoursSpent: 7.0,
    lastStudied: "Yesterday",
    prerequisites: ["mosfet"],
  },
  {
    id: "delay",
    title: "Delay Models",
    module: "Timing",
    summary:
      "RC delay, logical effort, Elmore delay, and fanout-of-4 inverter delay.",
    mastery: 64,
    level: "developing",
    hoursSpent: 5.5,
    lastStudied: "2 days ago",
    prerequisites: ["inverter"],
  },
  {
    id: "power",
    title: "Power Dissipation",
    module: "Energy",
    summary:
      "Dynamic switching energy, short-circuit current, leakage, and voltage scaling.",
    mastery: 58,
    level: "developing",
    hoursSpent: 4.0,
    lastStudied: "3 days ago",
    prerequisites: ["inverter"],
  },
  {
    id: "combo",
    title: "Combinational CMOS Logic",
    module: "Logic",
    summary:
      "Complex gates, AOI/OAI, transmission gates, and pass-transistor logic tradeoffs.",
    mastery: 71,
    level: "proficient",
    hoursSpent: 6.2,
    lastStudied: "Yesterday",
    prerequisites: ["inverter"],
  },
  {
    id: "seq",
    title: "Sequential Circuits",
    module: "Timing",
    summary:
      "Latches vs flip-flops, setup/hold, clock skew, and timing paths.",
    mastery: 42,
    level: "novice",
    hoursSpent: 3.1,
    lastStudied: "5 days ago",
    prerequisites: ["delay", "combo"],
  },
  {
    id: "layout",
    title: "Layout and Design Rules",
    module: "Physical Design",
    summary:
      "Lambda-based rules, well contacts, stick diagrams, and Euler paths.",
    mastery: 69,
    level: "proficient",
    hoursSpent: 5.8,
    lastStudied: "4 days ago",
    prerequisites: ["combo"],
  },
  {
    id: "interconnect",
    title: "Interconnect and Parasitics",
    module: "Physical Design",
    summary:
      "Wire resistance/capacitance, repeaters, crosstalk, and RC limited delay.",
    mastery: 37,
    level: "novice",
    hoursSpent: 2.4,
    lastStudied: "1 week ago",
    prerequisites: ["delay", "layout"],
  },
  {
    id: "memory",
    title: "SRAM and Memory Arrays",
    module: "Memory",
    summary:
      "6T SRAM cell stability, SNM, sense amplifiers, and decoder delay.",
    mastery: 31,
    level: "novice",
    hoursSpent: 1.8,
    lastStudied: "8 days ago",
    prerequisites: ["seq", "layout"],
  },
  {
    id: "scaling",
    title: "Scaling and Variability",
    module: "Advanced CMOS",
    summary:
      "Dennard scaling, short-channel effects, DIBL, and process variation.",
    mastery: 49,
    level: "developing",
    hoursSpent: 3.4,
    lastStudied: "6 days ago",
    prerequisites: ["mosfet", "power"],
  },
];

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    topicId: "inverter",
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
      "Hole mobility is lower than electron mobility, so PMOS is usually widened so the pull-up strength matches the NMOS pull-down.",
  },
  {
    id: "q2",
    topicId: "delay",
    prompt: "Logical effort of a 2-input NAND gate (normalized to an inverter) is:",
    options: ["1", "4/3", "5/3", "2"],
    answerIndex: 1,
    explanation:
      "A 2-input NAND has two NMOS in series. With unit PMOS, the input capacitance is 4 units vs 3 for an inverter, so g = 4/3.",
  },
  {
    id: "q3",
    topicId: "power",
    prompt: "Dynamic switching energy of a CMOS gate charging load CL from 0 to VDD is:",
    options: ["0.5 CL VDD^2", "CL VDD^2", "CL VDD", "2 CL VDD^2"],
    answerIndex: 1,
    explanation:
      "The supply delivers CL VDD^2 per 0→1 transition. Half is stored on the capacitor and half is dissipated in the PMOS network.",
  },
  {
    id: "q4",
    topicId: "seq",
    prompt: "Hold time violations are most directly aggravated by:",
    options: [
      "Long combinational delay on the launching path",
      "Clock delay to the launching flop much larger than to the capturing flop",
      "Clock delay to the capturing flop much larger than to the launching flop",
      "Higher VDD",
    ],
    answerIndex: 2,
    explanation:
      "If the capture clock arrives late relative to the launch clock, data can race through and violate hold.",
  },
  {
    id: "q5",
    topicId: "mosfet",
    prompt:
      "In saturation, first-order long-channel NMOS drain current depends on VGS as:",
    options: [
      "Linear in (VGS - Vt)",
      "Quadratic in (VGS - Vt)",
      "Independent of VGS",
      "Exponential in VDS",
    ],
    answerIndex: 1,
    explanation:
      "The Shockley model gives ID = 0.5 μn Cox (W/L) (VGS − Vt)^2 (1 + λ VDS) in saturation.",
  },
  {
    id: "q6",
    topicId: "memory",
    prompt: "Static noise margin (SNM) of a 6T SRAM cell is measured as:",
    options: [
      "The bitline voltage swing during read",
      "The side of the largest square nested in the butterfly curve",
      "Wordline pulse width",
      "The ratio of pull-up to access transistor only",
    ],
    answerIndex: 1,
    explanation:
      "SNM is extracted from the overlapping voltage transfer curves of the two inverters (the butterfly plot).",
  },
];

export const flashcards: Flashcard[] = [
  {
    id: "f1",
    topicId: "mosfet",
    front: "What is threshold voltage Vt?",
    back: "The gate-source voltage at which a conducting inversion channel forms. It depends on process, body bias, oxide thickness, and doping.",
  },
  {
    id: "f2",
    topicId: "inverter",
    front: "Define noise margin high (NMH).",
    back: "NMH = VOH − VIH. It is the safety margin for a valid logic-1 against noise.",
  },
  {
    id: "f3",
    topicId: "delay",
    front: "What is FO4 delay?",
    back: "The delay of an inverter driving four identical inverters. It is a process-normalized timing yardstick.",
  },
  {
    id: "f4",
    topicId: "power",
    front: "Name the three CMOS power components.",
    back: "Dynamic (CV^2f), short-circuit during switching, and leakage (subthreshold, gate, junction).",
  },
  {
    id: "f5",
    topicId: "seq",
    front: "Setup vs hold time?",
    back: "Setup: data must be stable before the active clock edge. Hold: data must remain stable after the clock edge.",
  },
  {
    id: "f6",
    topicId: "layout",
    front: "What is an Euler path in stick diagrams?",
    back: "A traversal of the diffusion graph that shares source/drain nodes and yields a compact, unbroken diffusion strip.",
  },
];

export const weeklyProgress: WeeklyPoint[] = [
  { day: "Mon", minutes: 42, accuracy: 70 },
  { day: "Tue", minutes: 55, accuracy: 74 },
  { day: "Wed", minutes: 28, accuracy: 61 },
  { day: "Thu", minutes: 48, accuracy: 79 },
  { day: "Fri", minutes: 36, accuracy: 72 },
  { day: "Sat", minutes: 22, accuracy: 68 },
  { day: "Sun", minutes: 17, accuracy: 64 },
];

export const studyPlan: StudySession[] = [
  {
    id: "s1",
    day: "Mon",
    title: "Review MOSFET equations",
    focus: "Saturation vs linear, body effect problems",
    minutes: 40,
    status: "done",
  },
  {
    id: "s2",
    day: "Tue",
    title: "Inverter VTC drill",
    focus: "Noise margins and switching threshold",
    minutes: 45,
    status: "done",
  },
  {
    id: "s3",
    day: "Wed",
    title: "Logical effort practice",
    focus: "Size a 3-stage path with NAND/NOR",
    minutes: 50,
    status: "today",
  },
  {
    id: "s4",
    day: "Thu",
    title: "Setup/hold timing",
    focus: "Flip-flop constraints and clock skew",
    minutes: 45,
    status: "upcoming",
  },
  {
    id: "s5",
    day: "Fri",
    title: "Interconnect RC",
    focus: "Elmore delay and repeater insertion",
    minutes: 40,
    status: "upcoming",
  },
  {
    id: "s6",
    day: "Sat",
    title: "SRAM SNM lab",
    focus: "Read disturb vs writeability",
    minutes: 35,
    status: "upcoming",
  },
];

export const weaknesses: Weakness[] = [
  {
    id: "w1",
    topicId: "seq",
    title: "Hold-time races",
    gap: "Confuses launch/capture clock skew direction.",
    recommendedAction: "Work 8 timing-path problems, then take the sequential quiz.",
    severity: "high",
  },
  {
    id: "w2",
    topicId: "interconnect",
    title: "Elmore delay",
    gap: "Does not apply distributed RC lumping correctly.",
    recommendedAction: "Watch the interconnect module, then compute 3 ladder networks.",
    severity: "high",
  },
  {
    id: "w3",
    topicId: "memory",
    title: "6T cell sizing",
    gap: "Mixes pull-down, access, and pull-up ratios for read/write.",
    recommendedAction: "Flashcards on cell ratios + SNM butterfly sketch.",
    severity: "medium",
  },
  {
    id: "w4",
    topicId: "power",
    title: "Leakage vs dynamic energy",
    gap: "Applies CV^2f to idle leakage questions.",
    recommendedAction: "10-minute power taxonomy recap, then 6 mixed questions.",
    severity: "low",
  },
];

export const tutorScript: TutorMessage[] = [
  {
    role: "tutor",
    content:
      "I am your NeuroForge tutor for CMOS VLSI. Ask about inverters, delay, power, timing, or SRAM — or try a guided example.",
  },
];

export const tutorReplies = {
  default:
    "In static CMOS, a valid output is always driven by a VDD or GND path. That restores levels and gives high noise immunity compared with pass-transistor logic. Which node should we size next: inverter, NAND, or a timing path?",
  delay:
    "Use logical effort: delay D = N F^{1/N} + P, where F = GBH. For a path of NANDs and inverters, compute each gate's logical effort g, parasitic p, then choose stage count near the FO4 optimum (about 4 per stage).",
  power:
    "Energy per transition is CL VDD^2 from the supply. To cut dynamic power, reduce activity, capacitance, or especially VDD. Leakage needs high-Vt devices, stacking, or power gating.",
  sram: "For a 6T cell, make pull-down stronger than the access transistor for read stability, and the access transistor stronger than the PMOS pull-up for writeability. Those two ratios set SNM.",
  inverter:
    "The switching threshold VM is where Vin = Vout. Equalize NMOS and PMOS strengths (wider PMOS) to put VM near VDD/2 and balance noise margins.",
};

export function overallMastery(items: Topic[]): number {
  if (items.length === 0) return 0;
  return Math.round(items.reduce((sum, topic) => sum + topic.mastery, 0) / items.length);
}

export function masteryColor(mastery: number): string {
  if (mastery >= 80) return "#34d399";
  if (mastery >= 60) return "#5eead4";
  if (mastery >= 40) return "#fbbf24";
  return "#f87171";
}
