"use client";
import {useMemo,useState,useCallback} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";
import {IN,US,type Currency} from "@/lib/calculators/engine";

/* ── Types ─────────────────────────────────────────────── */
interface Debt {
  id: number;
  name: string;
  balance: string;
  rate: string;
  minPayment: string;
}

type Method = "avalanche" | "snowball";

interface DebtResult {
  id: number;
  name: string;
  payoffMonth: number;
  totalInterest: number;
  totalPaid: number;
  payoffDate: string;
}

interface OverallResult {
  totalMonths: number;
  totalInterest: number;
  totalPaid: number;
  interestSavedVsMin: number;
  debts: DebtResult[];
  timeline: TimelineRow[];
}

interface TimelineRow {
  month: number;
  date: string;
  balances: number[];
  payments: number[];
  interests: number[];
  totalBalance: number;
  totalPayment: number;
}

/* ── Helpers ────────────────────────────────────────────── */
function makeFmt(currency: Currency) {
  const nf = new Intl.NumberFormat(currency.locale, {maximumFractionDigits: 2});
  return (x: number) => Number.isFinite(x) ? `${currency.sym}${nf.format(x)}` : "—";
}

function fmtN(x: number, locale: string, d = 0) {
  return Number.isFinite(x) ? x.toLocaleString(locale, {maximumFractionDigits: d}) : "—";
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function fmtDate(date: Date): string {
  return date.toLocaleDateString("en", {month: "short", year: "numeric"});
}

/* ── Payoff Engine ─────────────────────────────────────── */
function runPayoff(
  debts: {id: number; name: string; balance: number; rate: number; minPayment: number}[],
  extraPayment: number,
  method: Method
): OverallResult | null {
  if (debts.length === 0) return null;
  if (debts.some(d => d.balance <= 0 || d.minPayment <= 0)) return null;

  // Simulate minimums-only to get baseline interest
  const minInterest = simulatePayoff(debts, 0, "avalanche").totalInterest;

  const result = simulatePayoff(debts, extraPayment, method);
  result.interestSavedVsMin = minInterest - result.totalInterest;
  return result;
}

function simulatePayoff(
  debtDefs: {id: number; name: string; balance: number; rate: number; minPayment: number}[],
  extraPayment: number,
  method: Method
): OverallResult {
  // Clone balances
  const balances = debtDefs.map(d => d.balance);
  const rates = debtDefs.map(d => d.rate / 100 / 12);
  const mins = debtDefs.map(d => d.minPayment);
  const payoffMonths = new Array(debtDefs.length).fill(0);
  const totalInterests = new Array(debtDefs.length).fill(0);
  const totalPaids = new Array(debtDefs.length).fill(0);

  const timeline: TimelineRow[] = [];
  const now = new Date();
  let month = 0;
  const MAX_MONTHS = 600; // 50 years cap

  while (balances.some(b => b > 0.01) && month < MAX_MONTHS) {
    month++;
    const interests = balances.map((b, i) => b > 0 ? b * rates[i] : 0);
    const paymentThisMonth = new Array(debtDefs.length).fill(0);

    // Apply minimum payments first
    let remainingExtra = extraPayment;
    for (let i = 0; i < debtDefs.length; i++) {
      if (balances[i] <= 0) continue;
      const minPay = Math.min(mins[i], balances[i] + interests[i]);
      paymentThisMonth[i] = minPay;
    }

    // Determine order for extra payment
    const activeIndices = debtDefs
      .map((_, i) => i)
      .filter(i => balances[i] > 0.01);

    if (method === "avalanche") {
      activeIndices.sort((a, b) => rates[b] - rates[a]);
    } else {
      activeIndices.sort((a, b) => balances[a] - balances[b]);
    }

    // Apply extra to focus debt
    for (const i of activeIndices) {
      if (remainingExtra <= 0) break;
      const room = balances[i] + interests[i] - paymentThisMonth[i];
      if (room > 0) {
        const extra = Math.min(remainingExtra, room);
        paymentThisMonth[i] += extra;
        remainingExtra -= extra;
      }
    }

    // Update balances
    for (let i = 0; i < debtDefs.length; i++) {
      if (balances[i] <= 0) continue;
      const principal = paymentThisMonth[i] - interests[i];
      balances[i] = Math.max(0, balances[i] - principal);
      totalInterests[i] += interests[i];
      totalPaids[i] += paymentThisMonth[i];
      if (balances[i] <= 0.01 && payoffMonths[i] === 0) {
        payoffMonths[i] = month;
      }
    }

    // Capture timeline row (cap display to keep table manageable)
    if (month <= 120 || month % 12 === 0) {
      timeline.push({
        month,
        date: fmtDate(addMonths(now, month)),
        balances: [...balances],
        payments: [...paymentThisMonth],
        interests: [...interests],
        totalBalance: balances.reduce((s, b) => s + b, 0),
        totalPayment: paymentThisMonth.reduce((s, p) => s + p, 0),
      });
    }
  }

  // Fill any debts not yet marked
  for (let i = 0; i < debtDefs.length; i++) {
    if (payoffMonths[i] === 0 && balances[i] <= 0.01) payoffMonths[i] = month;
  }

  const debtsResult: DebtResult[] = debtDefs.map((d, i) => ({
    id: d.id,
    name: d.name,
    payoffMonth: payoffMonths[i],
    totalInterest: totalInterests[i],
    totalPaid: totalPaids[i],
    payoffDate: fmtDate(addMonths(now, payoffMonths[i])),
  }));

  return {
    totalMonths: month,
    totalInterest: totalInterests.reduce((s, v) => s + v, 0),
    totalPaid: totalPaids.reduce((s, v) => s + v, 0),
    interestSavedVsMin: 0,
    debts: debtsResult,
    timeline,
  };
}

/* ── Sub-components ─────────────────────────────────────── */
function NumInput({label, value, onChange, prefixSym, suffix, step, min, placeholder}: {
  label: string; value: string; onChange: (v: string) => void;
  prefixSym?: string; suffix?: string; step?: string; min?: string; placeholder?: string;
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
          placeholder={placeholder}
          onChange={e => onChange(e.currentTarget.value)}
          style={{paddingLeft: prefixSym ? 28 : 13, paddingRight: suffix ? `${Math.max(suffix.length * 7 + 16, 40)}px` : "13px"}}
        />
        {suffix && <span aria-hidden style={{position: "absolute", right: 12, fontSize: 12, color: "var(--muted)", pointerEvents: "none"}}>{suffix}</span>}
      </span>
    </label>
  );
}

function TextInput({label, value, onChange, placeholder}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <label style={{display: "block"}}>
      <span style={{display: "block", color: "#465a50", fontSize: ".85rem", fontWeight: 650, marginBottom: 8}}>{label}</span>
      <input
        className="field-input"
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.currentTarget.value)}
        style={{paddingLeft: 13}}
      />
    </label>
  );
}

