"use client";
import { useMemo, useState } from "react";
import type { CalculatorDefinition } from "@/lib/calculators/catalog";
import { IN, US, type Currency } from "@/lib/calculators/engine";

const isIN = (c: Currency) => c.locale === "en-IN";

function makeFmt(currency: Currency) {
  const nf = new Intl.NumberFormat(currency.locale, { maximumFractionDigits: 2 });
  return (x: number) => (Number.isFinite(x) ? currency.sym + nf.format(x) : "—");
}
function makeNFmt(currency: Currency) {
  return (x: number, d = 2) =>
    Number.isFinite(x) ? x.toLocaleString(currency.locale, { maximumFractionDigits: d }) : "—";
}

// --- Shared sub-components ---

function NumInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  step?: number;
}) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", color: "#465a50", fontSize: ".85rem", fontWeight: 650, marginBottom: 8 }}>
        {label}
      </span>
      <span style={{ display: "flex", position: "relative", alignItems: "center" }}>
        {prefix && (
          <span
            aria-hidden
            style={{ position: "absolute", left: 12, fontSize: 13, color: "var(--muted)", pointerEvents: "none", zIndex: 1 }}
          >
            {prefix}
          </span>
        )}
        <input
          className="field-input"
          type="number"
          min={min ?? 0}
          step={step ?? 1}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          style={{ paddingLeft: prefix ? 28 : 13, paddingRight: suffix ? `${Math.max(suffix.length * 8 + 16, 36)}px` : 13 }}
        />
        {suffix && (
          <span
            aria-hidden
            style={{ position: "absolute", right: 12, fontSize: 12, color: "var(--muted)", pointerEvents: "none" }}
          >
            {suffix}
          </span>
        )}
      </span>
    </label>
  );
}

