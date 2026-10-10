"use client";
import { useState, useMemo } from "react";
import { IN, US, type Currency } from "@/lib/calculators/engine";
import type { CalculatorDefinition } from "@/lib/calculators/catalog";

interface Props {
  calculator: CalculatorDefinition;
  currency?: Currency;
}

type CompoundFreq = "annually" | "quarterly" | "monthly";

interface YearRow {
  year: number;
  contributionsThisYear: number;
  balance: number;
}

function calcInvestment(
  principal: number,
  monthly: number,
  annualRate: number,
  years: number,
  freq: CompoundFreq
) {
  const n = freq === "annually" ? 1 : freq === "quarterly" ? 4 : 12;
  const r = annualRate / 100 / n;
  const periods = n * years;
  const contribPerPeriod = monthly * (12 / n);

  // Future value of lump sum
  const fvLump = principal * Math.pow(1 + r, periods);

  // Future value of annuity (contributions each period)
  const fvContrib =
    r === 0
      ? contribPerPeriod * periods
      : contribPerPeriod * ((Math.pow(1 + r, periods) - 1) / r);

  const futureValue = fvLump + fvContrib;
  const totalContributions = monthly * 12 * years;
  const totalInvested = principal + totalContributions;
  const totalGrowth = futureValue - totalInvested;

  // Effective annual yield
  const effectiveAnnual = Math.pow(1 + r, n) - 1;

  return { futureValue, totalInvested, totalContributions, totalGrowth, effectiveAnnual };
}

function calcYearTable(
  principal: number,
  monthly: number,
  annualRate: number,
  years: number,
  freq: CompoundFreq
): YearRow[] {
  const n = freq === "annually" ? 1 : freq === "quarterly" ? 4 : 12;
  const r = annualRate / 100 / n;
  const contribPerPeriod = monthly * (12 / n);
  const rows: YearRow[] = [];
  let balance = principal;

  for (let yr = 1; yr <= years; yr++) {
    const contribYear = monthly * 12;
    for (let p = 0; p < n; p++) {
      balance = balance * (1 + r) + contribPerPeriod;
    }
    rows.push({ year: yr, contributionsThisYear: contribYear, balance });
  }
  return rows;
}

// SVG pie chart
function PieChart({
  slices,
}: {
  slices: { value: number; color: string; label: string }[];
}) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total <= 0) return null;

  const r = 70;
  const cx = 90;
  const cy = 90;
  let cumAngle = -Math.PI / 2;

  const paths = slices.map((slice) => {
    const frac = slice.value / total;
    const angle = frac * 2 * Math.PI;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    return (
      <path
        key={slice.label}
        d={`M${cx},${cy} L${x1},${y1} A${r},${r},0,${largeArc},1,${x2},${y2} Z`}
        fill={slice.color}
      />
    );
  });

  return (
    <svg viewBox="0 0 180 180" width={180} height={180} aria-hidden>
      {paths}
    </svg>
  );
}

