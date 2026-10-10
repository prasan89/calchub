"use client";
import { useState } from "react";
import { IN, US, type Currency } from "@/lib/calculators/engine";
import type { CalculatorDefinition } from "@/lib/calculators/catalog";

type Mode = "add" | "remove" | "find";

interface Props {
  calculator: CalculatorDefinition;
  currency?: Currency;
}

export default function SalesTaxCalculator({ currency = US }: Props) {
  const isIndia = currency.locale === "en-IN";
  const taxLabel = isIndia ? "GST" : "Sales Tax";

  const [mode, setMode] = useState<Mode>("add");
  const [pretax, setPretax] = useState(100);
  const [taxRate, setTaxRate] = useState(isIndia ? 18 : 8.5);
  const [total, setTotal] = useState(108.5);

  const fmt = (x: number) =>
    Number.isFinite(x)
      ? `${currency.sym}${x.toLocaleString(currency.locale, { maximumFractionDigits: 2 })}`
      : "—";
  const fmtN = (x: number, d = 4) =>
    Number.isFinite(x)
      ? x.toLocaleString(currency.locale, { maximumFractionDigits: d })
      : "—";

  // Calculated results based on mode
  let taxAmount = 0;
  let totalPrice = 0;
  let pretaxPrice = 0;
  let computedRate = 0;

  if (mode === "add") {
    taxAmount = pretax * (taxRate / 100);
    totalPrice = pretax + taxAmount;
    pretaxPrice = pretax;
    computedRate = taxRate;
  } else if (mode === "remove") {
    // total includes tax, find pre-tax
    pretaxPrice = total / (1 + taxRate / 100);
    taxAmount = total - pretaxPrice;
    totalPrice = total;
    computedRate = taxRate;
  } else if (mode === "find") {
    // find rate given pre-tax and total
    taxAmount = total - pretax;
    totalPrice = total;
    pretaxPrice = pretax;
    computedRate = pretax > 0 ? (taxAmount / pretax) * 100 : 0;
  }

  const priceShare = totalPrice > 0 ? (pretaxPrice / totalPrice) * 100 : 0;
  const taxShare = totalPrice > 0 ? (taxAmount / totalPrice) * 100 : 0;

  // SVG donut chart values
  const r = 54;
  const cx = 70;
  const cy = 70;
  const strokeWidth = 22;
  const circ = 2 * Math.PI * r;
  const taxDash = (taxShare / 100) * circ;
  const priceDash = (priceShare / 100) * circ;
  const gap = 2;

  const modeButton = (m: Mode, label: string) => (
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {isIndia && (
        <div
          style={{
            background: "var(--wash)",
            border: "1px solid #dcebe1",
            borderRadius: 12,
            padding: "14px 18px",
            fontSize: 13.5,
            color: "var(--muted)",
          }}
        >
          <strong style={{ color: "var(--ink)" }}>India uses GST</strong> — India replaced state-level sales tax with the{" "}
          <em>Goods and Services Tax (GST)</em> in 2017. This calculator operates as a GST calculator below. For a
          dedicated GST calculator with CGST/SGST breakdown, see the GST calculator.
        </div>
      )}

      {/* Mode selector */}
      <div style={{ display: "flex", gap: 8 }}>
        {modeButton("add", isIndia ? "Add GST" : "Add Tax")}
        {modeButton("remove", isIndia ? "Remove GST" : "Remove Tax")}
        {modeButton("find", "Find Rate")}
      </div>

      {/* Inputs */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {(mode === "add" || mode === "find") && (
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
              {mode === "find" ? "Pre-tax Price" : "Pre-tax Price"}
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
                value={pretax}
                onChange={(e) => setPretax(+e.target.value)}
                style={{ paddingLeft: 28 }}
              />
            </span>
          </label>
        )}

        {mode === "remove" && (
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
              Total Price (with {taxLabel})
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
                value={total}
                onChange={(e) => setTotal(+e.target.value)}
                style={{ paddingLeft: 28 }}
              />
            </span>
          </label>
        )}

        {mode === "find" && (
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
              Total Price (with {taxLabel})
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
                value={total}
                onChange={(e) => setTotal(+e.target.value)}
                style={{ paddingLeft: 28 }}
              />
            </span>
          </label>
        )}

        {mode !== "find" && (
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
              {taxLabel} Rate (%)
            </span>
            <input
              className="field-input"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={taxRate}
              onChange={(e) => setTaxRate(+e.target.value)}
            />
          </label>
        )}
      </div>

      {/* Results + Donut */}
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
              gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,140px),1fr))",
              gap: 18,
            }}
          >
            {mode !== "remove" && (
              <div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--muted)",
                    fontWeight: 650,
                    marginBottom: 6,
                  }}
                >
                  Pre-tax Price
                </div>
                <div className="result-value">{fmt(pretaxPrice)}</div>
              </div>
            )}

            <div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                  fontWeight: 650,
                  marginBottom: 6,
                }}
              >
                {taxLabel} Amount
              </div>
              <div className="result-value">{fmt(taxAmount)}</div>
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
                Total Price
              </div>
              <div className="result-value">{fmt(totalPrice)}</div>
            </div>

            {mode === "find" && (
              <div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--muted)",
                    fontWeight: 650,
                    marginBottom: 6,
                  }}
                >
                  {taxLabel} Rate
                </div>
                <div className="result-value">
                  {fmtN(computedRate, 4)}%
                </div>
              </div>
            )}

            {mode === "remove" && (
              <div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--muted)",
                    fontWeight: 650,
                    marginBottom: 6,
                  }}
                >
                  Pre-tax Price
                </div>
                <div className="result-value">{fmt(pretaxPrice)}</div>
              </div>
            )}
          </div>

          {mode !== "find" && (
            <div
              style={{
                marginTop: 16,
                paddingTop: 14,
                borderTop: "1px solid var(--line)",
                fontSize: 12.5,
                color: "var(--muted)",
              }}
            >
              {taxLabel} rate applied: <strong>{fmtN(taxRate, 4)}%</strong>
              {isIndia && (
                <span>
                  {" "}· Common GST rates: 5%, 12%, 18%, 28%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Donut chart */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <svg width={140} height={140} viewBox="0 0 140 140">
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="#e8f0ea"
              strokeWidth={strokeWidth}
            />
            {/* Price segment */}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${Math.max(0, priceDash - gap)} ${circ - Math.max(0, priceDash - gap)}`}
              strokeDashoffset={circ / 4}
              strokeLinecap="butt"
            />
            {/* Tax segment */}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="#f0a500"
              strokeWidth={strokeWidth}
              strokeDasharray={`${Math.max(0, taxDash - gap)} ${circ - Math.max(0, taxDash - gap)}`}
              strokeDashoffset={circ / 4 - priceDash}
              strokeLinecap="butt"
            />
            <text
              x={cx}
              y={cy - 7}
              textAnchor="middle"
              fontSize={13}
              fontWeight={700}
              fill="var(--ink)"
            >
              {fmtN(taxShare, 1)}%
            </text>
            <text
              x={cx}
              y={cy + 11}
              textAnchor="middle"
              fontSize={10.5}
              fill="var(--muted)"
            >
              {taxLabel}
            </text>
          </svg>
          {/* Legend */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 11,
                  height: 11,
                  borderRadius: 3,
                  background: "var(--accent)",
                }}
              />
              <span style={{ color: "var(--muted)" }}>
                Price ({fmtN(priceShare, 1)}%)
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 11,
                  height: 11,
                  borderRadius: 3,
                  background: "#f0a500",
                }}
              />
              <span style={{ color: "var(--muted)" }}>
                {taxLabel} ({fmtN(taxShare, 1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick rate reference */}
      {!isIndia && (
        <div
          style={{
            background: "var(--wash)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: "14px 18px",
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 12 }}>
            Common US State Rates
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {[
              { state: "CA", rate: 7.25 },
              { state: "TX", rate: 6.25 },
              { state: "NY", rate: 4.0 },
              { state: "FL", rate: 6.0 },
              { state: "WA", rate: 6.5 },
              { state: "OR", rate: 0 },
            ].map(({ state, rate }) => (
              <button
                key={state}
                onClick={() => setTaxRate(rate)}
                style={{
                  padding: "5px 11px",
                  borderRadius: 7,
                  border: "1.5px solid var(--line)",
                  background: taxRate === rate ? "var(--accent)" : "transparent",
                  color: taxRate === rate ? "#fff" : "var(--ink)",
                  fontSize: 12.5,
                  fontWeight: 650,
                  cursor: "pointer",
                }}
              >
                {state} {rate}%
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 10 }}>
            State base rate only — local rates vary. Total effective rate may be higher.
          </div>
        </div>
      )}

      {isIndia && (
        <div
          style={{
            background: "var(--wash)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: "14px 18px",
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 12 }}>
            Common GST Rates
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[
              { label: "Exempt (0%)", rate: 0 },
              { label: "Essential (5%)", rate: 5 },
              { label: "Standard (12%)", rate: 12 },
              { label: "Standard (18%)", rate: 18 },
              { label: "Luxury (28%)", rate: 28 },
            ].map(({ label, rate }) => (
              <button
                key={rate}
                onClick={() => setTaxRate(rate)}
                style={{
                  padding: "5px 11px",
                  borderRadius: 7,
                  border: "1.5px solid var(--line)",
                  background: taxRate === rate ? "var(--accent)" : "transparent",
                  color: taxRate === rate ? "#fff" : "var(--ink)",
                  fontSize: 12.5,
                  fontWeight: 650,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 10 }}>
            GST is applied uniformly across India. CGST + SGST/UTGST = total GST shown above.
          </div>
        </div>
      )}
    </div>
  );
}
