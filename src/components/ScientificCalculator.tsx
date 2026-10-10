"use client";
import { useState, useCallback } from "react";
import type { CalculatorDefinition } from "@/lib/calculators/catalog";

/* ── Types ─────────────────────────────────────────────── */
type HistoryEntry = { expr: string; result: string };

/* ── Recursive-descent expression parser ───────────────── */
function parseExpression(src: string, deg: boolean): number {
  const s = src
    .trim()
    .replace(/π/g, String(Math.PI))
    .replace(/\be\b/g, String(Math.E))
    .replace(/÷/g, "/")
    .replace(/×/g, "*")
    .replace(/−/g, "-");

  let pos = 0;

  function peek(): string { return s[pos] ?? ""; }
  function consume(): string { return s[pos++] ?? ""; }
  function skipWS() { while (s[pos] === " ") pos++; }

  function toRad(v: number): number { return deg ? (v * Math.PI) / 180 : v; }
  function fromRad(v: number): number { return deg ? (v * 180) / Math.PI : v; }

  function parseExpr(): number { return parseAddSub(); }

  function parseAddSub(): number {
    let left = parseMulDiv();
    skipWS();
    while (peek() === "+" || peek() === "-") {
      const op = consume();
      skipWS();
      const right = parseMulDiv();
      left = op === "+" ? left + right : left - right;
      skipWS();
    }
    return left;
  }

  function parseMulDiv(): number {
    let left = parsePower();
    skipWS();
    while (peek() === "*" || peek() === "/") {
      const op = consume();
      skipWS();
      const right = parsePower();
      left = op === "*" ? left * right : left / right;
      skipWS();
    }
    return left;
  }

  function parsePower(): number {
    let base = parseUnary();
    skipWS();
    if (peek() === "^") {
      consume();
      skipWS();
      const exp = parseUnary();
      base = Math.pow(base, exp);
    }
    return base;
  }

  function parseUnary(): number {
    skipWS();
    if (peek() === "-") {
      consume();
      skipWS();
      return -parsePrimary();
    }
    if (peek() === "+") {
      consume();
      skipWS();
    }
    return parsePrimary();
  }

  function parsePrimary(): number {
    skipWS();

    // Parentheses
    if (peek() === "(") {
      consume();
      const val = parseExpr();
      skipWS();
      if (peek() === ")") consume();
      return val;
    }

    // Named function or constant
    const fnMatch = s.slice(pos).match(/^(sin⁻¹|cos⁻¹|tan⁻¹|asin|acos|atan|sin|cos|tan|sqrt|log|ln|abs)/i);
    if (fnMatch) {
      const fn = fnMatch[1].toLowerCase();
      pos += fnMatch[1].length;
      skipWS();
      let arg: number;
      if (peek() === "(") {
        consume();
        arg = parseExpr();
        skipWS();
        if (peek() === ")") consume();
      } else {
        arg = parsePrimary();
      }
      switch (fn) {
        case "sin":    return Math.sin(toRad(arg));
        case "cos":    return Math.cos(toRad(arg));
        case "tan":    return Math.tan(toRad(arg));
        case "sin⁻¹": // fallthrough
        case "asin":   return fromRad(Math.asin(arg));
        case "cos⁻¹": // fallthrough
        case "acos":   return fromRad(Math.acos(arg));
        case "tan⁻¹": // fallthrough
        case "atan":   return fromRad(Math.atan(arg));
        case "sqrt":   return Math.sqrt(arg);
        case "log":    return Math.log10(arg);
        case "ln":     return Math.log(arg);
        case "abs":    return Math.abs(arg);
        default:       return NaN;
      }
    }

    // Number
    const numMatch = s.slice(pos).match(/^(\d+\.?\d*|\.\d+)/);
    if (numMatch) {
      pos += numMatch[1].length;
      return parseFloat(numMatch[1]);
    }

    return NaN;
  }

  try {
    const result = parseExpr();
    return result;
  } catch {
    return NaN;
  }
}

function evaluate(expr: string, deg: boolean): string {
  if (!expr.trim()) return "";
  try {
    const val = parseExpression(expr, deg);
    if (!Number.isFinite(val)) return "Error";
    // Avoid floating-point noise like 2.0000000000000004
    const fixed = parseFloat(val.toPrecision(12));
    return String(fixed);
  } catch {
    return "Error";
  }
}

/* ── Button grid definition ─────────────────────────────── */
type BtnDef = {
  label: string;
  action: string;
  wide?: boolean;
  accent?: boolean;
  danger?: boolean;
  operator?: boolean;
};

const BUTTON_ROWS: BtnDef[][] = [
  [
    { label: "sin",    action: "sin("   },
    { label: "cos",    action: "cos("   },
    { label: "tan",    action: "tan("   },
    { label: "π",      action: "π"      },
  ],
  [
    { label: "sin⁻¹", action: "sin⁻¹(" },
    { label: "cos⁻¹", action: "cos⁻¹(" },
    { label: "tan⁻¹", action: "tan⁻¹(" },
    { label: "e",      action: "e"       },
  ],
  [
    { label: "log",    action: "log("   },
    { label: "ln",     action: "ln("    },
    { label: "√",      action: "sqrt("  },
    { label: "x²",     action: "^2"     },
  ],
  [
    { label: "xʸ",     action: "^"       },
    { label: "(",      action: "("       },
    { label: ")",      action: ")"       },
    { label: "%",      action: "%"       },
  ],
  [
    { label: "7", action: "7" },
    { label: "8", action: "8" },
    { label: "9", action: "9" },
    { label: "÷", action: "÷", operator: true },
  ],
  [
    { label: "4", action: "4" },
    { label: "5", action: "5" },
    { label: "6", action: "6" },
    { label: "×", action: "×", operator: true },
  ],
  [
    { label: "1", action: "1" },
    { label: "2", action: "2" },
    { label: "3", action: "3" },
    { label: "−", action: "−", operator: true },
  ],
  [
    { label: "0",  action: "0"  },
    { label: ".",  action: "."  },
    { label: "±",  action: "±"  },
    { label: "+",  action: "+", operator: true },
  ],
];

