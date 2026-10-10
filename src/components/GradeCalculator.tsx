"use client";
import { useState } from "react";
import type { CalculatorDefinition } from "@/lib/calculators/catalog";

type Props = { calculator: CalculatorDefinition };

type Mode = "final-needed" | "weighted-avg" | "what-grade";

interface WeightedRow {
  id: number;
  name: string;
  weight: number;
  score: number;
}

interface PointsRow {
  id: number;
  name: string;
  earned: number;
  total: number;
}

function letterGrade(pct: number): string {
  if (pct >= 90) return "A";
  if (pct >= 80) return "B";
  if (pct >= 70) return "C";
  if (pct >= 60) return "D";
  return "F";
}

function gradeColor(letter: string): string {
  switch (letter) {
    case "A": return "#22c55e";
    case "B": return "#3b82f6";
    case "C": return "#f59e0b";
    case "D": return "#f97316";
    default:  return "#ef4444";
  }
}

let idCounter = 100;
function nextId() { return ++idCounter; }

function makeWeightedRows(): WeightedRow[] {
  return [
    { id: nextId(), name: "Assignment 1", weight: 25, score: 85 },
    { id: nextId(), name: "Assignment 2", weight: 25, score: 90 },
    { id: nextId(), name: "Midterm",      weight: 25, score: 78 },
    { id: nextId(), name: "Final",        weight: 25, score: 82 },
  ];
}

function makePointsRows(): PointsRow[] {
  return [
    { id: nextId(), name: "Quiz 1",  earned: 18, total: 20 },
    { id: nextId(), name: "Quiz 2",  earned: 14, total: 20 },
    { id: nextId(), name: "Midterm", earned: 72, total: 100 },
    { id: nextId(), name: "Project", earned: 45, total: 50 },
  ];
}

const TABS: { key: Mode; label: string }[] = [
  { key: "final-needed", label: "Final Grade Needed" },
  { key: "weighted-avg", label: "Weighted Average" },
  { key: "what-grade",   label: "What is My Grade?" },
];

