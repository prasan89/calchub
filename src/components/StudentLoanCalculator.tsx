"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";
import {IN,US,type Currency} from "@/lib/calculators/engine";

// ── helpers ────────────────────────────────────────────────────────────────────

function makeFmt(currency: Currency) {
  return (x: number) =>
    Number.isFinite(x)
      ? `${currency.sym}${x.toLocaleString(currency.locale, {maximumFractionDigits: 2})}`
      : "—";
}

function fmtMonths(months: number): string {
  if (!Number.isFinite(months) || months <= 0) return "—";
  const y = Math.floor(months / 12);
  const m = Math.round(months % 12);
  if (y === 0) return `${m} month${m !== 1 ? "s" : ""}`;
  if (m === 0) return `${y} year${y !== 1 ? "s" : ""}`;
  return `${y} yr ${m} mo`;
}

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + Math.round(n));
  return d;
}

function payoffDateStr(months: number): string {
  if (!Number.isFinite(months) || months <= 0) return "—";
  const d = addMonths(new Date(), months);
  return d.toLocaleDateString("en-US", {month: "long", year: "numeric"});
}

// monthly payment for standard amortized loan
function calcPayment(principal: number, monthlyRate: number, n: number): number {
  if (n <= 0 || principal <= 0) return 0;
  if (monthlyRate === 0) return principal / n;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) /
    (Math.pow(1 + monthlyRate, n) - 1);
}

type AmortRow = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

function buildSchedule(
  balance: number,
  monthlyRate: number,
  payment: number,
  maxMonths = 600,
): AmortRow[] {
  const rows: AmortRow[] = [];
  let bal = balance;
  for (let i = 1; i <= maxMonths && bal > 0.005; i++) {
    const interest = bal * monthlyRate;
    const principalPaid = Math.min(payment - interest, bal);
    if (principalPaid <= 0) break; // payment doesn't cover interest
    bal = Math.max(0, bal - principalPaid);
    rows.push({month: i, payment: principalPaid + interest, principal: principalPaid, interest, balance: bal});
  }
  return rows;
}

type YearlySummary = {year: number; payment: number; principal: number; interest: number; balance: number; rows: AmortRow[]};

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

// ── sub-components ────────────────────────────────────────────────────────────

function NumInput({
  label, value, onChange, suffix, prefix,
}: {
  label: string; value: string; onChange: (v: string) => void; suffix?: string; prefix?: string;
}) {
  return (
    <label style={{display: "block"}}>
      <span style={{display: "block", color: "#465a50", fontSize: ".85rem", fontWeight: 650, marginBottom: 8}}>{label}</span>
      <span style={{display: "flex", position: "relative", alignItems: "center"}}>
        {prefix && (
          <span aria-hidden style={{position: "absolute", left: 12, fontSize: 13, color: "var(--muted)", pointerEvents: "none", zIndex: 1}}>
            {prefix}
          </span>
        )}
        <input
          className="field-input"
          type="text"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.currentTarget.value)}
          onBlur={e => {
            const n = parseFloat(e.currentTarget.value);
            if (Number.isFinite(n)) onChange(String(n));
          }}
          style={{
            paddingLeft: prefix ? 28 : 13,
            paddingRight: suffix ? `${Math.max(suffix.length * 8 + 16, 36)}px` : 13,
          }}
        />
        {suffix && (
          <span aria-hidden style={{position: "absolute", right: 12, fontSize: 12, color: "var(--muted)", pointerEvents: "none"}}>
            {suffix}
          </span>
        )}
      </span>
    </label>
  );
}

