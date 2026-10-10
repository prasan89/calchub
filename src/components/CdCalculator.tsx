"use client";
import { useState, useMemo } from "react";
import { IN, US, type Currency } from "@/lib/calculators/engine";
import type { CalculatorDefinition } from "@/lib/calculators/catalog";

interface Props {
  calculator: CalculatorDefinition;
  currency?: Currency;
}

const FREQUENCIES = [
  { label: "Daily", value: 365 },
  { label: "Monthly", value: 12 },
  { label: "Quarterly", value: 4 },
  { label: "Semi-annually", value: 2 },
  { label: "Annually", value: 1 },
];

export default function CdCalculator({ calculator: _calc, currency = IN }: Props) {
  const isUS = currency.locale === "en-US";

  const [principal, setPrincipal] = useState(isUS ? 10000 : 100000);
  const [rate, setRate] = useState(isUS ? 5 : 7);
  const [termMonths, setTermMonths] = useState(12);
  const [compFreq, setCompFreq] = useState(12); // monthly default

  const fmt = (x: number) =>
    Number.isFinite(x)
      ? `${currency.sym}${x.toLocaleString(currency.locale, { maximumFractionDigits: 2 })}`
      : "—";

  const fmtN = (x: number, d = 2) =>
    Number.isFinite(x)
      ? x.toLocaleString(currency.locale, { maximumFractionDigits: d })
      : "—";

  const results = useMemo(() => {
    const P = principal > 0 ? principal : 0;
    const r = rate / 100;
    const n = compFreq;
    const t = termMonths / 12;

    // Maturity value: A = P * (1 + r/n)^(n*t)
    const maturity = P * Math.pow(1 + r / n, n * t);
    const interest = maturity - P;

    // APY = (1 + r/n)^n - 1
    const apy = (Math.pow(1 + r / n, n) - 1) * 100;

    // Effective rate for the term: (A/P - 1) * (12 / termMonths) * 100 annualized
    const effectiveRate = termMonths > 0 ? ((maturity / Math.max(P, 1) - 1) * (12 / termMonths)) * 100 : 0;

    return { maturity, interest, apy, effectiveRate };
  }, [principal, rate, termMonths, compFreq]);

  const { maturity, interest, apy, effectiveRate } = results;

  // Pie chart dimensions
  const PIE_R = 54;
  const CX = 64;
  const CY = 64;
  const total = maturity > 0 ? maturity : 1;
  const principalPct = Math.min(1, Math.max(0, principal / total));
  const interestPct = 1 - principalPct;

  function polarToXY(cx: number, cy: number, r: number, angle: number) {
    const rad = (angle - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number
  ) {
    const s = polarToXY(cx, cy, r, startAngle);
    const e = polarToXY(cx, cy, r, endAngle);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
  }

  const principalDeg = principalPct * 360;
  const interestDeg = interestPct * 360;

  const titleLabel = isUS ? "CD (Certificate of Deposit)" : "Fixed Deposit";

  return (
    <div style={{ fontFamily: "inherit", maxWidth: 600, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 4 }}>{titleLabel}</div>
        <div style={{ color: "var(--muted)", fontSize: 14 }}>
          {isUS
            ? "Calculate maturity value and yield for a Certificate of Deposit."
            : "Calculate maturity value and effective yield for a Fixed Deposit."}
        </div>
      </div>

      {/* Inputs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Principal */}
        <label style={{ display: "block" }}>
          <span
            style={{
              display: "block",
              color: "#465a50",
              fontSize: ".85rem",
              fontWeight: 650,
              marginBottom: 8,
            }}
          >
            {isUS ? "Deposit amount" : "Principal amount"}
          </span>
          <span style={{ display: "flex", position: "relative", alignItems: "center" }}>
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 12,
                fontSize: 13,
                color: "var(--muted)",
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              {currency.sym}
            </span>
            <input
              className="field-input"
              type="number"
              min={0}
              value={principal}
              onChange={(e) => setPrincipal(Math.max(0, +e.target.value))}
              style={{ paddingLeft: 28 }}
            />
          </span>
        </label>

        {/* Annual Interest Rate */}
        <label style={{ display: "block" }}>
          <span
            style={{
              display: "block",
              color: "#465a50",
              fontSize: ".85rem",
              fontWeight: 650,
              marginBottom: 8,
            }}
          >
            Annual interest rate
          </span>
          <span style={{ display: "flex", position: "relative", alignItems: "center" }}>
            <input
              className="field-input"
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={rate}
              onChange={(e) => setRate(Math.max(0, Math.min(100, +e.target.value)))}
              style={{ paddingRight: 32 }}
            />
            <span
              aria-hidden
              style={{
                position: "absolute",
                right: 12,
                fontSize: 13,
                color: "var(--muted)",
                pointerEvents: "none",
              }}
            >
              %
            </span>
          </span>
        </label>

        {/* Term */}
        <label style={{ display: "block" }}>
          <span
            style={{
              display: "block",
              color: "#465a50",
              fontSize: ".85rem",
              fontWeight: 650,
              marginBottom: 8,
            }}
          >
            Term (months)
          </span>
          <input
            className="field-input"
            type="number"
            min={1}
            max={360}
            value={termMonths}
            onChange={(e) => setTermMonths(Math.max(1, Math.min(360, Math.round(+e.target.value))))}
          />
        </label>

        {/* Compounding Frequency */}
        <label style={{ display: "block" }}>
          <span
            style={{
              display: "block",
              color: "#465a50",
              fontSize: ".85rem",
              fontWeight: 650,
              marginBottom: 8,
            }}
          >
            Compounding frequency
          </span>
          <select
            className="field-input"
            value={compFreq}
            onChange={(e) => setCompFreq(+e.target.value)}
            style={{ cursor: "pointer" }}
          >
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Results */}
      <div
        style={{
          background: "var(--wash)",
          border: "1px solid #dcebe1",
          borderRadius: 14,
          padding: 22,
          marginBottom: 24,
        }}
      >
        <div className="eyebrow" style={{ marginBottom: 16 }}>
          Results
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
            gap: 18,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                color: "var(--muted)",
                fontWeight: 650,
                marginBottom: 6,
              }}
            >
              {isUS ? "Maturity value" : "Maturity amount"}
            </div>
            <div className="result-value">{fmt(maturity)}</div>
          </div>

          <div>
            <div
              style={{
                fontSize: 13,
                color: "var(--muted)",
                fontWeight: 650,
                marginBottom: 6,
              }}
            >
              Interest earned
            </div>
            <div className="result-value">{fmt(interest)}</div>
          </div>

          <div>
            <div
              style={{
                fontSize: 13,
                color: "var(--muted)",
                fontWeight: 650,
                marginBottom: 6,
              }}
            >
              APY
            </div>
            <div className="result-value">{fmtN(apy, 4)}%</div>
          </div>

          <div>
            <div
              style={{
                fontSize: 13,
                color: "var(--muted)",
                fontWeight: 650,
                marginBottom: 6,
              }}
            >
              Effective annual rate
            </div>
            <div className="result-value">{fmtN(effectiveRate, 4)}%</div>
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      {maturity > 0 && interest > 0 && (
        <div
          style={{
            background: "var(--wash)",
            border: "1px solid #dcebe1",
            borderRadius: 14,
            padding: 22,
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            Composition
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              flexWrap: "wrap",
            }}
          >
            <svg
              width={128}
              height={128}
              viewBox="0 0 128 128"
              aria-label="Pie chart showing principal vs interest"
              role="img"
              style={{ flexShrink: 0 }}
            >
              {/* Principal slice */}
              <path
                d={arcPath(CX, CY, PIE_R, 0, principalDeg)}
                fill="var(--accent)"
                opacity={0.85}
              />
              {/* Interest slice */}
              {interestDeg > 0 && (
                <path
                  d={arcPath(CX, CY, PIE_R, principalDeg, 360)}
                  fill="#6cb8e6"
                  opacity={0.85}
                />
              )}
            </svg>

            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    background: "var(--accent)",
                    opacity: 0.85,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650 }}>
                    Principal
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
                    {fmt(principal)}{" "}
                    <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>
                      ({fmtN(principalPct * 100, 1)}%)
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    background: "#6cb8e6",
                    opacity: 0.85,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650 }}>
                    Interest earned
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
                    {fmt(interest)}{" "}
                    <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>
                      ({fmtN(interestPct * 100, 1)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
