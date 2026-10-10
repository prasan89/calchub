"use client";
import { useState } from "react";
import { US, type Currency } from "@/lib/calculators/engine";
import type { CalculatorDefinition } from "@/lib/calculators/catalog";

type Mode = "straight" | "tiered" | "base";

interface Tier {
  upTo: number; // sales amount ceiling for this tier (Infinity for last tier)
  rate: number; // commission % for this tier
}

interface Props {
  calculator: CalculatorDefinition;
  currency?: Currency;
}

const DEFAULT_TIERS: Tier[] = [
  { upTo: 50000, rate: 5 },
  { upTo: 100000, rate: 8 },
  { upTo: Infinity, rate: 10 },
];

export default function CommissionCalculator({ currency = US }: Props) {
  const isIndia = currency.locale === "en-IN";

  const [mode, setMode] = useState<Mode>("straight");

  // Straight commission
  const [salesAmount, setSalesAmount] = useState(isIndia ? 500000 : 50000);
  const [commissionRate, setCommissionRate] = useState(10);

  // Tiered commission
  const [tieredSales, setTieredSales] = useState(isIndia ? 800000 : 80000);
  const [tiers, setTiers] = useState<Tier[]>(
    isIndia
      ? [
          { upTo: 500000, rate: 5 },
          { upTo: 1000000, rate: 8 },
          { upTo: Infinity, rate: 12 },
        ]
      : DEFAULT_TIERS
  );

  // Base + commission
  const [baseSalary, setBaseSalary] = useState(isIndia ? 600000 : 60000);
  const [baseSales, setBaseSales] = useState(isIndia ? 1000000 : 100000);
  const [baseRate, setBaseRate] = useState(8);

  const fmt = (x: number) =>
    Number.isFinite(x)
      ? `${currency.sym}${x.toLocaleString(currency.locale, { maximumFractionDigits: 2 })}`
      : "—";
  const fmtN = (x: number, d = 2) =>
    Number.isFinite(x)
      ? x.toLocaleString(currency.locale, { maximumFractionDigits: d })
      : "—";

  // ---- Calculations ----
  const straightCommission = salesAmount * (commissionRate / 100);
  const straightEffective = salesAmount > 0 ? (straightCommission / salesAmount) * 100 : 0;

  // Tiered calculation
  interface TierResult {
    label: string;
    salesInTier: number;
    rate: number;
    commission: number;
  }
  const computeTiered = (sales: number, tierList: Tier[]): TierResult[] => {
    const results: TierResult[] = [];
    let remaining = sales;
    let prevCeiling = 0;
    for (let i = 0; i < tierList.length; i++) {
      if (remaining <= 0) break;
      const tier = tierList[i];
      const ceiling = Number.isFinite(tier.upTo) ? tier.upTo : Infinity;
      const tierSize = Number.isFinite(ceiling) ? ceiling - prevCeiling : remaining;
      const salesInTier = Math.min(remaining, tierSize);
      const commission = salesInTier * (tier.rate / 100);
      const label =
        i === tierList.length - 1 || !Number.isFinite(tier.upTo)
          ? `Above ${fmt(prevCeiling)}`
          : `${fmt(prevCeiling)} – ${fmt(tier.upTo)}`;
      results.push({ label, salesInTier, rate: tier.rate, commission });
      remaining -= salesInTier;
      prevCeiling = Number.isFinite(ceiling) ? ceiling : prevCeiling + salesInTier;
    }
    return results;
  };

  const tieredResults = computeTiered(tieredSales, tiers);
  const tieredTotal = tieredResults.reduce((s, r) => s + r.commission, 0);
  const tieredEffective = tieredSales > 0 ? (tieredTotal / tieredSales) * 100 : 0;

  const baseCommission = baseSales * (baseRate / 100);
  const baseTotalEarnings = baseSalary + baseCommission;
  const baseEffective = baseSales > 0 ? (baseCommission / baseSales) * 100 : 0;

  // ---- Pie chart data ----
  const r = 54;
  const cx = 70;
  const cy = 70;
  const sw = 22;
  const circ = 2 * Math.PI * r;
  const gap = 2;

  const makePieArc = (share: number, offset: number, color: string) => {
    const dash = Math.max(0, (share / 100) * circ - gap);
    return (
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ / 4 - offset}
        strokeLinecap="butt"
      />
    );
  };

  const modeBtn = (m: Mode, label: string) => (
    <button
      key={m}
      onClick={() => setMode(m)}
      style={{
        flex: 1,
        padding: "9px 6px",
        borderRadius: 9,
        border: mode === m ? "1.5px solid var(--accent)" : "1.5px solid var(--line)",
        background: mode === m ? "var(--accent)" : "transparent",
        color: mode === m ? "#fff" : "var(--ink)",
        fontWeight: 650,
        fontSize: 13,
        cursor: "pointer",
        transition: "all .15s",
      }}
    >
      {label}
    </button>
  );

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "#465a50",
    fontSize: ".85rem",
    fontWeight: 650,
    marginBottom: 8,
  };

  const fieldWrap: React.CSSProperties = {
    display: "flex",
    position: "relative",
    alignItems: "center",
  };

  const symStyle: React.CSSProperties = {
    position: "absolute",
    left: 12,
    fontSize: 13,
    color: "var(--muted)",
    pointerEvents: "none",
    zIndex: 1,
  };

  // Tier management helpers
  const addTier = () => {
    setTiers((prev) => {
      const newTiers = prev.map((t, i) =>
        i === prev.length - 1 ? { ...t, upTo: isIndia ? 2000000 : 200000 } : t
      );
      newTiers.push({ upTo: Infinity, rate: 15 });
      return newTiers;
    });
  };

  const removeTier = (idx: number) => {
    setTiers((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, i) => i !== idx);
      // Ensure last tier always has Infinity ceiling
      return next.map((t, i) => (i === next.length - 1 ? { ...t, upTo: Infinity } : t));
    });
  };

  const updateTierRate = (idx: number, rate: number) => {
    setTiers((prev) => prev.map((t, i) => (i === idx ? { ...t, rate } : t)));
  };

  const updateTierUpTo = (idx: number, upTo: number) => {
    setTiers((prev) => prev.map((t, i) => (i === idx ? { ...t, upTo } : t)));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Mode selector */}
      <div style={{ display: "flex", gap: 8 }}>
        {modeBtn("straight", "Straight")}
        {modeBtn("tiered", "Tiered")}
        {modeBtn("base", "Base + Commission")}
      </div>

      {/* ---- STRAIGHT MODE ---- */}
      {mode === "straight" && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <label style={{ display: "block" }}>
              <span style={labelStyle}>Total Sales Amount</span>
              <span style={fieldWrap}>
                <span aria-hidden style={symStyle}>{currency.sym}</span>
                <input
                  className="field-input"
                  type="number"
                  min={0}
                  value={salesAmount}
                  onChange={(e) => setSalesAmount(+e.target.value)}
                  style={{ paddingLeft: 28 }}
                />
              </span>
            </label>

            <label style={{ display: "block" }}>
              <span style={labelStyle}>Commission Rate (%)</span>
              <input
                className="field-input"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={commissionRate}
                onChange={(e) => setCommissionRate(+e.target.value)}
              />
            </label>
          </div>

          {/* Straight results */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 20,
              alignItems: "start",
            }}
          >
            <div
              style={{
                background: "var(--wash)",
                border: "1px solid #dcebe1",
                borderRadius: 14,
                padding: 22,
              }}
            >
              <div className="eyebrow" style={{ marginBottom: 16 }}>
                Results
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,160px),1fr))",
                  gap: 18,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                    Sales Amount
                  </div>
                  <div className="result-value">{fmt(salesAmount)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                    Commission Earned
                  </div>
                  <div className="result-value">{fmt(straightCommission)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                    Effective Rate
                  </div>
                  <div className="result-value">{fmtN(straightEffective, 2)}%</div>
                </div>
              </div>
            </div>

            {/* Pie chart: commission vs net */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <svg width={140} height={140} viewBox="0 0 140 140">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8f0ea" strokeWidth={sw} />
                {makePieArc(100 - straightEffective, 0, "var(--accent)")}
                {makePieArc(straightEffective, ((100 - straightEffective) / 100) * circ, "#f0a500")}
                <text x={cx} y={cy - 7} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--ink)">
                  {fmtN(straightEffective, 1)}%
                </text>
                <text x={cx} y={cy + 11} textAnchor="middle" fontSize={10.5} fill="var(--muted)">
                  Commission
                </text>
              </svg>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ display: "inline-block", width: 11, height: 11, borderRadius: 3, background: "var(--accent)" }} />
                  <span style={{ color: "var(--muted)" }}>Net ({fmtN(100 - straightEffective, 1)}%)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ display: "inline-block", width: 11, height: 11, borderRadius: 3, background: "#f0a500" }} />
                  <span style={{ color: "var(--muted)" }}>Commission ({fmtN(straightEffective, 1)}%)</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ---- TIERED MODE ---- */}
      {mode === "tiered" && (
        <>
          <label style={{ display: "block" }}>
            <span style={labelStyle}>Total Sales Amount</span>
            <span style={fieldWrap}>
              <span aria-hidden style={symStyle}>{currency.sym}</span>
              <input
                className="field-input"
                type="number"
                min={0}
                value={tieredSales}
                onChange={(e) => setTieredSales(+e.target.value)}
                style={{ paddingLeft: 28 }}
              />
            </span>
          </label>

          {/* Tiers editor */}
          <div
            style={{
              background: "var(--wash)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: 18,
            }}
          >
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              Commission Tiers
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {tiers.map((tier, idx) => {
                const isLast = idx === tiers.length - 1;
                const prevCeiling = idx === 0 ? 0 : (Number.isFinite(tiers[idx - 1].upTo) ? tiers[idx - 1].upTo : 0);
                return (
                  <div key={idx} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ flex: 1, fontSize: 12.5, color: "var(--muted)", minWidth: 80 }}>
                      {isLast
                        ? `Above ${fmt(prevCeiling)}`
                        : `${fmt(prevCeiling)} to`}
                    </div>
                    {!isLast && (
                      <span style={fieldWrap}>
                        <span aria-hidden style={symStyle}>{currency.sym}</span>
                        <input
                          className="field-input"
                          type="number"
                          min={0}
                          value={Number.isFinite(tier.upTo) ? tier.upTo : ""}
                          onChange={(e) => updateTierUpTo(idx, +e.target.value)}
                          style={{ paddingLeft: 28, width: 120 }}
                        />
                      </span>
                    )}
                    {isLast && <div style={{ width: 120 }} />}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input
                        className="field-input"
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        value={tier.rate}
                        onChange={(e) => updateTierRate(idx, +e.target.value)}
                        style={{ width: 70 }}
                      />
                      <span style={{ fontSize: 13, color: "var(--muted)" }}>%</span>
                    </div>
                    {tiers.length > 1 && (
                      <button
                        onClick={() => removeTier(idx)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 7,
                          border: "1.5px solid var(--line)",
                          background: "transparent",
                          color: "var(--muted)",
                          cursor: "pointer",
                          fontSize: 16,
                          lineHeight: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Remove tier"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              onClick={addTier}
              style={{
                marginTop: 12,
                padding: "6px 14px",
                borderRadius: 8,
                border: "1.5px solid var(--accent)",
                background: "transparent",
                color: "var(--accent)",
                fontWeight: 650,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              + Add Tier
            </button>
          </div>

          {/* Tiered results */}
          <div
            style={{
              background: "var(--wash)",
              border: "1px solid #dcebe1",
              borderRadius: 14,
              padding: 22,
            }}
          >
            <div className="eyebrow" style={{ marginBottom: 16 }}>
              Results
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,160px),1fr))",
                gap: 18,
                marginBottom: 18,
              }}
            >
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                  Total Sales
                </div>
                <div className="result-value">{fmt(tieredSales)}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                  Total Commission
                </div>
                <div className="result-value">{fmt(tieredTotal)}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                  Effective Rate
                </div>
                <div className="result-value">{fmtN(tieredEffective, 2)}%</div>
              </div>
            </div>

            {/* Tier breakdown table */}
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>
                Tier Breakdown
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr>
                      {["Tier Range", "Sales in Tier", "Rate", "Commission"].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "6px 10px",
                            fontSize: 12,
                            fontWeight: 650,
                            color: "var(--muted)",
                            borderBottom: "1px solid var(--line)",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tieredResults.map((row, i) => (
                      <tr
                        key={i}
                        style={{ background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)" }}
                      >
                        <td style={{ padding: "7px 10px", color: "var(--ink)" }}>{row.label}</td>
                        <td style={{ padding: "7px 10px", color: "var(--ink)" }}>{fmt(row.salesInTier)}</td>
                        <td style={{ padding: "7px 10px", color: "var(--ink)" }}>{fmtN(row.rate, 2)}%</td>
                        <td style={{ padding: "7px 10px", color: "var(--accent)", fontWeight: 700 }}>
                          {fmt(row.commission)}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: "1.5px solid var(--line)" }}>
                      <td
                        colSpan={3}
                        style={{ padding: "8px 10px", fontWeight: 700, color: "var(--ink)" }}
                      >
                        Total
                      </td>
                      <td style={{ padding: "8px 10px", fontWeight: 700, color: "var(--accent)" }}>
                        {fmt(tieredTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ---- BASE + COMMISSION MODE ---- */}
      {mode === "base" && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <label style={{ display: "block" }}>
              <span style={labelStyle}>Annual Base Salary</span>
              <span style={fieldWrap}>
                <span aria-hidden style={symStyle}>{currency.sym}</span>
                <input
                  className="field-input"
                  type="number"
                  min={0}
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(+e.target.value)}
                  style={{ paddingLeft: 28 }}
                />
              </span>
            </label>

            <label style={{ display: "block" }}>
              <span style={labelStyle}>Total Sales Amount</span>
              <span style={fieldWrap}>
                <span aria-hidden style={symStyle}>{currency.sym}</span>
                <input
                  className="field-input"
                  type="number"
                  min={0}
                  value={baseSales}
                  onChange={(e) => setBaseSales(+e.target.value)}
                  style={{ paddingLeft: 28 }}
                />
              </span>
            </label>

            <label style={{ display: "block" }}>
              <span style={labelStyle}>Commission Rate (%)</span>
              <input
                className="field-input"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={baseRate}
                onChange={(e) => setBaseRate(+e.target.value)}
              />
            </label>
          </div>

          {/* Base results */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 20,
              alignItems: "start",
            }}
          >
            <div
              style={{
                background: "var(--wash)",
                border: "1px solid #dcebe1",
                borderRadius: 14,
                padding: 22,
              }}
            >
              <div className="eyebrow" style={{ marginBottom: 16 }}>
                Results
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,160px),1fr))",
                  gap: 18,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                    Base Salary
                  </div>
                  <div className="result-value">{fmt(baseSalary)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                    Commission Earned
                  </div>
                  <div className="result-value">{fmt(baseCommission)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                    Total Earnings
                  </div>
                  <div className="result-value" style={{ color: "var(--accent)" }}>{fmt(baseTotalEarnings)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                    Effective Comm. Rate
                  </div>
                  <div className="result-value">{fmtN(baseEffective, 2)}%</div>
                </div>
              </div>

              {/* Earnings breakdown */}
              <div style={{ marginTop: 18, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 8 }}>Earnings breakdown</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Base Salary", value: baseSalary, color: "var(--accent)" },
                    { label: "Commission", value: baseCommission, color: "#f0a500" },
                  ].map(({ label, value, color }) => {
                    const pct = baseTotalEarnings > 0 ? (value / baseTotalEarnings) * 100 : 0;
                    return (
                      <div key={label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12.5 }}>
                          <span style={{ color: "var(--ink)" }}>{label}</span>
                          <span style={{ color: "var(--muted)" }}>
                            {fmt(value)} ({fmtN(pct, 1)}%)
                          </span>
                        </div>
                        <div style={{ height: 6, borderRadius: 4, background: "#e8f0ea", overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: color,
                              borderRadius: 4,
                              transition: "width .3s",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Pie chart */}
            {(() => {
              const baseShare = baseTotalEarnings > 0 ? (baseSalary / baseTotalEarnings) * 100 : 50;
              const commShare = baseTotalEarnings > 0 ? (baseCommission / baseTotalEarnings) * 100 : 50;
              const baseDash = Math.max(0, (baseShare / 100) * circ - gap);
              const commDash = Math.max(0, (commShare / 100) * circ - gap);
              return (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <svg width={140} height={140} viewBox="0 0 140 140">
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8f0ea" strokeWidth={sw} />
                    <circle
                      cx={cx} cy={cy} r={r} fill="none"
                      stroke="var(--accent)" strokeWidth={sw}
                      strokeDasharray={`${baseDash} ${circ - baseDash}`}
                      strokeDashoffset={circ / 4}
                      strokeLinecap="butt"
                    />
                    <circle
                      cx={cx} cy={cy} r={r} fill="none"
                      stroke="#f0a500" strokeWidth={sw}
                      strokeDasharray={`${commDash} ${circ - commDash}`}
                      strokeDashoffset={circ / 4 - baseDash - gap}
                      strokeLinecap="butt"
                    />
                    <text x={cx} y={cy - 7} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--ink)">
                      {fmtN(commShare, 1)}%
                    </text>
                    <text x={cx} y={cy + 11} textAnchor="middle" fontSize={10.5} fill="var(--muted)">
                      Comm.
                    </text>
                  </svg>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ display: "inline-block", width: 11, height: 11, borderRadius: 3, background: "var(--accent)" }} />
                      <span style={{ color: "var(--muted)" }}>Base ({fmtN(baseShare, 1)}%)</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ display: "inline-block", width: 11, height: 11, borderRadius: 3, background: "#f0a500" }} />
                      <span style={{ color: "var(--muted)" }}>Commission ({fmtN(commShare, 1)}%)</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </>
      )}

      {/* Context note */}
      <div
        style={{
          background: "var(--wash)",
          border: "1px solid var(--line)",
          borderRadius: 10,
          padding: "14px 18px",
          fontSize: 12.5,
          color: "var(--muted)",
        }}
      >
        {isIndia ? (
          <>
            <strong style={{ color: "var(--ink)" }}>India note:</strong> Commission income is taxable under{" "}
            <em>Income from Business or Profession</em> or as salary depending on the employment arrangement.
            TDS may apply under Section 194H at 5% for commission agents.
          </>
        ) : (
          <>
            <strong style={{ color: "var(--ink)" }}>US note:</strong> Commission income is fully taxable as ordinary income.
            Self-employed commission earners may also owe self-employment tax (15.3%). Consult a tax professional for your situation.
          </>
        )}
      </div>
    </div>
  );
}
