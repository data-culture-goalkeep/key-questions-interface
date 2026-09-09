// Sandipani mockup palette — Goalkeep brand primitives, lifted verbatim from
// the design handoff. Kept as a plain constant map (not CSS vars) so the pure
// view-builder can reference colours for chart series. The scoped stylesheet
// src/app/mockups/mockups.css mirrors these for layout chrome.

export const COLOR = {
  ink: "#313032",
  sec: "#5B6472",
  border: "#E8E6E6",
  muted: "#9AA1AC",
  blue: "#17479E", // blue-deep
  blueMid: "#4E72B8",
  teal: "#81C2B2",
  coral: "#EA9D93",
  yellow: "#E9E626",
  danger: "#C23934",
  goodBg: "#E7F2EE",
  goodFg: "#2F6B5B",
  badBg: "#FBEEEC",
  badFg: "#B4564A",
  canvas: "#F7F6F6",
  surface: "#FFFFFF",
} as const

// Learning-level ramp: Below Dakshata → Dakshata → Dakshata++ → Grade Level
export const LEVEL_RAMP = [
  COLOR.coral,
  COLOR.yellow,
  COLOR.teal,
  COLOR.blue,
] as const

export const LEVELS = [
  "Below Dakshata",
  "Dakshata",
  "Dakshata++",
  "Grade Level",
] as const

export type LearningLevel = (typeof LEVELS)[number]
