import type { IndicatorLevel } from "@/lib/types"

// The results-chain (Reach → Input → Output → Intermediate Outcome →
// Impact) is the actual intellectual product this tool sells, so it gets
// one brand colour per stage, reused everywhere a level appears: Manage's
// indicator-type pill, the Map view's columns/cards, the "depends on"
// picker, Prioritize's section headers, and Review's level filter chips.
// See globals.css's --stage-* tokens for the raw values.
export type StageKey =
  | "reach"
  | "input"
  | "output"
  | "intermediate_outcome"
  | "impact"

export interface StageColorTokens {
  /** Tailwind utility class for a filled background in this stage's colour. */
  bg: string
  /** Tailwind utility class for text that sits on top of `bg`. */
  fg: string
  /** Tailwind utility class for text/icons/borders in this stage's colour on a neutral background. */
  text: string
  /** Tailwind utility class for a light background wash (Map view columns). */
  wash: string
  /** Raw CSS var(...) reference, for contexts a Tailwind class can't reach (inline styles, SVG). */
  cssVar: string
}

const STAGE_TOKENS_BY_KEY: Record<StageKey, StageColorTokens> = {
  reach: {
    bg: "bg-stage-reach",
    fg: "text-stage-reach-fg",
    text: "text-stage-reach",
    wash: "bg-stage-reach/10",
    cssVar: "var(--stage-reach)",
  },
  input: {
    bg: "bg-stage-input",
    fg: "text-stage-input-fg",
    text: "text-stage-input",
    wash: "bg-stage-input/15",
    cssVar: "var(--stage-input)",
  },
  output: {
    bg: "bg-stage-output",
    fg: "text-stage-output-fg",
    text: "text-stage-output",
    wash: "bg-stage-output/15",
    cssVar: "var(--stage-output)",
  },
  intermediate_outcome: {
    bg: "bg-stage-outcome",
    fg: "text-stage-outcome-fg",
    text: "text-stage-outcome",
    wash: "bg-stage-outcome/15",
    cssVar: "var(--stage-outcome)",
  },
  impact: {
    bg: "bg-stage-impact",
    fg: "text-stage-impact-fg",
    text: "text-stage-impact",
    wash: "bg-stage-impact/10",
    cssVar: "var(--stage-impact)",
  },
}

// Fixed cycle used as a fallback for any level whose `key` isn't one of the
// 5 standard stages above (a project can configure custom levels) — keeps
// every level visually distinguishable without ever throwing.
const FALLBACK_CYCLE: StageKey[] = [
  "reach",
  "input",
  "output",
  "intermediate_outcome",
  "impact",
]

/**
 * Resolves the stage colour tokens for one indicator level. Prefers
 * matching the level's own `key` against the 5 standard stage keys (stable
 * regardless of how a project has reordered or dropped levels); falls back
 * to cycling through the same 5 brand hues by position among `allLevels`
 * for any non-standard/custom key, so this never throws.
 */
export function stageColorsForLevel(
  level: Pick<IndicatorLevel, "key" | "sequence">,
  allLevels: Pick<IndicatorLevel, "id" | "key" | "sequence">[]
): StageColorTokens {
  if (isStageKey(level.key)) return STAGE_TOKENS_BY_KEY[level.key]

  const sorted = [...allLevels].sort((a, b) => a.sequence - b.sequence)
  const index = Math.max(
    0,
    sorted.findIndex((l) => l.key === level.key)
  )
  const fallbackKey = FALLBACK_CYCLE[index % FALLBACK_CYCLE.length]
  return STAGE_TOKENS_BY_KEY[fallbackKey]
}

function isStageKey(key: string): key is StageKey {
  return key in STAGE_TOKENS_BY_KEY
}
