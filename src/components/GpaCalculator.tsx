"use client";
import { useState, useMemo } from "react";
import type { CalculatorDefinition } from "@/lib/calculators/catalog";

interface Props {
  calculator: CalculatorDefinition;
}

type GradeLetter = "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D+" | "D" | "F";

const GRADE_POINTS: Record<GradeLetter, number> = {
  "A+": 4.0,
  "A": 4.0,
  "A-": 3.7,
  "B+": 3.3,
  "B": 3.0,
  "B-": 2.7,
  "C+": 2.3,
  "C": 2.0,
  "C-": 1.7,
  "D+": 1.3,
  "D": 1.0,
  "F": 0.0,
};

const GRADE_OPTIONS: GradeLetter[] = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"];

interface CourseRow {
  id: number;
  name: string;
  credits: number;
  grade: GradeLetter;
}

let nextId = 6;

function createRow(id: number): CourseRow {
  return { id, name: "", credits: 3, grade: "A" };
}

export default function GpaCalculator({ calculator }: Props) {
  const [rows, setRows] = useState<CourseRow[]>([
    { id: 1, name: "", credits: 3, grade: "A" },
    { id: 2, name: "", credits: 3, grade: "A" },
    { id: 3, name: "", credits: 3, grade: "A" },
    { id: 4, name: "", credits: 3, grade: "A" },
    { id: 5, name: "", credits: 3, grade: "A" },
  ]);

  const [prevGpa, setPrevGpa] = useState<number>(3.0);
  const [prevCredits, setPrevCredits] = useState<number>(60);

  const semesterResults = useMemo(() => {
    const validRows = rows.filter((r) => r.credits > 0);
    if (validRows.length === 0) return null;
    const totalCredits = validRows.reduce((sum, r) => sum + r.credits, 0);
    const totalPoints = validRows.reduce((sum, r) => sum + r.credits * GRADE_POINTS[r.grade], 0);
    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    return { gpa, totalCredits };
  }, [rows]);

  const cumulativeResults = useMemo(() => {
    if (!semesterResults) return null;
    const totalPrev = prevCredits * prevGpa;
    const totalNew = semesterResults.totalCredits * semesterResults.gpa;
    const totalCredits = prevCredits + semesterResults.totalCredits;
    const cumGpa = totalCredits > 0 ? (totalPrev + totalNew) / totalCredits : 0;
    return { cumGpa, totalCredits };
  }, [semesterResults, prevGpa, prevCredits]);

  const honorRoll = semesterResults ? semesterResults.gpa > 3.5 : false;
  const deansList = semesterResults ? semesterResults.gpa >= 3.8 : false;

  function updateRow(id: number, field: keyof CourseRow, value: string | number) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  function addRow() {
    const id = nextId++;
    setRows((prev) => [...prev, createRow(id)]);
  }

  function removeRow(id: number) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function getGpaColor(gpa: number): string {
    if (gpa >= 3.8) return "#16a34a";
    if (gpa >= 3.5) return "#2f7c52";
    if (gpa >= 3.0) return "var(--ink)";
    if (gpa >= 2.0) return "#b45309";
    return "#dc2626";
  }

  return (
    <div style={{ fontFamily: "inherit", maxWidth: 780, margin: "0 auto" }}>
      {/* Course Rows */}
      <div style={{ background: "var(--wash)", border: "1px solid #dcebe1", borderRadius: 14, padding: 22, marginBottom: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Semester Courses</div>

        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 110px 44px", gap: 10, marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 650 }}>Course Name (optional)</div>
          <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 650 }}>Credits</div>
          <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 650 }}>Grade</div>
          <div />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map((row) => (
            <div key={row.id} style={{ display: "grid", gridTemplateColumns: "1fr 90px 110px 44px", gap: 10, alignItems: "center" }}>
              <input
                className="field-input"
                type="text"
                placeholder="e.g. Mathematics"
                value={row.name}
                onChange={(e) => updateRow(row.id, "name", e.target.value)}
              />
              <input
                className="field-input"
                type="number"
                min={0}
                max={12}
                step={1}
                value={row.credits}
                onChange={(e) => updateRow(row.id, "credits", Math.max(0, +e.target.value))}
              />
              <select
                className="field-input"
                value={row.grade}
                onChange={(e) => updateRow(row.id, "grade", e.target.value as GradeLetter)}
                style={{ cursor: "pointer" }}
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g} ({GRADE_POINTS[g].toFixed(1)})
                  </option>
                ))}
              </select>
              <button
                onClick={() => removeRow(row.id)}
                disabled={rows.length <= 1}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: "1px solid #dcebe1",
                  background: rows.length <= 1 ? "var(--wash)" : "#fee2e2",
                  color: rows.length <= 1 ? "var(--muted)" : "#dc2626",
                  cursor: rows.length <= 1 ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
                aria-label="Remove row"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addRow}
          style={{
            marginTop: 14,
            padding: "8px 18px",
            borderRadius: 8,
            border: "1px solid var(--accent)",
            background: "transparent",
            color: "var(--accent)",
            fontWeight: 650,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          + Add Course
        </button>
      </div>

      {/* Semester Results */}
      {semesterResults && (
        <div style={{ background: "var(--wash)", border: "1px solid #dcebe1", borderRadius: 14, padding: 22, marginBottom: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Semester Results</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: 18, marginBottom: honorRoll ? 18 : 0 }}>
            <div>
              <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Semester GPA</div>
              <div
                className="result-value"
                style={{ color: getGpaColor(semesterResults.gpa) }}
              >
                {semesterResults.gpa.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Total Credits</div>
              <div className="result-value">{semesterResults.totalCredits}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Letter Grade</div>
              <div className="result-value">
                {semesterResults.gpa >= 3.7
                  ? "A"
                  : semesterResults.gpa >= 3.3
                  ? "B+"
                  : semesterResults.gpa >= 3.0
                  ? "B"
                  : semesterResults.gpa >= 2.7
                  ? "B-"
                  : semesterResults.gpa >= 2.3
                  ? "C+"
                  : semesterResults.gpa >= 2.0
                  ? "C"
                  : semesterResults.gpa >= 1.0
                  ? "D"
                  : "F"}
              </div>
            </div>
          </div>

          {(honorRoll || deansList) && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {deansList && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#fef3c7",
                    border: "1px solid #f59e0b",
                    borderRadius: 20,
                    padding: "6px 14px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#92400e",
                  }}
                >
                  <span>★</span> Dean's List (GPA ≥ 3.8)
                </div>
              )}
              {honorRoll && !deansList && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#d1fae5",
                    border: "1px solid var(--accent)",
                    borderRadius: 20,
                    padding: "6px 14px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#065f46",
                  }}
                >
                  <span>★</span> Honor Roll (GPA &gt; 3.5)
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Cumulative GPA Section */}
      <div style={{ background: "var(--wash)", border: "1px solid #dcebe1", borderRadius: 14, padding: 22, marginBottom: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Cumulative GPA</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 16, marginBottom: 20 }}>
          <label style={{ display: "block" }}>
            <span style={{ display: "block", color: "#465a50", fontSize: ".85rem", fontWeight: 650, marginBottom: 8 }}>
              Previous GPA
            </span>
            <input
              className="field-input"
              type="number"
              min={0}
              max={4}
              step={0.01}
              value={prevGpa}
              onChange={(e) => setPrevGpa(Math.min(4, Math.max(0, +e.target.value)))}
            />
          </label>
          <label style={{ display: "block" }}>
            <span style={{ display: "block", color: "#465a50", fontSize: ".85rem", fontWeight: 650, marginBottom: 8 }}>
              Previous Credits Earned
            </span>
            <input
              className="field-input"
              type="number"
              min={0}
              step={1}
              value={prevCredits}
              onChange={(e) => setPrevCredits(Math.max(0, +e.target.value))}
            />
          </label>
        </div>

        {cumulativeResults && semesterResults && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: 18 }}>
            <div>
              <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>New Cumulative GPA</div>
              <div
                className="result-value"
                style={{ color: getGpaColor(cumulativeResults.cumGpa) }}
              >
                {cumulativeResults.cumGpa.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Total Credits</div>
              <div className="result-value">{cumulativeResults.totalCredits}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>GPA Change</div>
              <div
                className="result-value"
                style={{
                  color:
                    cumulativeResults.cumGpa > prevGpa
                      ? "#16a34a"
                      : cumulativeResults.cumGpa < prevGpa
                      ? "#dc2626"
                      : "var(--ink)",
                }}
              >
                {cumulativeResults.cumGpa > prevGpa ? "+" : ""}
                {(cumulativeResults.cumGpa - prevGpa).toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grade Lookup Table */}
      <div style={{ background: "var(--wash)", border: "1px solid #dcebe1", borderRadius: 14, padding: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Grade Point Reference</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #dcebe1" }}>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--muted)", fontWeight: 650, fontSize: 12 }}>
                  Letter Grade
                </th>
                <th style={{ textAlign: "right", padding: "8px 12px", color: "var(--muted)", fontWeight: 650, fontSize: 12 }}>
                  GPA Points
                </th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--muted)", fontWeight: 650, fontSize: 12 }}>
                  Performance
                </th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["A+", "A", "A-"],
                  ["B+", "B", "B-"],
                  ["C+", "C", "C-"],
                  ["D+", "D"],
                  ["F"],
                ] as GradeLetter[][]
              )
                .flat()
                .map((grade, i) => {
                  const pts = GRADE_POINTS[grade];
                  const performance =
                    pts >= 4.0
                      ? "Excellent"
                      : pts >= 3.7
                      ? "Excellent"
                      : pts >= 3.3
                      ? "Good"
                      : pts >= 3.0
                      ? "Good"
                      : pts >= 2.7
                      ? "Good"
                      : pts >= 2.3
                      ? "Satisfactory"
                      : pts >= 2.0
                      ? "Satisfactory"
                      : pts >= 1.7
                      ? "Satisfactory"
                      : pts >= 1.3
                      ? "Poor"
                      : pts >= 1.0
                      ? "Poor"
                      : "Failing";
                  const perfColor =
                    pts >= 3.7
                      ? "#16a34a"
                      : pts >= 3.0
                      ? "#2f7c52"
                      : pts >= 2.0
                      ? "#b45309"
                      : pts >= 1.0
                      ? "#ea580c"
                      : "#dc2626";
                  return (
                    <tr
                      key={grade}
                      style={{ borderBottom: "1px solid #dcebe1", background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)" }}
                    >
                      <td style={{ padding: "10px 12px", fontWeight: 700 }}>{grade}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                        {pts.toFixed(1)}
                      </td>
                      <td style={{ padding: "10px 12px", color: perfColor, fontWeight: 600 }}>{performance}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 14, fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
          Note: A+ and A are both worth 4.0 points. GPA is calculated as the sum of (grade points × credits) divided by total credits.
          A GPA above 3.5 qualifies for Honor Roll; 3.8 and above for Dean's List.
        </div>
      </div>
    </div>
  );
}
