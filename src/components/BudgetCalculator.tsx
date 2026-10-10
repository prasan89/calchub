"use client";
import { useState, useMemo } from "react";
import { IN, US, type Currency } from "@/lib/calculators/engine";
import type { CalculatorDefinition } from "@/lib/calculators/catalog";

interface Props {
  calculator: CalculatorDefinition;
  currency?: Currency;
}

const EXPENSE_CATEGORIES = [
  { key: "housing", label: "Housing (Rent/Mortgage)", type: "need" },
  { key: "utilities", label: "Utilities", type: "need" },
  { key: "groceries", label: "Groceries", type: "need" },
  { key: "transportation", label: "Transportation", type: "need" },
  { key: "insurance", label: "Insurance", type: "need" },
  { key: "healthcare", label: "Healthcare", type: "need" },
  { key: "entertainment", label: "Entertainment", type: "want" },
  { key: "dining", label: "Dining Out", type: "want" },
  { key: "clothing", label: "Clothing", type: "want" },
  { key: "savings", label: "Savings", type: "saving" },
  { key: "debt", label: "Debt Payments", type: "need" },
  { key: "other", label: "Other", type: "want" },
] as const;

type ExpenseKey = typeof EXPENSE_CATEGORIES[number]["key"];

const PIE_COLORS = [
  "#2d8653",
  "#4ab87a",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
  "#94a3b8",
];

