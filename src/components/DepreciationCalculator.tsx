"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";
import {IN,US,type Currency} from "@/lib/calculators/engine";

type Method = "straight-line" | "declining-balance" | "sum-of-years";

interface DepreciationRow {
  year: number;
  depreciationAmount: number;
  accumulatedDepreciation: number;
  bookValue: number;
}

function makeFmt(currency: Currency) {
  const nf = new Intl.NumberFormat(currency.locale, {maximumFractionDigits: 2});
  return (x: number) => Number.isFinite(x) ? `${currency.sym}${nf.format(x)}` : "—";
}

function fmtN(x: number, locale: string, d = 2) {
  return Number.isFinite(x) ? x.toLocaleString(locale, {maximumFractionDigits: d}) : "—";
}

function NumInput({label, value, onChange, prefixSym, suffix, step, min}: {
  label: string; value: string; onChange: (v: string) => void;
  prefixSym?: string; suffix?: string; step?: string; min?: string;
}) {
  return (
    <label style={{display: "block"}}>
      <span style={{display: "block", color: "#465a50", fontSize: ".85rem", fontWeight: 650, marginBottom: 8}}>{label}</span>
      <span style={{display: "flex", position: "relative", alignItems: "center"}}>
        {prefixSym && <span aria-hidden style={{position: "absolute", left: 12, fontSize: 13, color: "var(--muted)", pointerEvents: "none", zIndex: 1}}>{prefixSym}</span>}
        <input
          className="field-input"
          type="number"
          value={value}
          step={step ?? "any"}
          min={min ?? "0"}
          onChange={e => onChange(e.currentTarget.value)}
          style={{paddingLeft: prefixSym ? 28 : 13, paddingRight: suffix ? `${Math.max(suffix.length * 7 + 16, 40)}px` : "13px"}}
        />
        {suffix && <span aria-hidden style={{position: "absolute", right: 12, fontSize: 12, color: "var(--muted)", pointerEvents: "none"}}>{suffix}</span>}
      </span>
    </label>
  );
}

function SvgPie({segments}: {segments: {value: number; color: string; label: string}[]}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total <= 0 || !Number.isFinite(total)) return null;

  const cx = 90, cy = 90, r = 70;
  let currentAngle = -Math.PI / 2;
  const paths: React.ReactNode[] = [];

  segments.forEach((seg, i) => {
    if (seg.value <= 0) return;
    const ratio = seg.value / total;
    const startAngle = currentAngle;
    const sweep = ratio * 2 * Math.PI;
    const endAngle = startAngle + (sweep >= 2 * Math.PI ? 2 * Math.PI - 0.0001 : sweep);
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = sweep > Math.PI ? 1 : 0;
    const midAngle = startAngle + sweep / 2;
    const lx = cx + r * 0.65 * Math.cos(midAngle);
    const ly = cy + r * 0.65 * Math.sin(midAngle);
    paths.push(
      <path key={i} d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`} fill={seg.color} />,
      ratio > 0.08 && <text key={`t${i}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={11} fontWeight={700}>{Math.round(ratio * 100)}%</text>
    );
    currentAngle = endAngle;
  });

  return (
    <svg width={180} height={180} viewBox="0 0 180 180" aria-hidden="true">
      {paths}
    </svg>
  );
}

function computeSchedule(cost: number, salvage: number, life: number, method: Method, dbRate: number): DepreciationRow[] {
  const rows: DepreciationRow[] = [];
  let bookValue = cost;
  const depreciableBase = cost - salvage;

  if (depreciableBase <= 0 || life <= 0) return rows;

  for (let year = 1; year <= life; year++) {
    let depAmount = 0;

    if (method === "straight-line") {
      depAmount = depreciableBase / life;
    } else if (method === "declining-balance") {
      depAmount = bookValue * dbRate;
      // Don't depreciate below salvage value
      if (bookValue - depAmount < salvage) {
        depAmount = Math.max(0, bookValue - salvage);
      }
    } else if (method === "sum-of-years") {
      const sumYears = (life * (life + 1)) / 2;
      const remainingLife = life - year + 1;
      depAmount = (remainingLife / sumYears) * depreciableBase;
    }

    depAmount = Math.max(0, depAmount);
    bookValue = Math.max(salvage, bookValue - depAmount);

    const accumulated = cost - bookValue;
    rows.push({
      year,
      depreciationAmount: depAmount,
      accumulatedDepreciation: accumulated,
      bookValue,
    });
  }

  return rows;
}

const thStyle: React.CSSProperties = {padding: "10px 14px", textAlign: "right", fontWeight: 750, color: "var(--muted)", whiteSpace: "nowrap"};
const tdStyle: React.CSSProperties = {padding: "10px 14px", textAlign: "right"};

const METHOD_LABELS: Record<Method, string> = {
  "straight-line": "Straight-Line (SL)",
  "declining-balance": "Declining Balance (DB)",
  "sum-of-years": "Sum-of-Years-Digits (SYD)",
};