// --- Pie chart ---
function SvgPie({
  slices,
}: {
  slices: Array<{ value: number; color: string; label: string }>;
}) {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total <= 0 || !Number.isFinite(total)) return null;

  const cx = 90, cy = 90, r = 75;
  const paths: React.ReactNode[] = [];
  let startAngle = -Math.PI / 2;

  slices.forEach((sl, i) => {
    const pct = sl.value / total;
    if (pct <= 0) return;
    const sweep = pct * 2 * Math.PI;
    const safeSweep = sweep >= 2 * Math.PI ? 2 * Math.PI - 0.0001 : sweep;
    const endAngle = startAngle + safeSweep;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = safeSweep > Math.PI ? 1 : 0;
    const midAngle = startAngle + safeSweep / 2;
    const lx = cx + r * 0.65 * Math.cos(midAngle);
    const ly = cy + r * 0.65 * Math.sin(midAngle);
    paths.push(
      <path
        key={i}
        d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`}
        fill={sl.color}
      />
    );
    if (pct > 0.07) {
      paths.push(
        <text
          key={`lbl${i}`}
          x={lx}
          y={ly}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={10}
          fontWeight={700}
        >
          {Math.round(pct * 100)}%
        </text>
      );
    }
    startAngle = endAngle;
  });

  return (
    <svg width={180} height={180} viewBox="0 0 180 180" aria-hidden="true">
      {paths}
    </svg>
  );
}

// --- Amortization ---
type AmortRow = { month: number; payment: number; principal: number; interest: number; balance: number };

function buildAmortization(principal: number, monthlyRate: number, totalMonths: number, monthlyPayment: number): AmortRow[] {
  const rows: AmortRow[] = [];
  let balance = principal;
  for (let i = 1; i <= totalMonths && balance > 0.005; i++) {
    const interest = balance * monthlyRate;
    const prin = Math.min(monthlyPayment - interest, balance);
    balance = Math.max(0, balance - prin);
    rows.push({ month: i, payment: prin + interest, principal: prin, interest, balance });
  }
  return rows;
}

type YearlySummary = { year: number; payment: number; principal: number; interest: number; balance: number; rows: AmortRow[] };
function groupByYear(rows: AmortRow[]): YearlySummary[] {
  const map = new Map<number, AmortRow[]>();
  for (const r of rows) {
    const yr = Math.ceil(r.month / 12);
    if (!map.has(yr)) map.set(yr, []);
    map.get(yr)!.push(r);
  }
  return Array.from(map.entries()).map(([year, rs]) => ({
    year,
    payment: rs.reduce((s, r) => s + r.payment, 0),
    principal: rs.reduce((s, r) => s + r.principal, 0),
    interest: rs.reduce((s, r) => s + r.interest, 0),
    balance: rs[rs.length - 1].balance,
    rows: rs,
  }));
}

const thStyle: React.CSSProperties = { padding: "10px 14px", textAlign: "right", fontWeight: 750, color: "var(--muted)", whiteSpace: "nowrap" };
const tdStyle: React.CSSProperties = { padding: "10px 14px", textAlign: "right" };
const tableBtnStyle: React.CSSProperties = {
  background: "none", border: "1px solid var(--line)", borderRadius: 10,
  padding: "9px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "var(--accent)"
};

// --- Main component ---

export default function MortgageCalculator({
  calculator,
  currency = IN,
}: {
  calculator: CalculatorDefinition;
  currency?: Currency;
}) {
  const india = isIN(currency);
  const fmt = makeFmt(currency);
  const fmtN = makeNFmt(currency);

  // --- Core inputs ---
  const [homePrice, setHomePrice] = useState(india ? "5000000" : "350000");
  const [downAmt, setDownAmt] = useState(india ? "1000000" : "70000");
  const [downPct, setDownPct] = useState("20");
  const [lastChanged, setLastChanged] = useState<"amt" | "pct">("pct");
  const [loanTerm, setLoanTerm] = useState("20");
  const [interestRate, setInterestRate] = useState(india ? "8.5" : "6.5");

  // --- US extras ---
  const [propTaxRate, setPropTaxRate] = useState("1.2");
  const [homeInsurance, setHomeInsurance] = useState("150");
  const [monthlyHOA, setMonthlyHOA] = useState("0");
  const [pmiRate, setPmiRate] = useState("0.5");
  const [closingCosts, setClosingCosts] = useState("5000");

  // --- India extras ---
  const [processingFee, setProcessingFee] = useState("0.5");
  const [stampDuty, setStampDuty] = useState("5");

  // --- Table state ---
  const [showTable, setShowTable] = useState(false);
  const [tableMode, setTableMode] = useState<"yearly" | "monthly">("yearly");
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  // --- Sync down payment amount/pct ---
  const hp = parseFloat(homePrice) || 0;

  function handleDownAmt(v: string) {
    setDownAmt(v);
    setLastChanged("amt");
    const amt = parseFloat(v) || 0;
    if (hp > 0) setDownPct(((amt / hp) * 100).toFixed(2));
  }
  function handleDownPct(v: string) {
    setDownPct(v);
    setLastChanged("pct");
    const pct = parseFloat(v) || 0;
    setDownAmt(((pct / 100) * hp).toFixed(2));
  }
  function handleHomePrice(v: string) {
    setHomePrice(v);
    const newHp = parseFloat(v) || 0;
    if (lastChanged === "pct") {
      const pct = parseFloat(downPct) || 0;
      setDownAmt(((pct / 100) * newHp).toFixed(2));
    } else {
      const amt = parseFloat(downAmt) || 0;
      if (newHp > 0) setDownPct(((amt / newHp) * 100).toFixed(2));
    }
  }

  // --- Calculations ---
  const result = useMemo(() => {
    const price = parseFloat(homePrice) || 0;
    const down = parseFloat(downAmt) || 0;
    const termYrs = parseInt(loanTerm) || 0;
    const annualRate = parseFloat(interestRate) || 0;
    const principal = Math.max(0, price - down);

    if (price <= 0 || termYrs <= 0 || principal <= 0) return null;

    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = termYrs * 12;

    // Monthly P&I
    let monthlyPI: number;
    if (monthlyRate === 0) {
      monthlyPI = principal / totalMonths;
    } else {
      monthlyPI = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    const downPctNum = price > 0 ? (down / price) * 100 : 0;

    // US extras
    const monthlyPropTax = india ? 0 : (price * (parseFloat(propTaxRate) || 0)) / 100 / 12;
    const monthlyInsurance = india ? 0 : (parseFloat(homeInsurance) || 0);
    const hoa = india ? 0 : (parseFloat(monthlyHOA) || 0);
    const showPMI = !india && downPctNum < 20;
    const monthlyPMI = showPMI ? (principal * (parseFloat(pmiRate) || 0)) / 100 / 12 : 0;
    const closing = india ? 0 : (parseFloat(closingCosts) || 0);

    // India extras
    const procFeeAmt = india ? principal * (parseFloat(processingFee) || 0) / 100 : 0;
    const stampDutyAmt = india ? price * (parseFloat(stampDuty) || 0) / 100 : 0;

    // Total monthly
    const totalMonthly = monthlyPI + monthlyPropTax + monthlyInsurance + hoa + monthlyPMI;

    // Amortization
    const amortRows = buildAmortization(principal, monthlyRate, totalMonths, monthlyPI);
    const totalInterest = amortRows.reduce((s, r) => s + r.interest, 0);
    const totalPIPayments = monthlyPI * totalMonths;
    const totalCost = totalPIPayments + (india ? procFeeAmt + stampDutyAmt + down : down + monthlyPropTax * totalMonths + monthlyInsurance * totalMonths + hoa * totalMonths + monthlyPMI * 12 * Math.min(termYrs, ((downPctNum >= 20 ? 0 : 1))));

    // Effective APR (approximate — includes upfront fees amortized into monthly cost)
    let effectiveAPR = annualRate;
    if (!india && closing > 0 && principal > 0 && monthlyRate > 0) {
      // Newton's method to find the IRR that makes PV of payments = principal - closing
      // adjusted_principal = principal - closing (net proceeds)
      // Solve: adjusted = pmt * (1-(1+r)^-n)/r
      // We binary search for monthly rate that satisfies this
      const adjPrincipal = principal - closing;
      if (adjPrincipal > 0) {
        let lo = 0.000001, hi = 1;
        for (let iter = 0; iter < 60; iter++) {
          const mid = (lo + hi) / 2;
          const pv = monthlyPI * (1 - Math.pow(1 + mid, -totalMonths)) / mid;
          if (pv > adjPrincipal) lo = mid; else hi = mid;
        }
        effectiveAPR = ((lo + hi) / 2) * 12 * 100;
      }
    } else if (india && (procFeeAmt + stampDutyAmt) > 0 && principal > 0 && monthlyRate > 0) {
      const adjPrincipal = principal - procFeeAmt - stampDutyAmt;
      if (adjPrincipal > 0) {
        let lo = 0.000001, hi = 1;
        for (let iter = 0; iter < 60; iter++) {
          const mid = (lo + hi) / 2;
          const pv = monthlyPI * (1 - Math.pow(1 + mid, -totalMonths)) / mid;
          if (pv > adjPrincipal) lo = mid; else hi = mid;
        }
        effectiveAPR = ((lo + hi) / 2) * 12 * 100;
      }
    }

    // Break-even months for US (closing costs / monthly savings — simplified: months to recoup closing)
    const breakEvenMonths = !india && closing > 0 && monthlyPI > 0 ? Math.ceil(closing / (totalCost / totalMonths - (totalCost - closing) / totalMonths + 0.000001)) : null;

    return {
      principal, down, downPctNum, monthlyPI, monthlyPropTax, monthlyInsurance,
      hoa, monthlyPMI, showPMI, totalMonthly,
      totalInterest, totalPIPayments, totalCost,
      amortRows, effectiveAPR,
      procFeeAmt, stampDutyAmt, procFeeRate: parseFloat(processingFee) || 0, stampDutyRate: parseFloat(stampDuty) || 0,
      closing, breakEvenMonths,
      termYrs, price,
    };
  }, [homePrice, downAmt, loanTerm, interestRate, propTaxRate, homeInsurance, monthlyHOA, pmiRate, closingCosts, processingFee, stampDuty, india]);

  const yearlySummary = useMemo(() => {
    if (!result) return [];
    return groupByYear(result.amortRows);
  }, [result]);

  const toggleYear = (yr: number) => {
    setExpandedYears((prev) => {
      const n = new Set(prev);
      n.has(yr) ? n.delete(yr) : n.add(yr);
      return n;
    });
  };

  // Pie slices
  const pieSlices = useMemo(() => {
    if (!result) return [];
    const slices = [
      { value: result.principal, color: "#176b4d", label: "Principal" },
      { value: result.totalInterest, color: "#8a5a3a", label: "Interest" },
    ];
    if (!india) {
      const taxInsTotal = result.monthlyPropTax * result.termYrs * 12 + result.monthlyInsurance * result.termYrs * 12;
      if (taxInsTotal > 0) slices.push({ value: taxInsTotal, color: "#4a7fa5", label: "Tax & Insurance" });
    }
    return slices;
  }, [result, india]);

  const inputGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
    gap: 18,
  };

  return (
    <section className="surface" style={{ padding: 28 }} aria-label="Mortgage calculator">
      {/* Core Inputs */}
      <div className="eyebrow" style={{ marginBottom: 16 }}>Loan Details</div>
      <div style={inputGrid}>
        <NumInput label="Home Price" value={homePrice} onChange={handleHomePrice} prefix={currency.sym} />
        <label style={{ display: "block" }}>
          <span style={{ display: "block", color: "#465a50", fontSize: ".85rem", fontWeight: 650, marginBottom: 8 }}>
            Down Payment
          </span>
          <span style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <span style={{ display: "flex", position: "relative", alignItems: "center" }}>
              <span
                aria-hidden
                style={{ position: "absolute", left: 12, fontSize: 13, color: "var(--muted)", pointerEvents: "none", zIndex: 1 }}
              >
                {currency.sym}
              </span>
              <input
                className="field-input"
                type="number"
                min={0}
                value={downAmt}
                onChange={(e) => handleDownAmt(e.currentTarget.value)}
                style={{ paddingLeft: 28 }}
              />
            </span>
            <span style={{ display: "flex", position: "relative", alignItems: "center" }}>
              <input
                className="field-input"
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={downPct}
                onChange={(e) => handleDownPct(e.currentTarget.value)}
                style={{ paddingRight: 36 }}
              />
              <span aria-hidden style={{ position: "absolute", right: 12, fontSize: 12, color: "var(--muted)", pointerEvents: "none" }}>
                %
              </span>
            </span>
          </span>
        </label>
        <NumInput label="Loan Term (years)" value={loanTerm} onChange={setLoanTerm} suffix="yrs" min={1} step={1} />
        <NumInput label="Annual Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" min={0} step={0.05} />
      </div>

      {/* Country-specific extras */}
      <div className="eyebrow" style={{ marginTop: 28, marginBottom: 16 }}>
        {india ? "India — Additional Charges" : "US — Additional Monthly Costs"}
      </div>
      {india ? (
        <div style={inputGrid}>
          <NumInput label="Processing Fee" value={processingFee} onChange={setProcessingFee} suffix="%" min={0} step={0.1} />
          <NumInput label="Stamp Duty" value={stampDuty} onChange={setStampDuty} suffix="%" min={0} step={0.5} />
        </div>
      ) : (
        <div style={inputGrid}>
          <NumInput label="Annual Property Tax" value={propTaxRate} onChange={setPropTaxRate} suffix="%" min={0} step={0.1} />
          <NumInput label="Annual Home Insurance" value={homeInsurance} onChange={setHomeInsurance} prefix="$" min={0} step={10} />
          <NumInput label="Monthly HOA Fee" value={monthlyHOA} onChange={setMonthlyHOA} prefix="$" min={0} step={5} />
          <NumInput
            label={`PMI Rate${result?.showPMI ? " (applied — down < 20%)" : " (not applied)"}`}
            value={pmiRate}
            onChange={setPmiRate}
            suffix="%"
            min={0}
            step={0.05}
          />
          <NumInput label="Closing Costs (for APR / break-even)" value={closingCosts} onChange={setClosingCosts} prefix="$" min={0} step={100} />
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Monthly Breakdown */}
          <div
            style={{ marginTop: 32, background: "var(--wash)", border: "1px solid #dcebe1", borderRadius: 14, padding: 22 }}
          >
            <div className="eyebrow" style={{ marginBottom: 16 }}>Monthly Breakdown</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,170px), 1fr))", gap: 18 }}>
                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Principal &amp; Interest</div>
                  <div className="result-value">{fmt(result.monthlyPI)}</div>
                </div>
                {!india && result.monthlyPropTax > 0 && (
                  <div>
                    <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Property Tax</div>
                    <div className="result-value">{fmt(result.monthlyPropTax)}</div>
                  </div>
                )}
                {!india && result.monthlyInsurance > 0 && (
                  <div>
                    <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Home Insurance</div>
                    <div className="result-value">{fmt(result.monthlyInsurance)}</div>
                  </div>
                )}
                {!india && result.hoa > 0 && (
                  <div>
                    <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>HOA Fee</div>
                    <div className="result-value">{fmt(result.hoa)}</div>
                  </div>
                )}
                {!india && result.showPMI && result.monthlyPMI > 0 && (
                  <div>
                    <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>PMI</div>
                    <div className="result-value">{fmt(result.monthlyPMI)}</div>
                  </div>
                )}
                <div
                  style={{ background: "#edf7f1", borderRadius: 10, padding: "10px 14px", gridColumn: "span 1" }}
                >
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                    Total Monthly Payment
                  </div>
                  <div className="result-value" style={{ color: "var(--accent)" }}>
                    {fmt(result.totalMonthly)}
                  </div>
                </div>
              </div>
              {/* Pie */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, minWidth: 160 }}>
                <SvgPie slices={pieSlices} />
                <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, fontWeight: 650 }}>
                  {pieSlices.map((sl) => (
                    <span key={sl.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{ width: 10, height: 10, borderRadius: 2, background: sl.color, display: "inline-block" }}
                      />
                      {sl.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Total Cost Over Life */}
          <div
            style={{ marginTop: 18, background: "var(--wash)", border: "1px solid #dcebe1", borderRadius: 14, padding: 22 }}
          >
            <div className="eyebrow" style={{ marginBottom: 16 }}>Total Cost Over Loan Life</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))", gap: 18 }}>
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Loan Amount</div>
                <div className="result-value">{fmt(result.principal)}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Down Payment</div>
                <div className="result-value">{fmt(result.down)}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Total Interest Paid</div>
                <div className="result-value" style={{ color: "#8a5a3a" }}>{fmt(result.totalInterest)}</div>
              </div>
              {india && result.procFeeAmt > 0 && (
                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                    Processing Fee ({fmtN(result.procFeeRate)}%)
                  </div>
                  <div className="result-value">{fmt(result.procFeeAmt)}</div>
                </div>
              )}
              {india && result.stampDutyAmt > 0 && (
                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                    Stamp Duty ({fmtN(result.stampDutyRate)}%)
                  </div>
                  <div className="result-value">{fmt(result.stampDutyAmt)}</div>
                </div>
              )}
              {!india && result.closing > 0 && (
                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Closing Costs</div>
                  <div className="result-value">{fmt(result.closing)}</div>
                </div>
              )}
              <div style={{ background: "#edf7f1", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>Total Cost</div>
                <div className="result-value" style={{ color: "var(--accent)" }}>{fmt(result.totalCost)}</div>
              </div>
            </div>
          </div>

          {/* Effective APR & Break-even */}
          <div
            style={{ marginTop: 18, background: "var(--wash)", border: "1px solid #dcebe1", borderRadius: 14, padding: 22 }}
          >
            <div className="eyebrow" style={{ marginBottom: 16 }}>APR &amp; Break-Even</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))", gap: 18 }}>
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                  Nominal Interest Rate
                </div>
                <div className="result-value">{fmtN(parseFloat(interestRate), 3)}%</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                  Effective APR (with fees)
                </div>
                <div className="result-value">{fmtN(result.effectiveAPR, 3)}%</div>
              </div>
              {!india && result.breakEvenMonths !== null && result.closing > 0 && (
                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                    Break-Even (recoup closing)
                  </div>
                  <div className="result-value">
                    {result.breakEvenMonths > 0 && Number.isFinite(result.breakEvenMonths)
                      ? `${result.breakEvenMonths} mo`
                      : "—"}
                  </div>
                </div>
              )}
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                  Interest-to-Principal Ratio
                </div>
                <div className="result-value">
                  {Number.isFinite(result.totalInterest / result.principal)
                    ? fmtN((result.totalInterest / result.principal) * 100, 1) + "%"
                    : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Amortization Table */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button type="button" style={tableBtnStyle} onClick={() => { setShowTable((s) => !s); }}>
                {showTable ? "Hide" : "View"} Amortization Table
              </button>
              {showTable && (
                <>
                  <button
                    type="button"
                    style={{
                      ...tableBtnStyle,
                      background: tableMode === "yearly" ? "var(--accent)" : "none",
                      color: tableMode === "yearly" ? "white" : "var(--accent)",
                    }}
                    onClick={() => setTableMode("yearly")}
                  >
                    Yearly
                  </button>
                  <button
                    type="button"
                    style={{
                      ...tableBtnStyle,
                      background: tableMode === "monthly" ? "var(--accent)" : "none",
                      color: tableMode === "monthly" ? "white" : "var(--accent)",
                    }}
                    onClick={() => setTableMode("monthly")}
                  >
                    Monthly
                  </button>
                </>
              )}
            </div>
          </div>

          {showTable && (
            <div style={{ marginTop: 14, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--wash)", borderBottom: "2px solid var(--line)" }}>
                    <th style={{ ...thStyle, textAlign: "left" }}>{tableMode === "yearly" ? "Year" : "Month"}</th>
                    <th style={thStyle}>Payment</th>
                    <th style={thStyle}>Principal</th>
                    <th style={thStyle}>Interest</th>
                    <th style={thStyle}>Balance</th>
                    {tableMode === "yearly" && <th style={{ padding: "10px 14px", width: 36 }} />}
                  </tr>
                </thead>
                <tbody>
                  {tableMode === "yearly" ? (
                    yearlySummary.map((ys) => (
                      <>
                        <tr
                          key={`y${ys.year}`}
                          onClick={() => toggleYear(ys.year)}
                          style={{
                            borderBottom: "1px solid var(--line)",
                            cursor: "pointer",
                            background: expandedYears.has(ys.year) ? "#f0f7f3" : "white",
                          }}
                        >
                          <td style={{ padding: "10px 14px", fontWeight: 750 }}>Year {ys.year}</td>
                          <td style={tdStyle}>{fmt(ys.payment)}</td>
                          <td style={{ ...tdStyle, color: "#176b4d" }}>{fmt(ys.principal)}</td>
                          <td style={{ ...tdStyle, color: "#8a5a3a" }}>{fmt(ys.interest)}</td>
                          <td style={tdStyle}>{fmt(ys.balance)}</td>
                          <td style={{ padding: "10px 14px", textAlign: "center", color: "var(--muted)", fontSize: 11 }}>
                            {expandedYears.has(ys.year) ? "▲" : "▼"}
                          </td>
                        </tr>
                        {expandedYears.has(ys.year) &&
                          ys.rows.map((row) => (
                            <tr key={`m${row.month}`} style={{ borderBottom: "1px solid #f0f5f2", background: "#f9fcfa" }}>
                              <td style={{ padding: "7px 14px 7px 28px", color: "var(--muted)" }}>Month {row.month}</td>
                              <td style={tdStyle}>{fmt(row.payment)}</td>
                              <td style={{ ...tdStyle, color: "#176b4d" }}>{fmt(row.principal)}</td>
                              <td style={{ ...tdStyle, color: "#8a5a3a" }}>{fmt(row.interest)}</td>
                              <td style={tdStyle}>{fmt(row.balance)}</td>
                              <td />
                            </tr>
                          ))}
                      </>
                    ))
                  ) : (
                    result.amortRows.map((row) => (
                      <tr key={`m${row.month}`} style={{ borderBottom: "1px solid var(--line)" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 650 }}>Month {row.month}</td>
                        <td style={tdStyle}>{fmt(row.payment)}</td>
                        <td style={{ ...tdStyle, color: "#176b4d" }}>{fmt(row.principal)}</td>
                        <td style={{ ...tdStyle, color: "#8a5a3a" }}>{fmt(row.interest)}</td>
                        <td style={tdStyle}>{fmt(row.balance)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--muted)", marginTop: 24 }}>
        Estimates only. Actual rates, fees, and charges vary by lender. Consult a qualified lender or financial advisor before making mortgage decisions.
      </p>
    </section>
  );
}
