"use client";
import { useMemo, useState } from "react";
import type { CalculatorDefinition } from "@/lib/calculators/catalog";
import { IN, US, type Currency } from "@/lib/calculators/engine";

const isIN = (c: Currency) => c.locale === "en-IN";

function makeNFmt(currency: Currency) {
  return (x: number, d = 2) =>
    Number.isFinite(x) ? x.toLocaleString(currency.locale, { maximumFractionDigits: d }) : "—";
}

type ClimateZone = "hot" | "moderate" | "cold";
type SunExposure = "sunny" | "normal" | "shaded";
type InsulationQuality = "poor" | "average" | "good";

function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", color: "#465a50", fontSize: ".85rem", fontWeight: 650, marginBottom: 8 }}>
        {label}
      </span>
      <select
        className="field-input"
        value={value}
        onChange={(e) => onChange(e.currentTarget.value as T)}
        style={{ width: "100%", cursor: "pointer" }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumInput({
  label,
  value,
  onChange,
  suffix,
  min,
  step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
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
        <input
          className="field-input"
          type="number"
          min={min ?? 0}
          step={step ?? 1}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          style={{ paddingRight: suffix ? `${Math.max((suffix.length) * 8 + 16, 36)}px` : 13 }}
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

// Inline SVG gauge for BTU recommendation visualization
function BtuGauge({ btu, maxBtu }: { btu: number; maxBtu: number }) {
  const pct = Math.min(1, btu / maxBtu);
  const cx = 100, cy = 100, r = 76;
  const startAngle = Math.PI * 0.85;
  const endAngle = Math.PI * 2.15;
  const totalSweep = endAngle - startAngle;
  const valueSweep = totalSweep * pct;

  const arcX = (angle: number, radius: number) => cx + radius * Math.cos(angle);
  const arcY = (angle: number, radius: number) => cy + radius * Math.sin(angle);

  const bgPath = [
    `M ${arcX(startAngle, r)} ${arcY(startAngle, r)}`,
    `A ${r} ${r} 0 1 1 ${arcX(endAngle, r)} ${arcY(endAngle, r)}`,
  ].join(" ");

  const currentEndAngle = startAngle + valueSweep;
  const largeFill = valueSweep > Math.PI ? 1 : 0;
  const fillPath = pct > 0.005
    ? [
        `M ${arcX(startAngle, r)} ${arcY(startAngle, r)}`,
        `A ${r} ${r} 0 ${largeFill} 1 ${arcX(currentEndAngle, r)} ${arcY(currentEndAngle, r)}`,
      ].join(" ")
    : "";

  const colors = pct < 0.33 ? "#4a9d6f" : pct < 0.67 ? "#e6a817" : "#d05a3a";

  return (
    <svg width={200} height={120} viewBox="0 0 200 120" aria-hidden="true">
      <path d={bgPath} fill="none" stroke="#e8ede9" strokeWidth={14} strokeLinecap="round" />
      {fillPath && (
        <path d={fillPath} fill="none" stroke={colors} strokeWidth={14} strokeLinecap="round" />
      )}
      <text x={cx} y={95} textAnchor="middle" fontSize={13} fontWeight={700} fill={colors}>
        {Math.round(pct * 100)}%
      </text>
      <text x={cx} y={112} textAnchor="middle" fontSize={10} fill="var(--muted)">
        of scale max
      </text>
    </svg>
  );
}

export default function BtuCalculator({
  calculator,
  currency = IN,
}: {
  calculator: CalculatorDefinition;
  currency?: Currency;
}) {
  const india = isIN(currency);
  const fmtN = makeNFmt(currency);

  const unitLabel = india ? "m" : "ft";

  // Inputs
  const [length, setLength] = useState(india ? "5" : "16");
  const [width, setWidth] = useState(india ? "4" : "13");
  const [height, setHeight] = useState(india ? "3" : "9");
  const [climate, setClimate] = useState<ClimateZone>("moderate");
  const [sun, setSun] = useState<SunExposure>("normal");
  const [insulation, setInsulation] = useState<InsulationQuality>("average");

  const result = useMemo(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;

    if (l <= 0 || w <= 0 || h <= 0) return null;

    // Area in sq ft (convert from sq m if India)
    const SQ_M_TO_SQ_FT = 10.7639;
    const areaRaw = l * w;
    const areaInSqFt = india ? areaRaw * SQ_M_TO_SQ_FT : areaRaw;
    const areaSqM = india ? areaRaw : areaRaw / SQ_M_TO_SQ_FT;

    // Base BTU: 20 BTU/sq ft for moderate 8ft ceiling
    let baseBtu = areaInSqFt * 20;

    // Ceiling height multiplier (base is 8ft / ~2.44m)
    const heightInFt = india ? h * 3.28084 : h;
    const heightMultiplier = heightInFt / 8;
    baseBtu *= heightMultiplier;

    // Climate zone adjustment
    const climateMultipliers: Record<ClimateZone, number> = {
      hot: 1.3,
      moderate: 1.0,
      cold: 0.85,
    };
    baseBtu *= climateMultipliers[climate];

    // Sun exposure adjustment
    const sunMultipliers: Record<SunExposure, number> = {
      sunny: 1.15,
      normal: 1.0,
      shaded: 0.9,
    };
    baseBtu *= sunMultipliers[sun];

    // Insulation adjustment
    const insulationMultipliers: Record<InsulationQuality, number> = {
      poor: 1.25,
      average: 1.0,
      good: 0.85,
    };
    baseBtu *= insulationMultipliers[insulation];

    // Round to nearest 100
    const recommendedBtu = Math.round(baseBtu / 100) * 100;

    // AC tonnage: 1 ton = 12,000 BTU/h
    const tonExact = recommendedBtu / 12000;
    // Standard AC sizes available in tons
    const standardTons = [0.75, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0];
    const recommendedTon = standardTons.find((t) => t * 12000 >= recommendedBtu) ?? standardTons[standardTons.length - 1];

    // kW equivalent (1 BTU/h = 0.000293071 kW)
    const kw = recommendedBtu * 0.000293071;

    // Star rating hint for India (common AC ratings are 3-5 star; 5-star is most efficient)
    // This is just informational guidance
    const starRatingHint = india
      ? recommendedTon <= 1.0
        ? "1–1.5 ton AC recommended (5-star BEE rated ideal)"
        : recommendedTon <= 1.5
        ? "1.5 ton AC recommended (5-star BEE rated ideal)"
        : recommendedTon <= 2.0
        ? "2 ton AC recommended (5-star BEE rated ideal)"
        : `${recommendedTon} ton AC or multiple units recommended`
      : null;

    return {
      areaRaw,
      areaInSqFt,
      areaSqM,
      heightInFt,
      recommendedBtu,
      tonExact,
      recommendedTon,
      kw,
      starRatingHint,
    };
  }, [length, width, height, climate, sun, insulation, india]);

  const inputGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
    gap: 18,
  };

  const climateOptions: Array<{ value: ClimateZone; label: string }> = [
    { value: "hot", label: india ? "Hot / Tropical" : "Hot / Warm" },
    { value: "moderate", label: "Moderate" },
    { value: "cold", label: india ? "Cold / Hill Station" : "Cold / Northern" },
  ];

  const sunOptions: Array<{ value: SunExposure; label: string }> = [
    { value: "sunny", label: "Sunny / South-facing" },
    { value: "normal", label: "Normal" },
    { value: "shaded", label: "Shaded / North-facing" },
  ];

  const insulationOptions: Array<{ value: InsulationQuality; label: string }> = [
    { value: "poor", label: "Poor (single glass, no insulation)" },
    { value: "average", label: "Average (standard walls)" },
    { value: "good", label: "Good (double glass, insulated)" },
  ];

  return (
    <section className="surface" style={{ padding: 28 }} aria-label="BTU calculator">
      <div className="eyebrow" style={{ marginBottom: 16 }}>Room Dimensions</div>
      <div style={inputGrid}>
        <NumInput
          label={`Room Length (${unitLabel})`}
          value={length}
          onChange={setLength}
          suffix={unitLabel}
          min={0.5}
          step={0.5}
        />
        <NumInput
          label={`Room Width (${unitLabel})`}
          value={width}
          onChange={setWidth}
          suffix={unitLabel}
          min={0.5}
          step={0.5}
        />
        <NumInput
          label={`Ceiling Height (${unitLabel})`}
          value={height}
          onChange={setHeight}
          suffix={unitLabel}
          min={0.5}
          step={0.1}
        />
      </div>

      <div className="eyebrow" style={{ marginTop: 28, marginBottom: 16 }}>Room Conditions</div>
      <div style={inputGrid}>
        <SelectField
          label="Climate Zone"
          value={climate}
          onChange={setClimate}
          options={climateOptions}
        />
        <SelectField
          label="Sun Exposure"
          value={sun}
          onChange={setSun}
          options={sunOptions}
        />
        <SelectField
          label="Insulation Quality"
          value={insulation}
          onChange={setInsulation}
          options={insulationOptions}
        />
      </div>

      {result && (
        <>
          {/* Main result card */}
          <div
            style={{
              marginTop: 32,
              background: "var(--wash)",
              border: "1px solid #dcebe1",
              borderRadius: 14,
              padding: 22,
            }}
          >
            <div className="eyebrow" style={{ marginBottom: 16 }}>Recommended AC / Heating Capacity</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
                  gap: 18,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                    Required BTU/hour
                  </div>
                  <div className="result-value" style={{ color: "var(--accent)" }}>
                    {fmtN(result.recommendedBtu, 0)} BTU/h
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                    Recommended AC Size
                  </div>
                  <div className="result-value">
                    {result.recommendedTon} ton
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                    Exact Tonnage
                  </div>
                  <div className="result-value">
                    {fmtN(result.tonExact, 2)} ton
                  </div>
                </div>

                {india && (
                  <div>
                    <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                      kW Equivalent
                    </div>
                    <div className="result-value">
                      {fmtN(result.kw, 2)} kW
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                    Room Area
                  </div>
                  <div className="result-value">
                    {india
                      ? `${fmtN(result.areaRaw, 1)} m²`
                      : `${fmtN(result.areaInSqFt, 0)} sq ft`}
                  </div>
                </div>

                {!india && (
                  <div>
                    <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 650, marginBottom: 6 }}>
                      kW Equivalent
                    </div>
                    <div className="result-value">
                      {fmtN(result.kw, 2)} kW
                    </div>
                  </div>
                )}
              </div>

              {/* Gauge */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 160 }}>
                <BtuGauge btu={result.recommendedBtu} maxBtu={60000} />
                <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 4 }}>
                  Scale: 0 – 60,000 BTU/h
                </div>
              </div>
            </div>
          </div>

          {/* AC size recommendation details */}
          <div
            style={{
              marginTop: 18,
              background: "var(--wash)",
              border: "1px solid #dcebe1",
              borderRadius: 14,
              padding: 22,
            }}
          >
            <div className="eyebrow" style={{ marginBottom: 16 }}>
              {india ? "AC Size Reference (India)" : "AC Size Reference (US)"}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
                gap: 12,
              }}
            >
              {[
                { tons: 0.75, btu: 9000, label: india ? "0.75 Ton" : "3/4 Ton" },
                { tons: 1.0, btu: 12000, label: "1 Ton" },
                { tons: 1.5, btu: 18000, label: "1.5 Ton" },
                { tons: 2.0, btu: 24000, label: "2 Ton" },
                { tons: 2.5, btu: 30000, label: "2.5 Ton" },
                { tons: 3.0, btu: 36000, label: "3 Ton" },
              ].map((sz) => {
                const isRecommended = sz.tons === result.recommendedTon;
                return (
                  <div
                    key={sz.tons}
                    style={{
                      borderRadius: 10,
                      padding: "10px 14px",
                      background: isRecommended ? "#edf7f1" : "white",
                      border: isRecommended ? "2px solid var(--accent)" : "1px solid var(--line)",
                      position: "relative",
                    }}
                  >
                    {isRecommended && (
                      <div
                        style={{
                          position: "absolute",
                          top: -10,
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: "var(--accent)",
                          color: "white",
                          fontSize: 10,
                          fontWeight: 750,
                          borderRadius: 6,
                          padding: "2px 8px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Recommended
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 750,
                        color: isRecommended ? "var(--accent)" : "var(--ink)",
                        marginBottom: 4,
                      }}
                    >
                      {sz.label}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      {fmtN(sz.btu, 0)} BTU/h
                    </div>
                    {india && (
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        {fmtN(sz.btu * 0.000293071, 2)} kW
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* India-specific star rating hint */}
          {india && result.starRatingHint && (
            <div
              style={{
                marginTop: 18,
                background: "#fffbea",
                border: "1px solid #e8d87a",
                borderRadius: 14,
                padding: 18,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 750, color: "#7a6010", marginBottom: 6 }}>
                BEE Star Rating Tip
              </div>
              <div style={{ fontSize: 13, color: "#5a4a10", lineHeight: 1.6 }}>
                {result.starRatingHint}. A 5-star BEE-rated inverter AC uses up to 40% less electricity than a 1-star
                model. Check the Bureau of Energy Efficiency (BEE) label before purchasing.
              </div>
            </div>
          )}

          {/* US-specific note */}
          {!india && (
            <div
              style={{
                marginTop: 18,
                background: "#eef5fb",
                border: "1px solid #b0cce5",
                borderRadius: 14,
                padding: 18,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 750, color: "#1a4a7a", marginBottom: 6 }}>
                Energy Star & SEER Note (US)
              </div>
              <div style={{ fontSize: 13, color: "#1a3a5a", lineHeight: 1.6 }}>
                Look for Energy Star certified units with SEER2 rating of 16 or higher for optimal efficiency. Central
                AC units are rated in tons; window and mini-split units are often listed in BTU/h directly.
              </div>
            </div>
          )}

          {/* Calculation factors summary */}
          <div
            style={{
              marginTop: 18,
              background: "var(--wash)",
              border: "1px solid #dcebe1",
              borderRadius: 14,
              padding: 22,
            }}
          >
            <div className="eyebrow" style={{ marginBottom: 14 }}>Adjustment Factors Applied</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                gap: 12,
                fontSize: 13,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                <span style={{ color: "var(--muted)", fontWeight: 650 }}>Base rate</span>
                <span style={{ fontWeight: 700 }}>20 BTU/sq ft</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                <span style={{ color: "var(--muted)", fontWeight: 650 }}>
                  Room area ({india ? "sq m → sq ft" : "sq ft"})
                </span>
                <span style={{ fontWeight: 700 }}>
                  {india
                    ? `${fmtN(result.areaRaw, 1)} m² (${fmtN(result.areaInSqFt, 0)} sq ft)`
                    : `${fmtN(result.areaInSqFt, 0)} sq ft`}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                <span style={{ color: "var(--muted)", fontWeight: 650 }}>
                  Ceiling height ({india ? "m → ft" : "ft"})
                </span>
                <span style={{ fontWeight: 700 }}>
                  {india
                    ? `${parseFloat(height)} m (${fmtN(result.heightInFt, 1)} ft) — ×${fmtN(result.heightInFt / 8, 2)}`
                    : `${parseFloat(height)} ft — ×${fmtN(result.heightInFt / 8, 2)}`}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                <span style={{ color: "var(--muted)", fontWeight: 650 }}>Climate</span>
                <span style={{ fontWeight: 700 }}>
                  {climate === "hot" ? "Hot ×1.30" : climate === "cold" ? "Cold ×0.85" : "Moderate ×1.00"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                <span style={{ color: "var(--muted)", fontWeight: 650 }}>Sun exposure</span>
                <span style={{ fontWeight: 700 }}>
                  {sun === "sunny" ? "Sunny ×1.15" : sun === "shaded" ? "Shaded ×0.90" : "Normal ×1.00"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                <span style={{ color: "var(--muted)", fontWeight: 650 }}>Insulation</span>
                <span style={{ fontWeight: 700 }}>
                  {insulation === "poor" ? "Poor ×1.25" : insulation === "good" ? "Good ×0.85" : "Average ×1.00"}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--muted)", marginTop: 24 }}>
        Estimates are based on standard industry rules of thumb. Actual requirements depend on local climate data,
        building materials, occupancy, appliances, and other factors. Consult an HVAC professional for precise sizing.
      </p>
    </section>
  );
}