export default function DepreciationCalculator({calculator, currency = IN}: {calculator: CalculatorDefinition; currency?: Currency}) {
  const money = makeFmt(currency);
  const isUS = currency.locale === "en-US";

  const [assetCost, setAssetCost] = useState(isUS ? "50000" : "500000");
  const [salvageValue, setSalvageValue] = useState(isUS ? "5000" : "50000");
  const [usefulLife, setUsefulLife] = useState("10");
  const [method, setMethod] = useState<Method>("straight-line");
  const [dbRatePct, setDbRatePct] = useState("");
  const [viewYear, setViewYear] = useState("1");
  const [showTable, setShowTable] = useState(false);

  const result = useMemo(() => {
    const cost = parseFloat(assetCost) || 0;
    const salvage = parseFloat(salvageValue) || 0;
    const life = Math.round(parseFloat(usefulLife) || 0);

    if (cost <= 0 || life <= 0 || salvage < 0 || salvage >= cost) return null;

    const customRate = parseFloat(dbRatePct);
    const dbRate = method === "declining-balance"
      ? (Number.isFinite(customRate) && customRate > 0 ? customRate / 100 : 2 / life)
      : 2 / life;
    const effectiveDbRatePct = dbRate * 100;

    const schedule = computeSchedule(cost, salvage, life, method, dbRate);
    if (schedule.length === 0) return null;

    const firstYear = schedule[0];
    const totalDepreciation = cost - salvage;

    const yr = Math.min(Math.max(1, Math.round(parseFloat(viewYear) || 1)), life);
    const atYear = schedule[yr - 1];

    return {
      schedule,
      firstYear,
      totalDepreciation,
      atYear,
      yr,
      cost,
      salvage,
      life,
      effectiveDbRatePct,
    };
  }, [assetCost, salvageValue, usefulLife, method, dbRatePct, viewYear]);

  const pieSegments = result ? [
    {value: result.atYear.accumulatedDepreciation, color: "#176b4d", label: "Accumulated Depreciation"},
    {value: result.atYear.bookValue, color: "#b2cfc4", label: "Book Value"},
  ] : [];

  return (
    <section className="surface" style={{padding: 28}} aria-label="Depreciation calculator">

      {/* Inputs */}
      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 18, marginBottom: 24}}>
        <NumInput label="Asset Cost" value={assetCost} onChange={setAssetCost} prefixSym={currency.sym} />
        <NumInput label="Salvage Value" value={salvageValue} onChange={setSalvageValue} prefixSym={currency.sym} />
        <NumInput label="Useful Life" value={usefulLife} onChange={setUsefulLife} suffix="yrs" step="1" min="1" />

        {/* Method selector */}
        <label style={{display: "block"}}>
          <span style={{display: "block", color: "#465a50", fontSize: ".85rem", fontWeight: 650, marginBottom: 8}}>Depreciation Method</span>
          <select
            value={method}
            onChange={e => setMethod(e.currentTarget.value as Method)}
            style={{display: "block", width: "100%", border: "1px solid #cbd8cf", borderRadius: 10, padding: "12px 13px", background: "#fff", color: "var(--ink)", outline: "none", fontSize: "inherit", cursor: "pointer"}}
          >
            {(Object.keys(METHOD_LABELS) as Method[]).map(m => (
              <option key={m} value={m}>{METHOD_LABELS[m]}</option>
            ))}
          </select>
        </label>

        {/* DB rate override */}
        {method === "declining-balance" && (
          <NumInput
            label={`DB Rate (default: ${result ? fmtN(result.effectiveDbRatePct, currency.locale, 2) : "auto"}%)`}
            value={dbRatePct}
            onChange={setDbRatePct}
            suffix="%"
            step="0.1"
            min="0.1"
          />
        )}

        <NumInput label="Check at Year" value={viewYear} onChange={setViewYear} step="1" min="1" />
      </div>

      {/* Results */}
      {result && (
        <>
          <div style={{background: "var(--wash)", border: "1px solid #dcebe1", borderRadius: 14, padding: 22, marginBottom: 18}}>
            <div className="eyebrow" style={{marginBottom: 16}}>
              {METHOD_LABELS[method]} — Year {result.yr} of {result.life}
            </div>

            <div style={{display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start"}}>
              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,160px),1fr))", gap: 18}}>
                <div>
                  <div style={{fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6}}>Year {result.yr} Depreciation</div>
                  <div className="result-value">{money(result.atYear.depreciationAmount)}</div>
                </div>
                <div>
                  <div style={{fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6}}>Accumulated Depreciation</div>
                  <div className="result-value">{money(result.atYear.accumulatedDepreciation)}</div>
                </div>
                <div>
                  <div style={{fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6}}>Book Value (Year {result.yr})</div>
                  <div className="result-value">{money(result.atYear.bookValue)}</div>
                </div>
                <div>
                  <div style={{fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6}}>Year 1 Depreciation</div>
                  <div className="result-value">{money(result.firstYear.depreciationAmount)}</div>
                </div>
                <div>
                  <div style={{fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6}}>Total Depreciable Amount</div>
                  <div className="result-value">{money(result.totalDepreciation)}</div>
                </div>
                <div>
                  <div style={{fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6}}>Salvage Value</div>
                  <div className="result-value">{money(result.salvage)}</div>
                </div>
              </div>

              {/* Pie chart */}
              <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 10, minWidth: 160}}>
                <SvgPie segments={pieSegments} />
                <div style={{display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontWeight: 650}}>
                  <span style={{display: "flex", alignItems: "center", gap: 5}}>
                    <span style={{width: 10, height: 10, borderRadius: 2, background: "#176b4d", display: "inline-block"}} />
                    Accumulated Dep.
                  </span>
                  <span style={{display: "flex", alignItems: "center", gap: 5}}>
                    <span style={{width: 10, height: 10, borderRadius: 2, background: "#b2cfc4", display: "inline-block"}} />
                    Book Value
                  </span>
                </div>
              </div>
            </div>

            {method === "declining-balance" && (
              <div style={{marginTop: 16, padding: "10px 14px", background: "#f0f7f3", borderRadius: 8, fontSize: 13, color: "#465a50"}}>
                <strong>DB Rate applied:</strong> {fmtN(result.effectiveDbRatePct, currency.locale, 4)}% per year
                {!dbRatePct && <span style={{color: "var(--muted)", marginLeft: 8}}>(double declining = 2 / {result.life} years)</span>}
              </div>
            )}
          </div>

          {/* Toggle table */}
          <div style={{marginBottom: 18}}>
            <button
              type="button"
              style={{background: "none", border: "1px solid var(--line)", borderRadius: 10, padding: "9px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "var(--accent)"}}
              onClick={() => setShowTable(s => !s)}
            >
              {showTable ? "Hide" : "View"} Depreciation Schedule
            </button>
          </div>

          {/* Full Schedule Table */}
          {showTable && (
            <div style={{overflowX: "auto"}}>
              <table style={{width: "100%", borderCollapse: "collapse", fontSize: 13}}>
                <thead>
                  <tr style={{background: "var(--wash)", borderBottom: "2px solid var(--line)"}}>
                    <th style={{...thStyle, textAlign: "left"}}>Year</th>
                    <th style={thStyle}>Depreciation</th>
                    <th style={thStyle}>Accumulated</th>
                    <th style={thStyle}>Book Value</th>
                    <th style={thStyle}>% Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule.map(row => {
                    const pctRemaining = (row.bookValue / result.cost) * 100;
                    const isViewYear = row.year === result.yr;
                    return (
                      <tr
                        key={row.year}
                        style={{
                          borderBottom: "1px solid var(--line)",
                          background: isViewYear ? "#f0f7f3" : row.year % 2 === 0 ? "#fafcfa" : "white",
                          fontWeight: isViewYear ? 700 : undefined,
                        }}
                      >
                        <td style={{padding: "10px 14px"}}>
                          Year {row.year}
                          {isViewYear && <span style={{marginLeft: 8, fontSize: 10, color: "var(--accent)", fontWeight: 700, textTransform: "uppercase"}}>◀ selected</span>}
                        </td>
                        <td style={{...tdStyle, color: "#176b4d"}}>{money(row.depreciationAmount)}</td>
                        <td style={tdStyle}>{money(row.accumulatedDepreciation)}</td>
                        <td style={tdStyle}>{money(row.bookValue)}</td>
                        <td style={{...tdStyle, color: pctRemaining < 20 ? "#8a5a3a" : "inherit"}}>
                          {fmtN(pctRemaining, currency.locale, 1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{borderTop: "2px solid var(--line)", background: "var(--wash)", fontWeight: 750}}>
                    <td style={{padding: "10px 14px"}}>Total</td>
                    <td style={{...tdStyle, color: "#176b4d"}}>{money(result.totalDepreciation)}</td>
                    <td style={tdStyle}>{money(result.totalDepreciation)}</td>
                    <td style={tdStyle}>{money(result.salvage)}</td>
                    <td style={{...tdStyle, color: "var(--muted)"}}>
                      {fmtN((result.salvage / result.cost) * 100, currency.locale, 1)}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}

      {/* Error state: salvage >= cost */}
      {!result && (parseFloat(assetCost) > 0 || parseFloat(salvageValue) > 0) && (
        <div style={{padding: "14px 18px", background: "#fff5f5", border: "1px solid #f5c6c6", borderRadius: 10, color: "#8b2020", fontSize: 13}}>
          Please ensure Asset Cost is greater than Salvage Value, and Useful Life is at least 1 year.
        </div>
      )}

      <p style={{fontSize: 12, lineHeight: 1.6, color: "var(--muted)", marginTop: 20}}>
        Results are for estimation purposes. Tax depreciation rules vary by jurisdiction — consult a qualified accountant for compliance requirements.
        {!isUS && " In India, depreciation rates for tax purposes are governed by the Income Tax Act and Companies Act schedules."}
      </p>
    </section>
  );
}