export default function InvestmentCalculator({ calculator, currency = IN }: Props) {
  const isUS = currency.locale === "en-US";

  const [principal, setPrincipal] = useState(isUS ? 10000 : 100000);
  const [monthly, setMonthly] = useState(isUS ? 500 : 5000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(10);
  const [freq, setFreq] = useState<CompoundFreq>("monthly");
  const [showTable, setShowTable] = useState(false);

  const fmt = (x: number) =>
    Number.isFinite(x)
      ? `${currency.sym}${x.toLocaleString(currency.locale, { maximumFractionDigits: 2 })}`
      : "—";
  const fmtN = (x: number, d = 2) =>
    Number.isFinite(x)
      ? x.toLocaleString(currency.locale, { maximumFractionDigits: d })
      : "—";

  const result = useMemo(
    () => calcInvestment(principal, monthly, rate, years, freq),
    [principal, monthly, rate, years, freq]
  );

  const tableRows = useMemo(
    () => (showTable ? calcYearTable(principal, monthly, rate, years, freq) : []),
    [principal, monthly, rate, years, freq, showTable]
  );

  const pieSlices = [
    { value: principal, color: "#2d7a4f", label: "Initial investment" },
    { value: result.totalContributions, color: "#5aab7a", label: "Contributions" },
    { value: Math.max(0, result.totalGrowth), color: "#b8e6cc", label: "Growth" },
  ];

  const labelStyle = {
    display: "block",
    color: "#465a50",
    fontSize: ".85rem",
    fontWeight: 650,
    marginBottom: 8,
  } as const;

  const inputWrap = { display: "flex", position: "relative", alignItems: "center" } as const;
  const prefixStyle = {
    position: "absolute",
    left: 12,
    fontSize: 13,
    color: "var(--muted)",
    pointerEvents: "none",
    zIndex: 1,
  } as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Inputs */}
      <div className="surface" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 20 }}>
        {/* Initial investment */}
        <label style={{ display: "block" }}>
          <span style={labelStyle}>Initial Investment</span>
          <span style={inputWrap}>
            <span aria-hidden style={prefixStyle}>{currency.sym}</span>
            <input
              className="field-input"
              type="number"
              min={0}
              value={principal}
              onChange={(e) => setPrincipal(+e.target.value)}
              style={{ paddingLeft: 28 }}
            />
          </span>
        </label>

        {/* Monthly contribution */}
        <label style={{ display: "block" }}>
          <span style={labelStyle}>Monthly Contribution</span>
          <span style={inputWrap}>
            <span aria-hidden style={prefixStyle}>{currency.sym}</span>
            <input
              className="field-input"
              type="number"
              min={0}
              value={monthly}
              onChange={(e) => setMonthly(+e.target.value)}
              style={{ paddingLeft: 28 }}
            />
          </span>
        </label>

        {/* Annual return */}
        <label style={{ display: "block" }}>
          <span style={labelStyle}>Annual Return (%)</span>
          <span style={inputWrap}>
            <span aria-hidden style={{ ...prefixStyle, left: 10 }}>%</span>
            <input
              className="field-input"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(+e.target.value)}
              style={{ paddingLeft: 24 }}
            />
          </span>
        </label>

        {/* Investment period */}
        <label style={{ display: "block" }}>
          <span style={labelStyle}>Investment Period (years)</span>
          <input
            className="field-input"
            type="number"
            min={1}
            max={60}
            value={years}
            onChange={(e) => setYears(Math.max(1, +e.target.value))}
          />
        </label>

        {/* Compound frequency */}
        <label style={{ display: "block" }}>
          <span style={labelStyle}>Compound Frequency</span>
          <select
            className="field-input"
            value={freq}
            onChange={(e) => setFreq(e.target.value as CompoundFreq)}
            style={{ appearance: "auto" }}
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
          </select>
        </label>
      </div>

      {/* Results */}
      <div style={{ background: "var(--wash)", border: "1px solid #dcebe1", borderRadius: 14, padding: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Results</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,160px),1fr))", gap: 18 }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Future Value</div>
            <div className="result-value">{fmt(result.futureValue)}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Total Invested</div>
            <div className="result-value">{fmt(result.totalInvested)}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Total Growth</div>
            <div className="result-value" style={{ color: "var(--accent)" }}>{fmt(result.totalGrowth)}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Effective Annual Yield</div>
            <div className="result-value">{fmtN(result.effectiveAnnual * 100, 3)}%</div>
          </div>
        </div>
      </div>

      {/* Pie chart + legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
        <PieChart slices={pieSlices} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {pieSlices.map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 14, height: 14, borderRadius: 3, background: s.color, flexShrink: 0, display: "inline-block" }} />
              <span style={{ fontSize: 13, color: "var(--ink)" }}>
                <strong>{s.label}</strong>
                <span style={{ color: "var(--muted)", marginLeft: 6 }}>{fmt(s.value)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Year-by-year table toggle */}
      <div>
        <button
          onClick={() => setShowTable((v) => !v)}
          style={{
            background: "none",
            border: "1px solid var(--line)",
            borderRadius: 8,
            padding: "8px 18px",
            cursor: "pointer",
            fontSize: 14,
            color: "var(--ink)",
            fontWeight: 600,
          }}
        >
          {showTable ? "Hide" : "Show"} Year-by-Year Breakdown
        </button>

        {showTable && (
          <div style={{ overflowX: "auto", marginTop: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "var(--wash)" }}>
                  <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid var(--line)" }}>Year</th>
                  <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, borderBottom: "2px solid var(--line)" }}>Contributions (yr)</th>
                  <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, borderBottom: "2px solid var(--line)" }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.year} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "9px 14px" }}>{row.year}</td>
                    <td style={{ padding: "9px 14px", textAlign: "right" }}>{fmt(row.contributionsThisYear)}</td>
                    <td style={{ padding: "9px 14px", textAlign: "right", fontWeight: 600 }}>{fmt(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
        This is an illustrative projection only. Actual returns will vary based on market conditions, fees, and taxes.
        {isUS ? " US figures shown in USD." : " Indian figures shown in INR."}
      </p>
    </div>
  );
}