const thStyle: React.CSSProperties = {padding: "10px 14px", textAlign: "right", fontWeight: 750, color: "var(--muted)", whiteSpace: "nowrap"};
const tdStyle: React.CSSProperties = {padding: "10px 14px", textAlign: "right"};

/* ── Main Component ─────────────────────────────────────── */
let nextId = 1;

export default function DebtPayoffCalculator({calculator, currency = IN}: {calculator: CalculatorDefinition; currency?: Currency}) {
  const money = makeFmt(currency);
  const us = currency.locale === "en-US";

  const [debts, setDebts] = useState<Debt[]>([
    {id: nextId++, name: "Credit Card 1", balance: us ? "5000" : "80000", rate: us ? "22.99" : "36", minPayment: us ? "100" : "2000"},
    {id: nextId++, name: "Personal Loan", balance: us ? "12000" : "300000", rate: us ? "11.5" : "14", minPayment: us ? "280" : "7000"},
  ]);
  const [extraPayment, setExtraPayment] = useState(us ? "200" : "3000");
  const [method, setMethod] = useState<Method>("avalanche");
  const [showTimeline, setShowTimeline] = useState(false);

  const addDebt = useCallback(() => {
    setDebts(prev => [...prev, {id: nextId++, name: `Debt ${prev.length + 1}`, balance: "", rate: "", minPayment: ""}]);
  }, []);

  const removeDebt = useCallback((id: number) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  }, []);

  const updateDebt = useCallback((id: number, field: keyof Omit<Debt, "id">, value: string) => {
    setDebts(prev => prev.map(d => d.id === id ? {...d, [field]: value} : d));
  }, []);

  const parsedDebts = useMemo(() =>
    debts
      .map(d => ({
        id: d.id,
        name: d.name || `Debt ${d.id}`,
        balance: parseFloat(d.balance) || 0,
        rate: parseFloat(d.rate) || 0,
        minPayment: parseFloat(d.minPayment) || 0,
      }))
      .filter(d => d.balance > 0 && d.minPayment > 0 && d.rate >= 0),
    [debts]
  );

  const result = useMemo(() => {
    if (parsedDebts.length === 0) return null;
    return runPayoff(parsedDebts, parseFloat(extraPayment) || 0, method);
  }, [parsedDebts, extraPayment, method]);

  const monthsLabel = (m: number) => {
    const yrs = Math.floor(m / 12);
    const mo = m % 12;
    const parts = [];
    if (yrs > 0) parts.push(`${yrs} yr${yrs > 1 ? "s" : ""}`);
    if (mo > 0) parts.push(`${mo} mo`);
    return parts.join(" ") || "< 1 mo";
  };

  return (
    <section className="surface" style={{padding: 28}} aria-label="Debt payoff calculator">

      {/* Method selector */}
      <div style={{marginBottom: 24}}>
        <div style={{display: "block", color: "#465a50", fontSize: ".85rem", fontWeight: 650, marginBottom: 10}}>Payoff Strategy</div>
        <div style={{display: "flex", gap: 10, flexWrap: "wrap"}}>
          {([["avalanche", "Avalanche", "Highest interest rate first — saves the most money"],
            ["snowball", "Snowball", "Lowest balance first — quickest psychological wins"]] as const).map(([val, label, desc]) => (
            <button
              key={val}
              type="button"
              onClick={() => setMethod(val)}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: `2px solid ${method === val ? "var(--accent)" : "var(--line)"}`,
                background: method === val ? "#eaf5ee" : "white",
                color: method === val ? "var(--accent)" : "var(--ink)",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div>{label}</div>
              <div style={{fontSize: 11, fontWeight: 500, color: "var(--muted)", marginTop: 2}}>{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Extra payment */}
      <div style={{marginBottom: 24, maxWidth: 320}}>
        <NumInput
          label="Extra Monthly Payment (to distribute)"
          value={extraPayment}
          onChange={setExtraPayment}
          prefixSym={currency.sym}
          min="0"
        />
      </div>

      {/* Debt list */}
      <div style={{marginBottom: 20}}>
        <div className="eyebrow" style={{marginBottom: 14}}>Your Debts</div>
        <div style={{display: "flex", flexDirection: "column", gap: 16}}>
          {debts.map((debt, idx) => (
            <div
              key={debt.id}
              style={{
                background: "var(--wash)",
                border: "1px solid #dcebe1",
                borderRadius: 12,
                padding: "16px 18px",
                position: "relative",
              }}
            >
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14}}>
                <span style={{fontWeight: 700, fontSize: 14, color: "var(--ink)"}}>Debt {idx + 1}</span>
                {debts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDebt(debt.id)}
                    aria-label="Remove debt"
                    style={{
                      background: "none", border: "1px solid #e5b8b8", borderRadius: 8,
                      padding: "4px 10px", cursor: "pointer", color: "#b05050", fontWeight: 700, fontSize: 12,
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,180px),1fr))", gap: 14}}>
                <TextInput
                  label="Debt Name"
                  value={debt.name}
                  onChange={v => updateDebt(debt.id, "name", v)}
                  placeholder="e.g. Credit Card"
                />
                <NumInput
                  label="Balance"
                  value={debt.balance}
                  onChange={v => updateDebt(debt.id, "balance", v)}
                  prefixSym={currency.sym}
                  min="0"
                />
                <NumInput
                  label="Annual Interest Rate"
                  value={debt.rate}
                  onChange={v => updateDebt(debt.id, "rate", v)}
                  suffix="%"
                  step="0.01"
                  min="0"
                />
                <NumInput
                  label="Minimum Payment"
                  value={debt.minPayment}
                  onChange={v => updateDebt(debt.id, "minPayment", v)}
                  prefixSym={currency.sym}
                  min="0"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addDebt}
          style={{
            marginTop: 14, display: "flex", alignItems: "center", gap: 8,
            background: "none", border: "2px dashed #b2cfc4", borderRadius: 10,
            padding: "10px 18px", cursor: "pointer", color: "var(--accent)", fontWeight: 700, fontSize: 14,
            width: "100%", justifyContent: "center",
          }}
        >
          <span style={{fontSize: 18, lineHeight: 1}}>+</span> Add Another Debt
        </button>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Overall summary */}
          <div style={{background: "var(--wash)", border: "1px solid #dcebe1", borderRadius: 14, padding: 22, marginBottom: 20}}>
            <div className="eyebrow" style={{marginBottom: 16}}>Overall Results</div>
            <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,160px),1fr))", gap: 18}}>
              <div>
                <div style={{fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6}}>Debt-Free In</div>
                <div className="result-value">{monthsLabel(result.totalMonths)}</div>
              </div>
              <div>
                <div style={{fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6}}>Total Interest Paid</div>
                <div className="result-value">{money(result.totalInterest)}</div>
              </div>
              <div>
                <div style={{fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6}}>Total Paid</div>
                <div className="result-value">{money(result.totalPaid)}</div>
              </div>
              {result.interestSavedVsMin > 0.01 && (
                <div>
                  <div style={{fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6}}>Interest Saved vs Minimums</div>
                  <div className="result-value" style={{color: "var(--accent)"}}>{money(result.interestSavedVsMin)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Per-debt breakdown */}
          <div style={{background: "var(--wash)", border: "1px solid #dcebe1", borderRadius: 14, padding: 22, marginBottom: 20}}>
            <div className="eyebrow" style={{marginBottom: 16}}>Per-Debt Breakdown</div>
            <div style={{overflowX: "auto"}}>
              <table style={{width: "100%", borderCollapse: "collapse", fontSize: 13}}>
                <thead>
                  <tr style={{background: "#f0f7f3", borderBottom: "2px solid var(--line)"}}>
                    <th style={{...thStyle, textAlign: "left"}}>Debt</th>
                    <th style={thStyle}>Balance</th>
                    <th style={thStyle}>Rate</th>
                    <th style={thStyle}>Payoff Date</th>
                    <th style={thStyle}>Payoff Time</th>
                    <th style={thStyle}>Total Interest</th>
                    <th style={thStyle}>Total Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {result.debts.map((dr, idx) => {
                    const def = parsedDebts.find(d => d.id === dr.id);
                    return (
                      <tr key={dr.id} style={{borderBottom: "1px solid var(--line)", background: idx % 2 === 0 ? "white" : "#f9fcfa"}}>
                        <td style={{padding: "10px 14px", fontWeight: 700}}>{dr.name}</td>
                        <td style={tdStyle}>{money(def?.balance ?? 0)}</td>
                        <td style={tdStyle}>{fmtN(def?.rate ?? 0, currency.locale, 2)}%</td>
                        <td style={{...tdStyle, fontWeight: 650, color: "var(--accent)"}}>{dr.payoffDate}</td>
                        <td style={tdStyle}>{monthsLabel(dr.payoffMonth)}</td>
                        <td style={{...tdStyle, color: "#8a5a3a"}}>{money(dr.totalInterest)}</td>
                        <td style={tdStyle}>{money(dr.totalPaid)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payoff order badge */}
          <div style={{marginBottom: 20}}>
            <div className="eyebrow" style={{marginBottom: 12}}>Payoff Order ({method === "avalanche" ? "Highest Rate First" : "Lowest Balance First"})</div>
            <div style={{display: "flex", flexWrap: "wrap", gap: 10}}>
              {[...result.debts]
                .sort((a, b) => a.payoffMonth - b.payoffMonth)
                .map((dr, i) => (
                  <div
                    key={dr.id}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      background: "#eaf5ee", border: "1px solid #b2cfc4",
                      borderRadius: 24, padding: "6px 14px",
                    }}
                  >
                    <span style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: "var(--accent)", color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800, flexShrink: 0,
                    }}>{i + 1}</span>
                    <span style={{fontWeight: 700, fontSize: 13}}>{dr.name}</span>
                    <span style={{fontSize: 12, color: "var(--muted)"}}>{dr.payoffDate}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Timeline toggle */}
          <button
            type="button"
            onClick={() => setShowTimeline(s => !s)}
            style={{
              background: "none", border: "1px solid var(--line)", borderRadius: 10,
              padding: "9px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "var(--accent)",
              marginBottom: 20,
            }}
          >
            {showTimeline ? "Hide" : "View"} Payoff Timeline
          </button>

          {/* Timeline table */}
          {showTimeline && (
            <div style={{overflowX: "auto", marginBottom: 20}}>
              <table style={{width: "100%", borderCollapse: "collapse", fontSize: 12}}>
                <thead>
                  <tr style={{background: "var(--wash)", borderBottom: "2px solid var(--line)"}}>
                    <th style={{...thStyle, textAlign: "left", fontSize: 12}}>Month</th>
                    <th style={{...thStyle, textAlign: "left", fontSize: 12}}>Date</th>
                    {parsedDebts.map(d => (
                      <th key={d.id} style={{...thStyle, fontSize: 12}}>{d.name}<br /><span style={{fontWeight: 500, fontSize: 11}}>Balance</span></th>
                    ))}
                    <th style={{...thStyle, fontSize: 12}}>Total Balance</th>
                    <th style={{...thStyle, fontSize: 12}}>Total Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {result.timeline.map((row, idx) => (
                    <tr key={row.month} style={{borderBottom: "1px solid var(--line)", background: idx % 2 === 0 ? "white" : "#f9fcfa"}}>
                      <td style={{padding: "8px 14px", color: "var(--muted)", fontWeight: 650}}>{row.month}</td>
                      <td style={{padding: "8px 14px", whiteSpace: "nowrap"}}>{row.date}</td>
                      {row.balances.map((b, i) => (
                        <td key={i} style={{...tdStyle, padding: "8px 14px", color: b <= 0 ? "var(--accent)" : "inherit", fontWeight: b <= 0 ? 700 : 400}}>
                          {b <= 0.01 ? "Paid off" : money(b)}
                        </td>
                      ))}
                      <td style={{...tdStyle, padding: "8px 14px", fontWeight: 700}}>{money(row.totalBalance)}</td>
                      <td style={{...tdStyle, padding: "8px 14px", color: "var(--accent)"}}>{money(row.totalPayment)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {parsedDebts.length === 0 && (
        <div style={{textAlign: "center", padding: "32px 0", color: "var(--muted)", fontSize: 14}}>
          Add at least one debt with a balance and minimum payment to see your payoff plan.
        </div>
      )}

      <p style={{fontSize: 12, lineHeight: 1.6, color: "var(--muted)", marginTop: 8}}>
        Results are estimates based on fixed interest rates and consistent payments. Actual results may vary. Consult a financial advisor for personalized advice.
      </p>
    </section>
  );
}
