"use client";
import { useState, useMemo } from "react";
import type { CalculatorDefinition } from "@/lib/calculators/catalog";
import { IN, US, type Currency } from "@/lib/calculators/engine";

// ── helpers ──────────────────────────────────────────────────────────────────

function parseHMS(h: string, m: string, s: string): number {
  const hh = Math.max(0, parseInt(h) || 0);
  const mm = Math.max(0, Math.min(59, parseInt(m) || 0));
  const ss = Math.max(0, Math.min(59, parseInt(s) || 0));
  return hh * 3600 + mm * 60 + ss;
}

function secsToHMS(total: number): { h: number; m: number; s: number } {
  const abs = Math.abs(total);
  return {
    h: Math.floor(abs / 3600),
    m: Math.floor((abs % 3600) / 60),
    s: abs % 60,
  };
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatHMS(total: number): string {
  const { h, m, s } = secsToHMS(total);
  return `${h}:${pad2(m)}:${pad2(s)}`;
}

// ── sub-components ────────────────────────────────────────────────────────────

function HMSInput({
  label,
  h,
  m,
  s,
  onChange,
  allowLargeHours = false,
}: {
  label: string;
  h: string;
  m: string;
  s: string;
  onChange: (h: string, m: string, s: string) => void;
  allowLargeHours?: boolean;
}) {
  const fieldStyle: React.CSSProperties = {
    width: 56,
    textAlign: "center",
    padding: "8px 4px",
    borderRadius: 8,
    border: "1.5px solid var(--line)",
    background: "var(--wash)",
    fontSize: 15,
    color: "var(--ink)",
    outline: "none",
    MozAppearance: "textfield",
  };
  const sepStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    color: "var(--muted)",
    margin: "0 2px",
  };
  return (
    <div>
      <span
        style={{
          display: "block",
          color: "#465a50",
          fontSize: ".85rem",
          fontWeight: 650,
          marginBottom: 8,
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <input
          className="field-input"
          type="number"
          min={0}
          max={allowLargeHours ? undefined : 99}
          placeholder="HH"
          value={h}
          onChange={(e) => onChange(e.target.value, m, s)}
          style={{ ...fieldStyle, width: allowLargeHours ? 72 : 56 }}
        />
        <span style={sepStyle}>:</span>
        <input
          className="field-input"
          type="number"
          min={0}
          max={59}
          placeholder="MM"
          value={m}
          onChange={(e) => onChange(h, e.target.value, s)}
          style={fieldStyle}
        />
        <span style={sepStyle}>:</span>
        <input
          className="field-input"
          type="number"
          min={0}
          max={59}
          placeholder="SS"
          value={s}
          onChange={(e) => onChange(h, m, e.target.value)}
          style={fieldStyle}
        />
        <span
          style={{
            marginLeft: 6,
            fontSize: 11,
            color: "var(--muted)",
            fontWeight: 600,
          }}
        >
          HH : MM : SS
        </span>
      </div>
    </div>
  );
}

function ResultCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 13,
          color: "var(--muted)",
          fontWeight: 650,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div className="result-value">{value}</div>
    </div>
  );
}

// ── Tab: Add Times ────────────────────────────────────────────────────────────

type TimeRow = { h: string; m: string; s: string };