const BOTTOM_ROW: BtnDef[] = [
  { label: "C",  action: "clear",     danger:  true },
  { label: "←",  action: "backspace", operator: true },
  { label: "=",  action: "=",         accent:  true  },
];

/* ── Component ──────────────────────────────────────────── */
export default function ScientificCalculator({ calculator: _calc }: { calculator: CalculatorDefinition }) {
  const [expr, setExpr]       = useState<string>("");
  const [preview, setPreview] = useState<string>("");
  const [deg, setDeg]         = useState<boolean>(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const press = useCallback((action: string) => {
    if (action === "clear") {
      setExpr("");
      setPreview("");
      return;
    }
    if (action === "backspace") {
      setExpr(prev => {
        const next = prev.slice(0, -1);
        setPreview(next ? evaluate(next, deg) : "");
        return next;
      });
      return;
    }
    if (action === "=") {
      if (!expr.trim()) return;
      const result = evaluate(expr, deg);
      setHistory(prev => [{ expr, result }, ...prev].slice(0, 5));
      setExpr(result === "Error" ? "" : result);
      setPreview("");
      return;
    }
    if (action === "±") {
      setExpr(prev => {
        const next = prev.startsWith("-") ? prev.slice(1) : prev ? "-" + prev : "-";
        setPreview(next ? evaluate(next, deg) : "");
        return next;
      });
      return;
    }
    if (action === "%") {
      setExpr(prev => {
        const val = parseFloat(prev);
        if (!isNaN(val)) {
          const next = String(val / 100);
          setPreview(next);
          return next;
        }
        return prev + "%";
      });
      return;
    }

    setExpr(prev => {
      const next = prev + action;
      setPreview(evaluate(next, deg));
      return next;
    });
  }, [expr, deg]);

  const toggleDeg = () => {
    setDeg(d => !d);
    if (expr) setPreview(evaluate(expr, !deg));
  };

  /* ── Styles ─────────────────────────────────────────── */
  const btnBase: React.CSSProperties = {
    borderRadius: 8,
    border: "1px solid var(--line)",
    padding: "12px 4px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background .12s,transform .08s",
    lineHeight: 1,
    textAlign: "center",
  };

  function btnStyle(b: BtnDef): React.CSSProperties {
    if (b.accent)   return { ...btnBase, background: "var(--accent)", color: "#fff", border: "none" };
    if (b.danger)   return { ...btnBase, background: "#f8d7da", color: "#842029", border: "1px solid #f5c2c7" };
    if (b.operator) return { ...btnBase, background: "#dce8fd", color: "#1d4ed8" };
    return { ...btnBase, background: "var(--wash)", color: "var(--ink)" };
  }

  return (
    <div style={{ maxWidth: 440, margin: "0 auto" }}>
      {/* Display */}
      <div
        style={{
          background: "#1a2520",
          borderRadius: 14,
          padding: "18px 20px 14px",
          marginBottom: 12,
          minHeight: 100,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          wordBreak: "break-all",
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: "#7fa98a",
            minHeight: 20,
            marginBottom: 4,
            fontFamily: "monospace",
            textAlign: "right",
          }}
        >
          {preview && preview !== expr ? preview : " "}
        </div>
        <div
          style={{
            fontSize: expr.length > 22 ? 18 : expr.length > 14 ? 24 : 30,
            color: "#e8f5e9",
            fontFamily: "monospace",
            textAlign: "right",
            minHeight: 40,
            letterSpacing: 0.5,
          }}
        >
          {expr || "0"}
        </div>
      </div>

      {/* DEG / RAD toggle */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8, gap: 6 }}>
        {(["DEG", "RAD"] as const).map(m => (
          <button
            key={m}
            onClick={toggleDeg}
            style={{
              padding: "4px 12px",
              borderRadius: 20,
              border: "1px solid var(--line)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              background: (m === "DEG") === deg ? "var(--accent)" : "var(--wash)",
              color:       (m === "DEG") === deg ? "#fff"         : "var(--muted)",
              transition: "background .15s",
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Button grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
        {BUTTON_ROWS.flat().map((btn, i) => (
          <button
            key={i}
            onClick={() => press(btn.action)}
            style={btnStyle(btn)}
            title={btn.label}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Bottom row: C (2 cols), ←, = */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 6, marginTop: 6 }}>
        {BOTTOM_ROW.map((btn, i) => (
          <button
            key={i}
            onClick={() => press(btn.action)}
            style={btnStyle(btn)}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div
          style={{
            marginTop: 20,
            background: "var(--wash)",
            border: "1px solid #dcebe1",
            borderRadius: 14,
            padding: 18,
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 12 }}>Recent History</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {history.map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  borderBottom: i < history.length - 1 ? "1px solid var(--line)" : "none",
                  paddingBottom: i < history.length - 1 ? 8 : 0,
                  cursor: "pointer",
                  gap: 8,
                }}
                onClick={() => { setExpr(h.result); setPreview(""); }}
                title="Click to reuse result"
              >
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--muted)",
                    fontFamily: "monospace",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                >
                  {h.expr}
                </span>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--ink)",
                    fontFamily: "monospace",
                    flexShrink: 0,
                  }}
                >
                  = {h.result}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{ fontSize: 11, color: "var(--muted)", marginTop: 10, textAlign: "right" }}
          >
            Click a result to reuse it
          </div>
        </div>
      )}
    </div>
  );
}