export default function GradeCalculator({ calculator }: Props) {
  const [mode, setMode] = useState<Mode>("final-needed");

  /* ── Mode 1 state ── */
  const [currentGrade, setCurrentGrade] = useState<number>(85);
  const [finalWeight,  setFinalWeight]  = useState<number>(30);
  const [desiredGrade, setDesiredGrade] = useState<number>(90);

  /* ── Mode 2 state ── */
  const [weightedRows, setWeightedRows] = useState<WeightedRow[]>(makeWeightedRows);

  /* ── Mode 3 state ── */
  const [pointsRows, setPointsRows] = useState<PointsRow[]>(makePointsRows);

  /* ───────────────────────────────── Mode 1 calc ── */
  const preFinalWeight = 100 - finalWeight;
  const neededScore =
    finalWeight > 0
      ? (desiredGrade - (currentGrade * preFinalWeight) / 100) / (finalWeight / 100)
      : NaN;
  const neededLetter = Number.isFinite(neededScore) ? letterGrade(neededScore) : "—";
  const impossible   = Number.isFinite(neededScore) && neededScore > 100;
  const alreadyDone  = Number.isFinite(neededScore) && neededScore <= 0;

  /* ───────────────────────────────── Mode 2 calc ── */
  const totalWeight    = weightedRows.reduce((s, r) => s + r.weight, 0);
  const weightedSum    = weightedRows.reduce((s, r) => s + r.weight * r.score, 0);
  const weightedAvg    = totalWeight > 0 ? weightedSum / totalWeight : NaN;
  const weightedLetter = Number.isFinite(weightedAvg) ? letterGrade(weightedAvg) : "F";

  /* ───────────────────────────────── Mode 3 calc ── */
  const totalEarned = pointsRows.reduce((s, r) => s + r.earned, 0);
  const totalPossible = pointsRows.reduce((s, r) => s + r.total, 0);
  const pointsPct    = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : NaN;
  const pointsLetter = Number.isFinite(pointsPct) ? letterGrade(pointsPct) : "F";

  /* ── helpers ── */
  function fmtPct(x: number, d = 2) {
    return Number.isFinite(x) ? `${x.toLocaleString("en-US", { maximumFractionDigits: d })}%` : "—";
  }

  /* ── Mode 2 row actions ── */
  function updateWeightedRow(id: number, field: keyof WeightedRow, val: string | number) {
    setWeightedRows(rows =>
      rows.map(r => r.id === id ? { ...r, [field]: typeof val === "string" ? val : Number(val) } : r)
    );
  }
  function removeWeightedRow(id: number) {
    setWeightedRows(rows => rows.filter(r => r.id !== id));
  }
  function addWeightedRow() {
    setWeightedRows(rows => [
      ...rows,
      { id: nextId(), name: `Item ${rows.length + 1}`, weight: 0, score: 0 },
    ]);
  }

  /* ── Mode 3 row actions ── */
  function updatePointsRow(id: number, field: keyof PointsRow, val: string | number) {
    setPointsRows(rows =>
      rows.map(r => r.id === id ? { ...r, [field]: typeof val === "string" ? val : Number(val) } : r)
    );
  }
  function removePointsRow(id: number) {
    setPointsRows(rows => rows.filter(r => r.id !== id));
  }
  function addPointsRow() {
    setPointsRows(rows => [
      ...rows,
      { id: nextId(), name: `Item ${rows.length + 1}`, earned: 0, total: 100 },
    ]);
  }

  /* ─────────────────────────────────── UI ── */
  return (
    <div style={{ fontFamily: "inherit", maxWidth: 680, margin: "0 auto" }}>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: 18, color: "var(--ink)" }}>
        {calculator.name}
      </h2>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setMode(t.key)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: mode === t.key ? "2px solid var(--accent)" : "1px solid var(--line)",
              background: mode === t.key ? "var(--accent)" : "var(--wash)",
              color: mode === t.key ? "#fff" : "var(--ink)",
              fontWeight: 650,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════ Mode 1: Final Grade Needed ═══════════════════ */}
      {mode === "final-needed" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="surface" style={{ padding: 20, borderRadius: 12 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Current Standing</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,180px),1fr))", gap: 14 }}>
              <label style={{ display: "block" }}>
                <span style={{ display: "block", color: "#465a50", fontSize: ".85rem", fontWeight: 650, marginBottom: 8 }}>
                  Current Grade (%)
                </span>
                <span style={{ display: "flex", position: "relative", alignItems: "center" }}>
                  <input
                    className="field-input"
                    type="number"
                    min={0} max={100} step={0.1}
                    value={currentGrade}
                    onChange={e => setCurrentGrade(+e.target.value)}
                  />
                  <span aria-hidden style={{ position: "absolute", right: 12, fontSize: 13, color: "var(--muted)" }}>%</span>
                </span>
              </label>

              <label style={{ display: "block" }}>
                <span style={{ display: "block", color: "#465a50", fontSize: ".85rem", fontWeight: 650, marginBottom: 8 }}>
                  Weight of Final (%)
                </span>
                <span style={{ display: "flex", position: "relative", alignItems: "center" }}>
                  <input
                    className="field-input"
                    type="number"
                    min={0} max={100} step={1}
                    value={finalWeight}
                    onChange={e => setFinalWeight(+e.target.value)}
                  />
                  <span aria-hidden style={{ position: "absolute", right: 12, fontSize: 13, color: "var(--muted)" }}>%</span>
                </span>
              </label>

              <label style={{ display: "block" }}>
                <span style={{ display: "block", color: "#465a50", fontSize: ".85rem", fontWeight: 650, marginBottom: 8 }}>
                  Desired Final Grade (%)
                </span>
                <span style={{ display: "flex", position: "relative", alignItems: "center" }}>
                  <input
                    className="field-input"
                    type="number"
                    min={0} max={100} step={0.1}
                    value={desiredGrade}
                    onChange={e => setDesiredGrade(+e.target.value)}
                  />
                  <span aria-hidden style={{ position: "absolute", right: 12, fontSize: 13, color: "var(--muted)" }}>%</span>
                </span>
              </label>
            </div>
          </div>

          {/* Result */}
          <div style={{ background: "var(--wash)", border: "1px solid #dcebe1", borderRadius: 14, padding: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Result</div>
            {impossible ? (
              <div style={{ color: "#ef4444", fontWeight: 700, fontSize: "1.1rem" }}>
                Not possible — even a perfect 100% on the final won't reach your desired grade.
              </div>
            ) : alreadyDone ? (
              <div style={{ color: "#22c55e", fontWeight: 700, fontSize: "1.1rem" }}>
                You've already achieved your desired grade — no need to take the final!
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,160px),1fr))", gap: 18 }}>
                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Score Needed on Final</div>
                  <div className="result-value" style={{ color: gradeColor(neededLetter) }}>
                    {fmtPct(neededScore)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Letter Grade</div>
                  <div className="result-value" style={{ color: gradeColor(neededLetter) }}>
                    {neededLetter}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Pre-Final Weight</div>
                  <div className="result-value">{preFinalWeight}%</div>
                </div>
              </div>
            )}
          </div>

          {/* Formula note */}
          <div style={{ background: "#f0f7f2", borderRadius: 10, padding: "12px 16px", fontSize: "0.82rem", color: "var(--muted)" }}>
            <strong>Formula:</strong> Required Final Score = (Desired Grade − Current Grade × Pre-Final Weight%) ÷ Final Weight%
          </div>
        </div>
      )}

      {/* ═══════════════════ Mode 2: Weighted Average ═══════════════════ */}
      {mode === "weighted-avg" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="surface" style={{ padding: 20, borderRadius: 12 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Assignments / Categories</div>

            {/* Header row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 110px 40px", gap: 8, marginBottom: 8 }}>
              {["Name", "Weight (%)", "Score (%)", ""].map((h, i) => (
                <div key={i} style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 700 }}>{h}</div>
              ))}
            </div>

            {weightedRows.map(row => (
              <div key={row.id} style={{ display: "grid", gridTemplateColumns: "1fr 110px 110px 40px", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <input
                  className="field-input"
                  type="text"
                  value={row.name}
                  onChange={e => updateWeightedRow(row.id, "name", e.target.value)}
                  style={{ fontSize: "0.9rem" }}
                />
                <input
                  className="field-input"
                  type="number"
                  min={0} max={100} step={1}
                  value={row.weight}
                  onChange={e => updateWeightedRow(row.id, "weight", e.target.value)}
                />
                <input
                  className="field-input"
                  type="number"
                  min={0} max={100} step={0.1}
                  value={row.score}
                  onChange={e => updateWeightedRow(row.id, "score", e.target.value)}
                />
                <button
                  onClick={() => removeWeightedRow(row.id)}
                  style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
              <button
                onClick={addWeightedRow}
                style={{
                  background: "var(--accent)", color: "#fff", border: "none", borderRadius: 7,
                  padding: "7px 14px", fontSize: "0.85rem", fontWeight: 650, cursor: "pointer",
                }}
              >
                + Add Row
              </button>
              <div style={{ fontSize: "0.82rem", color: totalWeight === 100 ? "#22c55e" : "#f59e0b", fontWeight: 650 }}>
                Total weight: {totalWeight}%{totalWeight !== 100 ? " (should be 100%)" : ""}
              </div>
            </div>
          </div>

          {/* Weighted result */}
          <div style={{ background: "var(--wash)", border: "1px solid #dcebe1", borderRadius: 14, padding: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Results</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,160px),1fr))", gap: 18 }}>
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Weighted Average</div>
                <div className="result-value" style={{ color: gradeColor(weightedLetter) }}>
                  {fmtPct(weightedAvg)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Letter Grade</div>
                <div className="result-value" style={{ color: gradeColor(weightedLetter) }}>
                  {weightedLetter}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Total Rows</div>
                <div className="result-value">{weightedRows.length}</div>
              </div>
            </div>
          </div>

          {/* Per-row breakdown */}
          {weightedRows.length > 0 && (
            <div className="surface" style={{ padding: 18, borderRadius: 12 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Breakdown</div>
              {weightedRows.map(row => {
                const contribution = totalWeight > 0 ? (row.weight / totalWeight) * row.score : 0;
                const rowLetter = letterGrade(row.score);
                return (
                  <div key={row.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
                    <div style={{ flex: 1, fontSize: "0.88rem", color: "var(--ink)" }}>{row.name || "—"}</div>
                    <div style={{ width: 80, textAlign: "right", fontSize: "0.85rem", color: "var(--muted)" }}>{row.weight}%</div>
                    <div style={{ width: 70, textAlign: "right", fontSize: "0.85rem", color: "var(--ink)", fontWeight: 650 }}>{fmtPct(row.score)}</div>
                    <div style={{ width: 30, textAlign: "right", fontSize: "0.82rem", fontWeight: 700, color: gradeColor(rowLetter) }}>{rowLetter}</div>
                    <div style={{ width: 70, textAlign: "right", fontSize: "0.82rem", color: "var(--muted)" }}>+{fmtPct(contribution)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════ Mode 3: What is My Grade ═══════════════════ */}
      {mode === "what-grade" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="surface" style={{ padding: 20, borderRadius: 12 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Enter Points Earned</div>

            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 40px", gap: 8, marginBottom: 8 }}>
              {["Assignment", "Points Earned", "Points Total", ""].map((h, i) => (
                <div key={i} style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 700 }}>{h}</div>
              ))}
            </div>

            {pointsRows.map(row => (
              <div key={row.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 40px", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <input
                  className="field-input"
                  type="text"
                  value={row.name}
                  onChange={e => updatePointsRow(row.id, "name", e.target.value)}
                  style={{ fontSize: "0.9rem" }}
                />
                <input
                  className="field-input"
                  type="number"
                  min={0} step={0.5}
                  value={row.earned}
                  onChange={e => updatePointsRow(row.id, "earned", e.target.value)}
                />
                <input
                  className="field-input"
                  type="number"
                  min={1} step={1}
                  value={row.total}
                  onChange={e => updatePointsRow(row.id, "total", e.target.value)}
                />
                <button
                  onClick={() => removePointsRow(row.id)}
                  style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}

            <button
              onClick={addPointsRow}
              style={{
                marginTop: 10,
                background: "var(--accent)", color: "#fff", border: "none", borderRadius: 7,
                padding: "7px 14px", fontSize: "0.85rem", fontWeight: 650, cursor: "pointer",
              }}
            >
              + Add Row
            </button>
          </div>

          {/* Points result */}
          <div style={{ background: "var(--wash)", border: "1px solid #dcebe1", borderRadius: 14, padding: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Results</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,160px),1fr))", gap: 18 }}>
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Overall Grade</div>
                <div className="result-value" style={{ color: gradeColor(pointsLetter) }}>
                  {fmtPct(pointsPct)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Letter Grade</div>
                <div className="result-value" style={{ color: gradeColor(pointsLetter) }}>
                  {pointsLetter}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Points Earned</div>
                <div className="result-value">{totalEarned}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Points Possible</div>
                <div className="result-value">{totalPossible}</div>
              </div>
            </div>
          </div>

          {/* Per-row breakdown */}
          {pointsRows.length > 0 && (
            <div className="surface" style={{ padding: 18, borderRadius: 12 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Breakdown</div>
              {pointsRows.map(row => {
                const pct = row.total > 0 ? (row.earned / row.total) * 100 : NaN;
                const letter = Number.isFinite(pct) ? letterGrade(pct) : "F";
                return (
                  <div key={row.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
                    <div style={{ flex: 1, fontSize: "0.88rem", color: "var(--ink)" }}>{row.name || "—"}</div>
                    <div style={{ width: 100, textAlign: "right", fontSize: "0.85rem", color: "var(--muted)" }}>
                      {row.earned} / {row.total}
                    </div>
                    <div style={{ width: 70, textAlign: "right", fontSize: "0.85rem", color: "var(--ink)", fontWeight: 650 }}>
                      {fmtPct(pct)}
                    </div>
                    <div style={{ width: 30, textAlign: "right", fontSize: "0.82rem", fontWeight: 700, color: gradeColor(letter) }}>
                      {letter}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Grade scale legend */}
      <div style={{ marginTop: 24, background: "#f0f7f2", borderRadius: 10, padding: "12px 16px" }}>
        <div style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 700, marginBottom: 8 }}>GRADE SCALE</div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {[
            { letter: "A", range: "90–100%", color: "#22c55e" },
            { letter: "B", range: "80–89%",  color: "#3b82f6" },
            { letter: "C", range: "70–79%",  color: "#f59e0b" },
            { letter: "D", range: "60–69%",  color: "#f97316" },
            { letter: "F", range: "< 60%",   color: "#ef4444" },
          ].map(g => (
            <div key={g.letter} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: g.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.78rem", fontWeight: 800 }}>
                {g.letter}
              </div>
              <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{g.range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