function AddTimesTab() {
  const [rows, setRows] = useState<TimeRow[]>([
    { h: "", m: "", s: "" },
    { h: "", m: "", s: "" },
  ]);

  const totalSecs = useMemo(
    () => rows.reduce((acc, r) => acc + parseHMS(r.h, r.m, r.s), 0),
    [rows]
  );

  const { h, m, s } = secsToHMS(totalSecs);

  function updateRow(i: number, rh: string, rm: string, rs: string) {
    setRows((prev) => {
      const next = [...prev];
      next[i] = { h: rh, m: rm, s: rs };
      return next;
    });
  }

  function addRow() {
    setRows((prev) => [...prev, { h: "", m: "", s: "" }]);
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          background: "var(--wash)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: 20,
        }}
      >
        <div className="eyebrow">Time Entries</div>
        {rows.map((r, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "flex-end", gap: 10 }}
          >
            <div style={{ flex: 1 }}>
              <HMSInput
                label={`Entry ${i + 1}`}
                h={r.h}
                m={r.m}
                s={r.s}
                onChange={(rh, rm, rs) => updateRow(i, rh, rm, rs)}
                allowLargeHours
              />
            </div>
            {rows.length > 2 && (
              <button
                onClick={() => removeRow(i)}
                style={{
                  background: "none",
                  border: "1.5px solid #e55",
                  borderRadius: 8,
                  color: "#e55",
                  cursor: "pointer",
                  fontSize: 18,
                  lineHeight: 1,
                  padding: "6px 10px",
                  marginBottom: 2,
                }}
                title="Remove"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addRow}
          style={{
            alignSelf: "flex-start",
            background: "var(--accent)",
            border: "none",
            borderRadius: 8,
            color: "#fff",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 700,
            padding: "7px 16px",
            marginTop: 4,
          }}
        >
          + Add Entry
        </button>
      </div>

      {totalSecs > 0 && (
        <div
          style={{
            background: "var(--wash)",
            border: "1px solid #dcebe1",
            borderRadius: 14,
            padding: 22,
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            Total Duration
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,150px),1fr))",
              gap: 18,
            }}
          >
            <ResultCard label="Total (h:mm:ss)" value={`${h}:${pad2(m)}:${pad2(s)}`} />
            <ResultCard label="Total Hours" value={`${(totalSecs / 3600).toFixed(4)} h`} />
            <ResultCard label="Total Minutes" value={`${(totalSecs / 60).toFixed(2)} min`} />
            <ResultCard label="Total Seconds" value={`${totalSecs} s`} />
            <ResultCard label="Total Days" value={`${(totalSecs / 86400).toFixed(4)} d`} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Subtract Times ───────────────────────────────────────────────────────

function SubtractTimesTab() {
  const [sh, setSh] = useState("");
  const [sm, setSm] = useState("");
  const [ss, setSs] = useState("");
  const [eh, setEh] = useState("");
  const [em, setEm] = useState("");
  const [es, setEs] = useState("");

  const result = useMemo(() => {
    const startSecs = parseHMS(sh, sm, ss);
    const endSecs = parseHMS(eh, em, es);
    if (!sh && !sm && !ss && !eh && !em && !es) return null;
    let diff = endSecs - startSecs;
    if (diff < 0) diff += 86400; // overnight
    return diff;
  }, [sh, sm, ss, eh, em, es]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          background: "var(--wash)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <HMSInput
          label="Start Time"
          h={sh}
          m={sm}
          s={ss}
          onChange={(h, m, s) => { setSh(h); setSm(m); setSs(s); }}
        />
        <HMSInput
          label="End Time"
          h={eh}
          m={em}
          s={es}
          onChange={(h, m, s) => { setEh(h); setEm(m); setEs(s); }}
        />
        <p
          style={{
            fontSize: 12,
            color: "var(--muted)",
            margin: 0,
            fontStyle: "italic",
          }}
        >
          If end time is earlier than start time, overnight wrap is assumed (+24h).
        </p>
      </div>

      {result !== null && (
        <div
          style={{
            background: "var(--wash)",
            border: "1px solid #dcebe1",
            borderRadius: 14,
            padding: 22,
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            Difference
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,150px),1fr))",
              gap: 18,
            }}
          >
            <ResultCard label="Duration (h:mm:ss)" value={formatHMS(result)} />
            <ResultCard label="Hours" value={`${(result / 3600).toFixed(4)} h`} />
            <ResultCard label="Minutes" value={`${(result / 60).toFixed(2)} min`} />
            <ResultCard label="Seconds" value={`${result} s`} />
            <ResultCard label="Days" value={`${(result / 86400).toFixed(6)} d`} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Time Card ────────────────────────────────────────────────────────────

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type DayRow = {
  enabled: boolean;
  inH: string; inM: string;
  outH: string; outM: string;
};

function TimeCardTab({ currency }: { currency: Currency }) {
  const [rows, setRows] = useState<DayRow[]>(
    DAYS.map((_, i) => ({
      enabled: i < 5,
      inH: i < 5 ? "9" : "",
      inM: "0",
      outH: i < 5 ? "17" : "",
      outM: "0",
    }))
  );
  const [rate, setRate] = useState("");

  const fmt = (x: number) =>
    Number.isFinite(x)
      ? `${currency.sym}${x.toLocaleString(currency.locale, { maximumFractionDigits: 2 })}`
      : "—";

  function update(i: number, patch: Partial<DayRow>) {
    setRows((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  }

  const dailySecs = useMemo(
    () =>
      rows.map((r) => {
        if (!r.enabled) return 0;
        const inSec = parseHMS(r.inH, r.inM, "0");
        const outSec = parseHMS(r.outH, r.outM, "0");
        let d = outSec - inSec;
        if (d < 0) d += 86400;
        return d;
      }),
    [rows]
  );

  const totalSecs = useMemo(() => dailySecs.reduce((a, b) => a + b, 0), [dailySecs]);
  const totalHours = totalSecs / 3600;
  const pay = rate ? totalHours * parseFloat(rate) : NaN;

  const inputSmall: React.CSSProperties = {
    width: 52,
    textAlign: "center",
    padding: "6px 4px",
    borderRadius: 8,
    border: "1.5px solid var(--line)",
    background: "#fff",
    fontSize: 14,
    color: "var(--ink)",
    outline: "none",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          background: "var(--wash)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: 20,
          overflowX: "auto",
        }}
      >
        <div className="eyebrow" style={{ marginBottom: 16 }}>
          Weekly Time Card
        </div>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 480 }}>
          <thead>
            <tr>
              {["", "Day", "Clock In", "Clock Out", "Hours"].map((col) => (
                <th
                  key={col}
                  style={{
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--muted)",
                    paddingBottom: 10,
                    paddingRight: 12,
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, i) => {
              const dayHours = dailySecs[i] / 3600;
              return (
                <tr key={day}>
                  <td style={{ paddingBottom: 10, paddingRight: 8 }}>
                    <input
                      type="checkbox"
                      checked={rows[i].enabled}
                      onChange={(e) => update(i, { enabled: e.target.checked })}
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                  <td
                    style={{
                      paddingBottom: 10,
                      paddingRight: 12,
                      fontSize: 14,
                      fontWeight: 600,
                      color: rows[i].enabled ? "var(--ink)" : "var(--muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {day}
                  </td>
                  <td style={{ paddingBottom: 10, paddingRight: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <input
                        type="number"
                        min={0}
                        max={23}
                        value={rows[i].inH}
                        disabled={!rows[i].enabled}
                        onChange={(e) => update(i, { inH: e.target.value })}
                        style={{ ...inputSmall, opacity: rows[i].enabled ? 1 : 0.4 }}
                        placeholder="HH"
                      />
                      <span style={{ color: "var(--muted)", fontWeight: 700 }}>:</span>
                      <input
                        type="number"
                        min={0}
                        max={59}
                        value={rows[i].inM}
                        disabled={!rows[i].enabled}
                        onChange={(e) => update(i, { inM: e.target.value })}
                        style={{ ...inputSmall, opacity: rows[i].enabled ? 1 : 0.4 }}
                        placeholder="MM"
                      />
                    </div>
                  </td>
                  <td style={{ paddingBottom: 10, paddingRight: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <input
                        type="number"
                        min={0}
                        max={23}
                        value={rows[i].outH}
                        disabled={!rows[i].enabled}
                        onChange={(e) => update(i, { outH: e.target.value })}
                        style={{ ...inputSmall, opacity: rows[i].enabled ? 1 : 0.4 }}
                        placeholder="HH"
                      />
                      <span style={{ color: "var(--muted)", fontWeight: 700 }}>:</span>
                      <input
                        type="number"
                        min={0}
                        max={59}
                        value={rows[i].outM}
                        disabled={!rows[i].enabled}
                        onChange={(e) => update(i, { outM: e.target.value })}
                        style={{ ...inputSmall, opacity: rows[i].enabled ? 1 : 0.4 }}
                        placeholder="MM"
                      />
                    </div>
                  </td>
                  <td
                    style={{
                      paddingBottom: 10,
                      fontSize: 14,
                      fontWeight: 650,
                      color: rows[i].enabled && dailySecs[i] > 0 ? "var(--accent)" : "var(--muted)",
                    }}
                  >
                    {rows[i].enabled && dailySecs[i] > 0
                      ? `${dayHours.toFixed(2)} h`
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Hourly rate */}
      <div
        style={{
          background: "var(--wash)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: 20,
        }}
      >
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          Pay Calculation (optional)
        </div>
        <label style={{ display: "block", maxWidth: 240 }}>
          <span
            style={{
              display: "block",
              color: "#465a50",
              fontSize: ".85rem",
              fontWeight: 650,
              marginBottom: 8,
            }}
          >
            Hourly Rate
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
              placeholder="e.g. 250"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              style={{ paddingLeft: 28 }}
            />
          </span>
        </label>
      </div>

      {totalSecs > 0 && (
        <div
          style={{
            background: "var(--wash)",
            border: "1px solid #dcebe1",
            borderRadius: 14,
            padding: 22,
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            Weekly Summary
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,160px),1fr))",
              gap: 18,
            }}
          >
            <ResultCard label="Total Hours" value={`${totalHours.toFixed(2)} h`} />
            <ResultCard label="Total Minutes" value={`${(totalSecs / 60).toFixed(0)} min`} />
            <ResultCard label="Days Worked" value={`${rows.filter((r) => r.enabled && dailySecs[rows.indexOf(r)] > 0).length}`} />
            {Number.isFinite(pay) && <ResultCard label="Estimated Pay" value={fmt(pay)} />}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Convert ──────────────────────────────────────────────────────────────

function ConvertTab() {
  const [inputVal, setInputVal] = useState("");
  const [fromUnit, setFromUnit] = useState("hours");

  const units = [
    { key: "seconds", label: "Seconds", factor: 1 },
    { key: "minutes", label: "Minutes", factor: 60 },
    { key: "hours", label: "Hours", factor: 3600 },
    { key: "days", label: "Days", factor: 86400 },
    { key: "weeks", label: "Weeks", factor: 604800 },
    { key: "months", label: "Months (avg)", factor: 2629800 },
    { key: "years", label: "Years (avg)", factor: 31557600 },
  ];

  const selectStyle: React.CSSProperties = {
    padding: "9px 12px",
    borderRadius: 8,
    border: "1.5px solid var(--line)",
    background: "var(--wash)",
    fontSize: 14,
    color: "var(--ink)",
    cursor: "pointer",
    outline: "none",
  };

  const fromFactor = units.find((u) => u.key === fromUnit)?.factor ?? 3600;
  const totalSecs = (parseFloat(inputVal) || 0) * fromFactor;

  const conversions = useMemo(() => {
    if (!inputVal || isNaN(parseFloat(inputVal))) return [];
    return units
      .filter((u) => u.key !== fromUnit)
      .map((u) => ({
        label: u.label,
        value: (totalSecs / u.factor).toLocaleString("en-US", { maximumFractionDigits: 6 }),
      }));
  }, [inputVal, fromUnit, totalSecs]);

  // HH:MM:SS display
  const hmsDisplay = useMemo(() => {
    if (!inputVal || isNaN(parseFloat(inputVal))) return null;
    return formatHMS(Math.round(totalSecs));
  }, [inputVal, totalSecs]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          background: "var(--wash)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: 20,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
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
            Value
          </span>
          <input
            className="field-input"
            type="number"
            min={0}
            placeholder="Enter value"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
        </label>
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
            From Unit
          </span>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            style={selectStyle}
          >
            {units.map((u) => (
              <option key={u.key} value={u.key}>
                {u.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {conversions.length > 0 && (
        <div
          style={{
            background: "var(--wash)",
            border: "1px solid #dcebe1",
            borderRadius: 14,
            padding: 22,
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            Converted Values
          </div>
          {hmsDisplay && (
            <div
              style={{
                marginBottom: 18,
                padding: "12px 16px",
                background: "#eaf6ee",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>
                HH:MM:SS
              </span>
              <span style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)", letterSpacing: 1 }}>
                {hmsDisplay}
              </span>
            </div>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,160px),1fr))",
              gap: 18,
            }}
          >
            {conversions.map((c) => (
              <ResultCard key={c.label} label={c.label} value={c.value} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const TABS = [
  { key: "add", label: "Add Times" },
  { key: "subtract", label: "Subtract Times" },
  { key: "timecard", label: "Time Card" },
  { key: "convert", label: "Convert" },
];

export default function TimeCalculator({
  calculator,
  currency = US,
}: {
  calculator: CalculatorDefinition;
  currency?: Currency;
}) {
  const [tab, setTab] = useState<"add" | "subtract" | "timecard" | "convert">("add");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          borderBottom: "2px solid var(--line)",
          paddingBottom: 0,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            style={{
              background: tab === t.key ? "var(--accent)" : "transparent",
              border: "none",
              borderBottom: tab === t.key ? "2px solid var(--accent)" : "2px solid transparent",
              borderRadius: "8px 8px 0 0",
              color: tab === t.key ? "#fff" : "var(--muted)",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              padding: "10px 18px",
              marginBottom: -2,
              transition: "all .15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "add" && <AddTimesTab />}
      {tab === "subtract" && <SubtractTimesTab />}
      {tab === "timecard" && <TimeCardTab currency={currency} />}
      {tab === "convert" && <ConvertTab />}
    </div>
  );
}