function SvgPie({principal, interest}: {principal: number; interest: number}) {
  const total = principal + interest;
  if (total <= 0 || !Number.isFinite(total)) return null;
  const pRatio = Math.max(0, Math.min(1, principal / total));
  const cx = 90, cy = 90, r = 75;
  const angle = pRatio * 2 * Math.PI;
  const safeAngle = angle >= 2 * Math.PI ? 2 * Math.PI - 0.0001 : angle <= 0 ? 0.0001 : angle;
  const x1 = cx, y1 = cy - r;
  const x2 = cx + r * Math.sin(safeAngle), y2 = cy - r * Math.cos(safeAngle);
  const large = safeAngle > Math.PI ? 1 : 0;
  const midP = safeAngle / 2;
  const midI = safeAngle + (2 * Math.PI - safeAngle) / 2;
  const lx = cx + r * 0.65 * Math.sin(midP), ly = cy - r * 0.65 * Math.cos(midP);
  const lx2 = cx + r * 0.65 * Math.sin(midI), ly2 = cy - r * 0.65 * Math.cos(midI);
  return (
    <svg width={180} height={180} viewBox="0 0 180 180" aria-hidden="true">
      <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`} fill="#176b4d"/>
      <path d={`M${cx},${cy} L${x2},${y2} A${r},${r} 0 ${1 - large},1 ${x1},${y1} Z`} fill="#b2cfc4"/>
      {pRatio > 0.08 && (
        <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={11} fontWeight={700}>
          {Math.round(pRatio * 100)}%
        </text>
      )}
      {pRatio < 0.92 && (
        <text x={lx2} y={ly2} textAnchor="middle" dominantBaseline="middle" fill="#13261f" fontSize={11} fontWeight={700}>
          {Math.round((1 - pRatio) * 100)}%
        </text>
      )}
    </svg>
  );
}

// ── main component ────────────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {padding: "10px 14px", textAlign: "right", fontWeight: 750, color: "var(--muted)", whiteSpace: "nowrap"};
const tdStyle: React.CSSProperties = {padding: "10px 14px", textAlign: "right"};
const tableBtnStyle: React.CSSProperties = {
  background: "none", border: "1px solid var(--line)", borderRadius: 10,
  padding: "9px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "var(--accent)",
};

export default function StudentLoanCalculator({
  calculator,
  currency = IN,
}: {
  calculator: CalculatorDefinition;
  currency?: Currency;
}) {
  const isUS = currency.sym === US.sym;
  const money = makeFmt(currency);

  // ── core inputs ──────────────────────────────────────────────────────────────
  const [balance, setBalance] = useState(isUS ? "30000" : "500000");
  const [rate, setRate] = useState(isUS ? "5.5" : "8.5");
  const [termYears, setTermYears] = useState(isUS ? "10" : "15");
  const [extraPayment, setExtraPayment] = useState("0");

  // ── India-specific ───────────────────────────────────────────────────────────
  // moratorium = years in school + 6-month grace (expressed in months)
  const [moratoriumMonths, setMoratoriumMonths] = useState("54"); // e.g. 4.5 yrs default

  // ── US-specific (IDR) ────────────────────────────────────────────────────────
  const [annualIncome, setAnnualIncome] = useState("55000");
  const [idrPercent, setIdrPercent] = useState("10"); // % of discretionary income
  const [idrPovertyLine] = useState(isUS ? 15060 : 0); // 2024 US federal poverty line (single)

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [showTable, setShowTable] = useState(false);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());
  const toggleYear = (yr: number) => {
    setExpandedYears(prev => {const s = new Set(prev); s.has(yr) ? s.delete(yr) : s.add(yr); return s;});
  };

  // ── core calculations ────────────────────────────────────────────────────────
  const result = useMemo(() => {
    const P = parseFloat(balance) || 0;
    const annualRate = parseFloat(rate) || 0;
    const mr = annualRate / 100 / 12;
    const n = (parseInt(termYears) || 0) * 12;
    const extra = parseFloat(extraPayment) || 0;

    if (P <= 0 || n <= 0 || annualRate <= 0) return null;

    // ── standard repayment ────────────────────────────────────────────────────
    const stdPayment = calcPayment(P, mr, n);
    const stdSchedule = buildSchedule(P, mr, stdPayment);
    const stdMonths = stdSchedule.length;
    const stdTotalPaid = stdSchedule.reduce((s, r) => s + r.payment, 0);
    const stdTotalInterest = stdTotalPaid - P;

    // ── with extra payment ────────────────────────────────────────────────────
    const withExtra = extra > 0;
    let extraSchedule: AmortRow[] = [];
    let extraMonths = stdMonths;
    let extraTotalInterest = stdTotalInterest;
    let interestSaved = 0;
    if (withExtra) {
      extraSchedule = buildSchedule(P, mr, stdPayment + extra);
      extraMonths = extraSchedule.length;
      const extraTotal = extraSchedule.reduce((s, r) => s + r.payment, 0);
      extraTotalInterest = extraTotal - P;
      interestSaved = stdTotalInterest - extraTotalInterest;
    }

    // ── India moratorium ──────────────────────────────────────────────────────
    let moratoriumInterest = 0;
    let balanceAfterMoratorium = P;
    if (!isUS) {
      const mm = parseInt(moratoriumMonths) || 0;
      // During moratorium interest accrues but no payments — capitalized at end
      moratoriumInterest = P * mr * mm;
      balanceAfterMoratorium = P + moratoriumInterest;
    }
    const indiaPayment = isUS ? 0 : calcPayment(balanceAfterMoratorium, mr, n);
    const indiaSchedule = isUS ? [] : buildSchedule(balanceAfterMoratorium, mr, indiaPayment);
    const indiaTotalPaid = indiaSchedule.reduce((s, r) => s + r.payment, 0) + moratoriumInterest;
    const indiaTotalInterest = indiaTotalPaid - P;

    // ── US: IDR estimate ──────────────────────────────────────────────────────
    let idrPayment = 0;
    let idrNote = "";
    if (isUS) {
      const income = parseFloat(annualIncome) || 0;
      const pct = parseFloat(idrPercent) || 10;
      const discretionary = Math.max(0, income - idrPovertyLine * 1.5);
      idrPayment = (discretionary * pct / 100) / 12;
      if (idrPayment <= 0) {
        idrNote = "Income-driven payment is $0 — income is too low relative to poverty line.";
      } else if (idrPayment < P * mr) {
        idrNote = "Payment is below monthly interest — balance may grow (negative amortization).";
      }
    }

    const indiaMonths = indiaSchedule.length;
    const activeSchedule = withExtra ? extraSchedule : (isUS ? stdSchedule : indiaSchedule);
    const yearlySummary = groupByYear(activeSchedule);

    return {
      P,
      mr,
      stdPayment,
      stdMonths,
      stdTotalPaid,
      stdTotalInterest,
      withExtra,
      extraSchedule,
      extraMonths,
      extraTotalInterest,
      interestSaved,
      // India
      moratoriumInterest,
      balanceAfterMoratorium,
      indiaPayment,
      indiaTotalPaid,
      indiaTotalInterest,
      indiaMonths,
      // US IDR
      idrPayment,
      idrNote,
      // table
      yearlySummary,
    };
  }, [balance, rate, termYears, extraPayment, moratoriumMonths, annualIncome, idrPercent, isUS, idrPovertyLine]);

  if (!result) return (
    <section className="surface" style={{padding: 28}}>
      <p style={{color: "var(--muted)", fontSize: 14}}>Enter valid loan balance, rate, and term to see results.</p>
    </section>
  );

  const activePayment = isUS ? result.stdPayment : result.indiaPayment;
  const activeTotalInterest = isUS ? result.stdTotalInterest : result.indiaTotalInterest;
  const activeTotalPaid = isUS ? result.stdTotalPaid : result.indiaTotalPaid;
  const activeMonths = isUS
    ? (result.withExtra ? result.extraMonths : result.stdMonths)
    : result.indiaMonths;

  return (
    <section className="surface" style={{padding: 28}} aria-label="Student loan calculator">
      {/* ── inputs ── */}
      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 18}}>
        <NumInput
          label="Loan Balance"
          value={balance}
          onChange={v => { setBalance(v); setShowTable(false); setExpandedYears(new Set()); }}
          prefix={currency.sym}
        />
        <NumInput
          label="Annual Interest Rate"
          value={rate}
          onChange={v => { setRate(v); setShowTable(false); setExpandedYears(new Set()); }}
          suffix="%"
        />
        <NumInput
          label="Loan Term"
          value={termYears}
          onChange={v => { setTermYears(v); setShowTable(false); setExpandedYears(new Set()); }}
          suffix="years"
        />
        {!isUS && (
          <NumInput
            label="Moratorium Period"
            value={moratoriumMonths}
            onChange={setMoratoriumMonths}
            suffix="months"
          />
        )}
      </div>

      {/* ── US: IDR inputs ── */}
      {isUS && (
        <div style={{marginTop: 20, padding: "16px 18px", background: "var(--wash)", border: "1px solid #dcebe1", borderRadius: 12}}>
          <div style={{fontSize: 13, fontWeight: 750, color: "#465a50", marginBottom: 14}}>Income-Driven Repayment (IDR) Estimate</div>
          <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 14}}>
            <NumInput label="Annual Gross Income" value={annualIncome} onChange={setAnnualIncome} prefix={currency.sym}/>
            <NumInput label="Payment % of Discretionary Income" value={idrPercent} onChange={setIdrPercent} suffix="%"/>
          </div>
          <p style={{fontSize: 12, color: "var(--muted)", marginTop: 10, lineHeight: 1.5}}>
            Discretionary income = gross income − 150% of federal poverty line ({money(idrPovertyLine * 1.5)}).
            Common IDR plans: SAVE/REPAYE (5–10%), PAYE (10%), IBR (10–15%).
          </p>
        </div>
      )}

      {/* ── India moratorium info ── */}
      {!isUS && (
        <p style={{fontSize: 12, color: "var(--muted)", marginTop: 12, lineHeight: 1.5}}>
          During the moratorium (study period + 6-month grace), interest accrues and is capitalised at the start of repayment.
          Capitalised balance: {money(result.balanceAfterMoratorium)}.
          Interest accrued during moratorium: {money(result.moratoriumInterest)}.
        </p>
      )}

      {/* ── extra payment input ── */}
      <div style={{marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: 14}}>
        <NumInput
          label="Extra Monthly Payment (optional)"
          value={extraPayment}
          onChange={v => { setExtraPayment(v); setShowTable(false); setExpandedYears(new Set()); }}
          prefix={currency.sym}
        />
      </div>

      {/* ── results card ── */}
      <div style={{marginTop: 28, background: "var(--wash)", border: "1px solid #dcebe1", borderRadius: 14, padding: 22}}>
        <div className="eyebrow" style={{marginBottom: 16}}>Results</div>

        {/* standard repayment */}
        <div style={{marginBottom: 20}}>
          <div style={{fontSize: 13, fontWeight: 750, color: "#465a50", marginBottom: 12}}>
            {isUS ? "Standard 10-Year Repayment" : "Education Loan Repayment"}
          </div>
          <div style={{display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start", flexWrap: "wrap"}}>
            <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,160px),1fr))", gap: 16}}>
              <div>
                <div style={{fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6}}>Monthly Payment</div>
                <div className="result-value">{money(activePayment)}</div>
              </div>
              <div>
                <div style={{fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6}}>Total Interest</div>
                <div className="result-value">{money(activeTotalInterest)}</div>
              </div>
              <div>
                <div style={{fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6}}>Total Paid</div>
                <div className="result-value">{money(activeTotalPaid)}</div>
              </div>
              <div>
                <div style={{fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6}}>Payoff Date</div>
                <div className="result-value" style={{fontSize: "clamp(14px,2.5vw,18px)"}}>{payoffDateStr(activeMonths)}</div>
              </div>
              <div>
                <div style={{fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6}}>Payoff Duration</div>
                <div className="result-value" style={{fontSize: "clamp(14px,2.5vw,18px)"}}>{fmtMonths(activeMonths)}</div>
              </div>
            </div>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 10, minWidth: 160}}>
              <SvgPie principal={result.P} interest={activeTotalInterest}/>
              <div style={{display: "flex", gap: 12, fontSize: 12, fontWeight: 650}}>
                <span style={{display: "flex", alignItems: "center", gap: 5}}>
                  <span style={{width: 10, height: 10, borderRadius: 2, background: "#176b4d", display: "inline-block"}}/>Principal
                </span>
                <span style={{display: "flex", alignItems: "center", gap: 5}}>
                  <span style={{width: 10, height: 10, borderRadius: 2, background: "#b2cfc4", display: "inline-block"}}/>Interest
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* extra payment savings */}
        {result.withExtra && result.interestSaved > 0 && (
          <div style={{marginTop: 16, paddingTop: 16, borderTop: "1px solid #dcebe1"}}>
            <div style={{fontSize: 13, fontWeight: 750, color: "#465a50", marginBottom: 12}}>With Extra {money(parseFloat(extraPayment))} / Month</div>
            <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,160px),1fr))", gap: 16}}>
              <div>
                <div style={{fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6}}>New Payoff Date</div>
                <div className="result-value" style={{fontSize: "clamp(14px,2.5vw,18px)"}}>{payoffDateStr(result.extraMonths)}</div>
              </div>
              <div>
                <div style={{fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6}}>New Duration</div>
                <div className="result-value" style={{fontSize: "clamp(14px,2.5vw,18px)"}}>{fmtMonths(result.extraMonths)}</div>
              </div>
              <div>
                <div style={{fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6}}>Interest Saved</div>
                <div className="result-value" style={{color: "var(--accent)"}}>{money(result.interestSaved)}</div>
              </div>
              <div>
                <div style={{fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6}}>Months Saved</div>
                <div className="result-value" style={{color: "var(--accent)"}}>{fmtMonths(result.stdMonths - result.extraMonths)}</div>
              </div>
            </div>
          </div>
        )}

        {/* US: IDR section */}
        {isUS && (
          <div style={{marginTop: 16, paddingTop: 16, borderTop: "1px solid #dcebe1"}}>
            <div style={{fontSize: 13, fontWeight: 750, color: "#465a50", marginBottom: 12}}>Income-Driven Repayment Estimate</div>
            {result.idrNote ? (
              <p style={{fontSize: 13, color: "#8a5a3a", lineHeight: 1.5}}>{result.idrNote}</p>
            ) : (
              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,160px),1fr))", gap: 16}}>
                <div>
                  <div style={{fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6}}>Est. Monthly IDR Payment</div>
                  <div className="result-value">{money(result.idrPayment)}</div>
                </div>
                <div>
                  <div style={{fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6}}>vs. Standard Payment</div>
                  <div className="result-value" style={{
                    color: result.idrPayment < result.stdPayment ? "var(--accent)" : "#8a5a3a",
                    fontSize: "clamp(14px,2.5vw,18px)",
                  }}>
                    {result.idrPayment < result.stdPayment
                      ? `${money(result.stdPayment - result.idrPayment)} less/mo`
                      : `${money(result.idrPayment - result.stdPayment)} more/mo`}
                  </div>
                </div>
              </div>
            )}
            <p style={{fontSize: 12, color: "var(--muted)", marginTop: 10, lineHeight: 1.5}}>
              IDR plans may extend forgiveness after 20–25 years. Consult studentaid.gov for exact terms.
            </p>
          </div>
        )}

        {/* amortization table toggle */}
        <div style={{marginTop: 20}}>
          <button type="button" style={tableBtnStyle} onClick={() => setShowTable(s => !s)}>
            {showTable ? "Hide" : "View"} Amortization Table
          </button>
        </div>
      </div>

      {/* ── amortization table ── */}
      {showTable && result.yearlySummary.length > 0 && (
        <div style={{marginTop: 18, overflowX: "auto"}}>
          <table style={{width: "100%", borderCollapse: "collapse", fontSize: 13}}>
            <thead>
              <tr style={{background: "var(--wash)", borderBottom: "2px solid var(--line)"}}>
                <th style={{...thStyle, textAlign: "left"}}>Year</th>
                <th style={thStyle}>Payment</th>
                <th style={thStyle}>Principal</th>
                <th style={thStyle}>Interest</th>
                <th style={thStyle}>Balance</th>
                <th style={{padding: "10px 14px", width: 36}}/>
              </tr>
            </thead>
            <tbody>
              {result.yearlySummary.map(ys => (
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
                    <td style={{padding: "10px 14px", fontWeight: 750}}>Year {ys.year}</td>
                    <td style={tdStyle}>{money(ys.payment)}</td>
                    <td style={{...tdStyle, color: "#176b4d"}}>{money(ys.principal)}</td>
                    <td style={{...tdStyle, color: "#8a5a3a"}}>{money(ys.interest)}</td>
                    <td style={tdStyle}>{money(ys.balance)}</td>
                    <td style={{padding: "10px 14px", textAlign: "center", color: "var(--muted)", fontSize: 11}}>
                      {expandedYears.has(ys.year) ? "▲" : "▼"}
                    </td>
                  </tr>
                  {expandedYears.has(ys.year) && ys.rows.map(row => (
                    <tr key={`m${row.month}`} style={{borderBottom: "1px solid #f0f5f2", background: "#f9fcfa"}}>
                      <td style={{padding: "7px 14px 7px 28px", color: "var(--muted)"}}>Month {row.month}</td>
                      <td style={tdStyle}>{money(row.payment)}</td>
                      <td style={{...tdStyle, color: "#176b4d"}}>{money(row.principal)}</td>
                      <td style={{...tdStyle, color: "#8a5a3a"}}>{money(row.interest)}</td>
                      <td style={tdStyle}>{money(row.balance)}</td>
                      <td/>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{fontSize: 12, lineHeight: 1.6, color: "var(--muted)", marginTop: 20}}>
        Results are estimates only. Actual loan terms, fees, and interest capitalisation rules vary by lender.{" "}
        {isUS ? "Visit studentaid.gov for federal loan options." : "Contact your bank for exact moratorium and repayment terms."}
      </p>
    </section>
  );
}
