"use client"

import {
  ACADEMIC_YEARS,
  ALL_DISTRICTS,
  ALL_DIVISIONS,
  ALL_SUBJECTS,
  districtOptions,
  divisionOptions,
  subjectOptions,
} from "@/lib/mockup/content/dimensions"
import { filtersDirty } from "@/lib/mockup/content/scenarios"
import { viewById } from "@/lib/mockup/content/views"

import { useMockup } from "../mockup-provider"

const selectStyle: React.CSSProperties = {
  border: 0,
  background: "transparent",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--mk-ink)",
  cursor: "pointer",
  outline: "none",
  maxWidth: 150,
}

function pill(active: boolean, accent = false): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 9px",
    border: `1px solid ${active ? "var(--mk-blue)" : "var(--mk-border)"}`,
    borderRadius: 7,
    fontSize: 12,
    cursor: "pointer",
    background: active
      ? "var(--mk-blue-tint)"
      : accent
        ? "var(--mk-blue-tint)"
        : "#fff",
  }
}

export function FilterBar({ viewId }: { viewId: string }) {
  const mk = useMockup()
  const view = viewById(viewId)
  const { filters, setFilter, resetFilters } = mk
  // The "Scenario" toggle is disabled for now — too much to explain to the
  // client mid-review. The recompute maths stays in scenarios.ts; see
  // GitHub issue #33 about bringing it back for a future project.
  const dirty = filtersDirty({ ...filters, scenario: "asis" })

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div style={{ width: 1, height: 18, background: "var(--mk-border)" }} />

      <label style={pill(filters.year !== "2025–26")}>
        <span style={{ color: "var(--mk-sec)" }}>Year</span>
        <select
          value={filters.year}
          onChange={(e) => setFilter({ year: e.target.value })}
          style={selectStyle}
        >
          {ACADEMIC_YEARS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>

      <label style={pill(filters.division !== ALL_DIVISIONS)}>
        <span style={{ color: "var(--mk-sec)" }}>Division</span>
        <select
          value={filters.division}
          onChange={(e) =>
            setFilter({ division: e.target.value, district: ALL_DISTRICTS })
          }
          style={selectStyle}
        >
          {divisionOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>

      <label style={pill(filters.district !== ALL_DISTRICTS)}>
        <span style={{ color: "var(--mk-sec)" }}>District</span>
        <select
          value={filters.district}
          onChange={(e) => setFilter({ district: e.target.value })}
          style={selectStyle}
        >
          {districtOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>

      {view?.subject && (
        <label style={pill(filters.subject !== ALL_SUBJECTS)}>
          <span style={{ color: "var(--mk-sec)" }}>Subject</span>
          <select
            value={filters.subject}
            onChange={(e) => setFilter({ subject: e.target.value })}
            style={selectStyle}
          >
            {subjectOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      )}

      {dirty && (
        <button
          type="button"
          onClick={() => resetFilters(viewId)}
          style={{
            border: 0,
            background: "transparent",
            fontSize: 11.5,
            color: "var(--mk-sec)",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Reset
        </button>
      )}
    </div>
  )
}