function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 76;
  const innerR = 40;

  let cumAngle = -Math.PI / 2;
  const slices = data.map((d) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const start = cumAngle;
    cumAngle += angle;
    return { ...d, start, end: cumAngle, angle };
  });

  function arc(startA: number, endA: number, outerR: number, innerR: number) {
    const large = endA - startA > Math.PI ? 1 : 0;
    const x1 = cx + outerR * Math.cos(startA);
    const y1 = cy + outerR * Math.sin(startA);
    const x2 = cx + outerR * Math.cos(endA);
    const y2 = cy + outerR * Math.sin(endA);
    const x3 = cx + innerR * Math.cos(endA);
    const y3 = cy + innerR * Math.sin(endA);
    const x4 = cx + innerR * Math.cos(startA);
    const y4 = cy + innerR * Math.sin(startA);
    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${large} 0 ${x4} ${y4} Z`;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block", margin: "0 auto" }}>
      {slices.map((s, i) => (
        <path key={i} d={arc(s.start, s.end, r, innerR)} fill={s.color} stroke="#fff" strokeWidth={1.5} />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={11} fill="var(--muted)" fontWeight={600}>
        Total
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={11} fill="var(--ink)" fontWeight={700}>
        Expenses
      </text>
    </svg>
  );
}

export default function BudgetCalculator({ calculator, currency = IN }: Props) {
  const fmt = (x: number) =>
    Number.isFinite(x)
      ? `${currency.sym}${x.toLocaleString(currency.locale, { maximumFractionDigits: 2 })}`
      : "—";
  const fmtPct = (x: number) =>
    Number.isFinite(x) ? `${x.toFixed(1)}%` : "—";

  const [salary, setSalary] = useState(currency === US ? 5000 : 50000);
  const [otherIncome, setOtherIncome] = useState(0);

  const defaultExpenses: Record<ExpenseKey, number> = {
    housing: currency === US ? 1500 : 15000,
    utilities: currency === US ? 150 : 2000,
    groceries: currency === US ? 400 : 5000,
    transportation: currency === US ? 300 : 3000,
    insurance: currency === US ? 200 : 2000,
    healthcare: currency === US ? 100 : 1000,
    entertainment: currency === US ? 100 : 1000,
    dining: currency === US ? 150 : 2000,
    clothing: currency === US ? 100 : 1000,
    savings: currency === US ? 500 : 5000,
    debt: currency === US ? 200 : 2000,
    other: currency === US ? 100 : 1000,
  };

  const [expenses, setExpenses] = useState<Record<ExpenseKey, number>>(defaultExpenses);

  const setExpense = (key: ExpenseKey, val: number) =>
    setExpenses((prev) => ({ ...prev, [key]: val }));

  const results = useMemo(() => {
    const totalIncome = salary + otherIncome;
    const totalExpenses = Object.values(expenses).reduce((s, v) => s + v, 0);
    const surplus = totalIncome - totalExpenses;

    const needs = EXPENSE_CATEGORIES.filter((c) => c.type === "need").reduce(
      (s, c) => s + expenses[c.key],
      0
    );
    const wants = EXPENSE_CATEGORIES.filter((c) => c.type === "want").reduce(
      (s, c) => s + expenses[c.key],
      0
    );
    const savingsAmt = expenses["savings"];

    const needsPct = totalIncome > 0 ? (needs / totalIncome) * 100 : 0;
    const wantsPct = totalIncome > 0 ? (wants / totalIncome) * 100 : 0;
    const savingsPct = totalIncome > 0 ? (savingsAmt / totalIncome) * 100 : 0;

    let health: "Healthy" | "Tight" | "Over Budget" = "Healthy";
    if (surplus < 0) health = "Over Budget";
    else if (surplus < totalIncome * 0.1) health = "Tight";

    // Top 5 categories for pie chart
    const sortedCats = EXPENSE_CATEGORIES.map((c) => ({
      label: c.label,
      value: expenses[c.key],
    }))
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value);

    const top5 = sortedCats.slice(0, 5);
    const otherVal = sortedCats.slice(5).reduce((s, c) => s + c.value, 0);
    const pieData = [
      ...top5.map((c, i) => ({ label: c.label, value: c.value, color: PIE_COLORS[i] })),
      ...(otherVal > 0 ? [{ label: "Other", value: otherVal, color: PIE_COLORS[5] }] : []),
    ];

    return {
      totalIncome,
      totalExpenses,
      surplus,
      needs,
      wants,
      savingsAmt,
      needsPct,
      wantsPct,
      savingsPct,
      health,
      pieData,
    };
  }, [salary, otherIncome, expenses]);

  const healthColor =
    results.health === "Healthy"
      ? "#2d8653"
      : results.health === "Tight"
      ? "#f59e0b"
      : "#ef4444";

  const healthBg =
    results.health === "Healthy"
      ? "#dcebe1"
      : results.health === "Tight"
      ? "#fef3c7"
      : "#fee2e2";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Income Section */}
      <div className="surface" style={{ padding: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Monthly Income</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 16 }}>
          <label style={{ display: "block" }}>
            <span style={{ display: "block", color: "#465a50", fontSize: ".85rem", fontWeight: 650, marginBottom: 8 }}>
              Monthly Salary
            </span>
            <span style={{ display: "flex", position: "relative", alignItems: "center" }}>
              <span aria-hidden style={{ position: "absolute", left: 12, fontSize: 13, color: "var(--muted)", pointerEvents: "none", zIndex: 1 }}>
                {currency.sym}
              </span>
              <input
                className="field-input"
                type="number"
                value={salary}
                min={0}
                onChange={(e) => setSalary(+e.target.value)}
                style={{ paddingLeft: 28 }}
              />
            </span>
          </label>
          <label style={{ display: "block" }}>
            <span style={{ display: "block", color: "#465a50", fontSize: ".85rem", fontWeight: 650, marginBottom: 8 }}>
              Other Income (Freelance, Rental, etc.)
            </span>
            <span style={{ display: "flex", position: "relative", alignItems: "center" }}>
              <span aria-hidden style={{ position: "absolute", left: 12, fontSize: 13, color: "var(--muted)", pointerEvents: "none", zIndex: 1 }}>
                {currency.sym}
              </span>
              <input
                className="field-input"
                type="number"
                value={otherIncome}
                min={0}
                onChange={(e) => setOtherIncome(+e.target.value)}
                style={{ paddingLeft: 28 }}
              />
            </span>
          </label>
        </div>
      </div>

      {/* Expenses Section */}
      <div className="surface" style={{ padding: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Monthly Expenses</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 16 }}>
          {EXPENSE_CATEGORIES.map((cat) => (
            <label key={cat.key} style={{ display: "block" }}>
              <span style={{ display: "block", color: "#465a50", fontSize: ".85rem", fontWeight: 650, marginBottom: 8 }}>
                {cat.label}
              </span>
              <span style={{ display: "flex", position: "relative", alignItems: "center" }}>
                <span aria-hidden style={{ position: "absolute", left: 12, fontSize: 13, color: "var(--muted)", pointerEvents: "none", zIndex: 1 }}>
                  {currency.sym}
                </span>
                <input
                  className="field-input"
                  type="number"
                  value={expenses[cat.key]}
                  min={0}
                  onChange={(e) => setExpense(cat.key, +e.target.value)}
                  style={{ paddingLeft: 28 }}
                />
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{ background: "var(--wash)", border: "1px solid #dcebe1", borderRadius: 14, padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div className="eyebrow">Results</div>
          <span
            style={{
              background: healthBg,
              color: healthColor,
              fontWeight: 700,
              fontSize: 13,
              borderRadius: 20,
              padding: "4px 14px",
              border: `1px solid ${healthColor}33`,
            }}
          >
            {results.health}
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,160px),1fr))", gap: 18 }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Total Income</div>
            <div className="result-value">{fmt(results.totalIncome)}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Total Expenses</div>
            <div className="result-value">{fmt(results.totalExpenses)}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
              Monthly {results.surplus >= 0 ? "Surplus" : "Deficit"}
            </div>
            <div
              className="result-value"
              style={{ color: results.surplus >= 0 ? "#2d8653" : "#ef4444" }}
            >
              {results.surplus >= 0 ? fmt(results.surplus) : `-${fmt(Math.abs(results.surplus))}`}
            </div>
          </div>
        </div>
      </div>

      {/* 50/30/20 Rule */}
      <div style={{ background: "var(--wash)", border: "1px solid #dcebe1", borderRadius: 14, padding: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 4 }}>50 / 30 / 20 Rule Analysis</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 18 }}>
          Recommended: 50% Needs · 30% Wants · 20% Savings
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Needs", pct: results.needsPct, target: 50, value: results.needs, color: "#2d8653" },
            { label: "Wants", pct: results.wantsPct, target: 30, value: results.wants, color: "#f59e0b" },
            { label: "Savings", pct: results.savingsPct, target: 20, value: results.savingsAmt, color: "#6366f1" },
          ].map(({ label, pct, target, value, color }) => {
            const over = pct > target + 5;
            const barPct = Math.min(pct, 100);
            const targetPct = Math.min(target, 100);
            return (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                  <span style={{ fontWeight: 650, color: "var(--ink)" }}>{label}</span>
                  <span>
                    <span style={{ fontWeight: 700, color: over ? "#ef4444" : color }}>{fmtPct(pct)}</span>
                    <span style={{ color: "var(--muted)", marginLeft: 6 }}>/ {target}% rec. · {fmt(value)}</span>
                  </span>
                </div>
                <div style={{ background: "#e5e7eb", borderRadius: 6, height: 10, position: "relative", overflow: "hidden" }}>
                  <div
                    style={{
                      background: over ? "#ef4444" : color,
                      width: `${barPct}%`,
                      height: "100%",
                      borderRadius: 6,
                      transition: "width 0.3s",
                    }}
                  />
                  {/* target marker */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: `${targetPct}%`,
                      width: 2,
                      height: "100%",
                      background: "#374151",
                      opacity: 0.4,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pie Chart */}
      {results.pieData.length > 0 && (
        <div style={{ background: "var(--wash)", border: "1px solid #dcebe1", borderRadius: 14, padding: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Expenses Breakdown</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "center" }}>
            <PieChart data={results.pieData} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {results.pieData.map((d, i) => {
                const pct = results.totalExpenses > 0 ? (d.value / results.totalExpenses) * 100 : 0;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 3,
                        background: d.color,
                        flexShrink: 0,
                        display: "inline-block",
                      }}
                    />
                    <span style={{ color: "var(--ink)", fontWeight: 600 }}>{d.label}</span>
                    <span style={{ color: "var(--muted)", marginLeft: "auto", paddingLeft: 12 }}>
                      {fmt(d.value)} ({fmtPct(pct)})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
