"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";

// Day type for cycle calendar coloring
type DayType = "menstrual" | "fertile" | "ovulation" | "luteal" | "next-period" | "other";

const DAY_COLORS: Record<DayType,{bg:string;color:string;label:string}> = {
  menstrual:    {bg:"#ffe0e0", color:"#b83232", label:"Menstrual"},
  fertile:      {bg:"#d6f0e8", color:"#176b4d", label:"Fertile Window"},
  ovulation:    {bg:"#176b4d", color:"#ffffff", label:"Ovulation Day"},
  luteal:       {bg:"#f5f5f5", color:"#6b7280", label:"Luteal Phase"},
  "next-period":{bg:"#fef3c7", color:"#b45309", label:"Next Period"},
  other:        {bg:"#f9fafb", color:"#9ca3af", label:""},
};

function addDays(date:Date, n:number):Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function fmtDate(d:Date):string {
  return d.toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric"});
}

function fmtShort(d:Date):string {
  return d.toLocaleDateString("en-US", {month:"short", day:"numeric"});
}

function isSameDay(a:Date, b:Date):boolean {
  return a.getFullYear()===b.getFullYear() &&
         a.getMonth()===b.getMonth() &&
         a.getDate()===b.getDate();
}

function startOfDay(d:Date):Date {
  const x = new Date(d);
  x.setHours(0,0,0,0);
  return x;
}

interface OvulationCalcProps {
  calculator: CalculatorDefinition;
}

export default function OvulationCalculator({calculator:_calc}:OvulationCalcProps) {
  // Input: last period start date (as string for date input) and cycle length
  const todayStr = useMemo(()=>{
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
  },[]);

  const [lastPeriodStr, setLastPeriodStr] = useState<string>(todayStr);
  const [cycleLen, setCycleLen] = useState<number>(28);
  const [periodLen, setPeriodLen] = useState<number>(5);

  const results = useMemo(()=>{
    const lp = startOfDay(new Date(lastPeriodStr + "T00:00:00"));
    if(isNaN(lp.getTime())) return null;
    const cl = Math.max(20, Math.min(45, Math.round(cycleLen)));
    const pl = Math.max(2, Math.min(10, Math.round(periodLen)));

    // Ovulation day = LMP + (cycle - 14)
    const ovulationDay = addDays(lp, cl - 14);

    // Fertile window: 5 days before ovulation + ovulation day itself (6 days)
    const fertileStart = addDays(ovulationDay, -5);
    const fertileEnd   = ovulationDay; // inclusive

    // Next period start
    const nextPeriod = addDays(lp, cl);

    // Luteal phase starts day after ovulation
    const lutealStart = addDays(ovulationDay, 1);
    const lutealEnd   = addDays(nextPeriod, -1);

    // Calendar days: show 35 days from LMP
    const calDays: {date:Date; dayNum:number; type:DayType}[] = [];
    for(let i=0; i<35; i++) {
      const d = addDays(lp, i);
      let type:DayType = "other";
      // Next period (day 0 of next cycle) — show first few days
      if(i >= cl && i < cl + pl) {
        type = "next-period";
      } else if(isSameDay(d, ovulationDay)) {
        type = "ovulation";
      } else if(d >= fertileStart && d <= fertileEnd) {
        type = "fertile";
      } else if(i < pl) {
        type = "menstrual";
      } else if(d >= lutealStart && d <= lutealEnd && i < cl) {
        type = "luteal";
      } else if(i < cl) {
        type = "other";
      }
      calDays.push({date:d, dayNum:i+1, type});
    }

    return {lp, cl, pl, ovulationDay, fertileStart, fertileEnd, nextPeriod, lutealStart, lutealEnd, calDays};
  }, [lastPeriodStr, cycleLen, periodLen]);

  const inputStyle:React.CSSProperties = {
    display:"block", width:"100%", padding:"10px 14px",
    border:"1px solid var(--line)", borderRadius:8,
    fontSize:15, background:"var(--wash)", color:"var(--ink)",
    outline:"none", boxSizing:"border-box",
  };

  const labelStyle:React.CSSProperties = {
    display:"block", color:"#465a50", fontSize:".85rem", fontWeight:650, marginBottom:8,
  };

  return (
    <div style={{display:"flex", flexDirection:"column", gap:24}}>

      {/* Inputs */}
      <div className="surface" style={{padding:22}}>
        <div className="eyebrow" style={{marginBottom:18}}>Cycle Information</div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))", gap:18}}>
          <label style={{display:"block"}}>
            <span style={labelStyle}>First Day of Last Period</span>
            <input
              className="field-input"
              type="date"
              value={lastPeriodStr}
              max={todayStr}
              onChange={e=>setLastPeriodStr(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label style={{display:"block"}}>
            <span style={labelStyle}>Average Cycle Length (days)</span>
            <input
              className="field-input"
              type="number"
              value={cycleLen}
              min={20} max={45}
              onChange={e=>setCycleLen(Math.max(20, Math.min(45, +e.target.value)))}
              style={inputStyle}
            />
            <span style={{fontSize:12, color:"var(--muted)", marginTop:4, display:"block"}}>Typical range: 21–35 days</span>
          </label>
          <label style={{display:"block"}}>
            <span style={labelStyle}>Period Duration (days)</span>
            <input
              className="field-input"
              type="number"
              value={periodLen}
              min={2} max={10}
              onChange={e=>setPeriodLen(Math.max(2, Math.min(10, +e.target.value)))}
              style={inputStyle}
            />
            <span style={{fontSize:12, color:"var(--muted)", marginTop:4, display:"block"}}>Typical range: 3–7 days</span>
          </label>
        </div>
      </div>

      {/* Results */}
      {results && (
        <>
          <div style={{background:"var(--wash)", border:"1px solid #dcebe1", borderRadius:14, padding:22}}>
            <div className="eyebrow" style={{marginBottom:16}}>Key Dates</div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))", gap:18}}>
              <div>
                <div style={{fontSize:13, color:"var(--muted)", fontWeight:650, marginBottom:6}}>Ovulation Day</div>
                <div className="result-value" style={{fontSize:22}}>{fmtDate(results.ovulationDay)}</div>
                <div style={{fontSize:12, color:"var(--muted)", marginTop:4}}>Day {results.cl - 14} of your cycle</div>
              </div>
              <div>
                <div style={{fontSize:13, color:"var(--muted)", fontWeight:650, marginBottom:6}}>Fertile Window</div>
                <div className="result-value" style={{fontSize:22}}>
                  {fmtShort(results.fertileStart)} – {fmtShort(results.fertileEnd)}
                </div>
                <div style={{fontSize:12, color:"var(--muted)", marginTop:4}}>6 days (incl. ovulation)</div>
              </div>
              <div>
                <div style={{fontSize:13, color:"var(--muted)", fontWeight:650, marginBottom:6}}>Next Period Starts</div>
                <div className="result-value" style={{fontSize:22}}>{fmtDate(results.nextPeriod)}</div>
                <div style={{fontSize:12, color:"var(--muted)", marginTop:4}}>{results.cl}-day cycle</div>
              </div>
              <div>
                <div style={{fontSize:13, color:"var(--muted)", fontWeight:650, marginBottom:6}}>Luteal Phase</div>
                <div className="result-value" style={{fontSize:22}}>
                  {fmtShort(results.lutealStart)} – {fmtShort(results.lutealEnd)}
                </div>
                <div style={{fontSize:12, color:"var(--muted)", marginTop:4}}>
                  {Math.max(0, Math.round((results.nextPeriod.getTime() - results.ovulationDay.getTime())/(1000*60*60*24)))} days
                </div>
              </div>
            </div>
          </div>

          {/* Cycle Calendar */}
          <div className="surface" style={{padding:22}}>
            <div className="eyebrow" style={{marginBottom:16}}>35-Day Cycle Calendar</div>
            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(7, 1fr)",
              gap:4,
              marginBottom:16,
            }}>
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
                <div key={d} style={{
                  textAlign:"center", fontSize:11, fontWeight:700,
                  color:"var(--muted)", padding:"4px 0",
                }}>{d}</div>
              ))}
              {/* Offset for first day of period */}
              {Array.from({length: results.lp.getDay()}).map((_,i)=>(
                <div key={`pad-${i}`} />
              ))}
              {results.calDays.map(({date, dayNum, type})=>{
                const col = DAY_COLORS[type];
                const isToday = isSameDay(date, startOfDay(new Date()));
                return (
                  <div key={dayNum} title={`Day ${dayNum}: ${col.label || type}`} style={{
                    background: col.bg,
                    color: col.color,
                    borderRadius: 6,
                    padding: "6px 2px",
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: type === "ovulation" ? 800 : 500,
                    border: isToday ? "2px solid var(--accent)" : `1px solid ${col.bg === "#f9fafb" ? "var(--line)" : "transparent"}`,
                    cursor:"default",
                    minWidth:0,
                  }}>
                    <div style={{fontSize:10, opacity:0.7}}>{date.getDate()}</div>
                    <div style={{fontSize:9, marginTop:1, fontWeight:600, letterSpacing:"-0.2px"}}>
                      {type === "ovulation" ? "OV" :
                       type === "fertile" ? "F" :
                       type === "menstrual" ? "M" :
                       type === "next-period" ? "NP" :
                       type === "luteal" ? "L" : ""}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{display:"flex", flexWrap:"wrap", gap:10, marginTop:8}}>
              {(["menstrual","fertile","ovulation","luteal","next-period"] as DayType[]).map(type=>{
                const col = DAY_COLORS[type];
                return (
                  <div key={type} style={{display:"flex", alignItems:"center", gap:5}}>
                    <div style={{
                      width:14, height:14, borderRadius:3,
                      background:col.bg, border:`1px solid ${col.color}22`,
                      flexShrink:0,
                    }}/>
                    <span style={{fontSize:12, color:"var(--muted)"}}>{col.label}</span>
                  </div>
                );
              })}
              <div style={{display:"flex", alignItems:"center", gap:5}}>
                <div style={{width:14, height:14, borderRadius:3, border:"2px solid var(--accent)", flexShrink:0}}/>
                <span style={{fontSize:12, color:"var(--muted)"}}>Today</span>
              </div>
            </div>
          </div>

          {/* Phase Summary */}
          <div className="surface" style={{padding:22}}>
            <div className="eyebrow" style={{marginBottom:16}}>Cycle Phase Breakdown</div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,160px),1fr))", gap:12}}>
              {[
                {label:"Menstrual Phase",     days:`Days 1–${results.pl}`,     bg:"#ffe0e0", color:"#b83232"},
                {label:"Follicular Phase",    days:`Days ${results.pl+1}–${results.cl-14-5}`, bg:"#e8f5e9", color:"#2e7d32"},
                {label:"Fertile Window",      days:`Days ${results.cl-14-5}–${results.cl-14}`, bg:"#d6f0e8", color:"#176b4d"},
                {label:"Ovulation",           days:`Day ${results.cl-14}`,     bg:"#176b4d", color:"#fff"},
                {label:"Luteal Phase",        days:`Days ${results.cl-13}–${results.cl}`, bg:"#f5f5f5", color:"#6b7280"},
              ].map(({label,days,bg,color})=>(
                <div key={label} style={{
                  background:bg, color:color,
                  borderRadius:8, padding:"12px 14px",
                  border:`1px solid ${bg}`,
                }}>
                  <div style={{fontWeight:700, fontSize:13, marginBottom:4}}>{label}</div>
                  <div style={{fontSize:12, opacity:0.85}}>{days}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Disclaimer */}
      <div style={{
        background:"#fffbeb",
        border:"1px solid #fcd34d",
        borderRadius:10,
        padding:"14px 18px",
        fontSize:13,
        color:"#92400e",
        lineHeight:1.6,
      }}>
        <strong>Important Disclaimer:</strong> This is an estimate based on average cycle patterns.
        Actual ovulation timing varies significantly between individuals and cycle to cycle due to
        stress, illness, hormonal changes, and other factors. <strong>Do not use this calculator
        as a contraceptive method.</strong> Consult a healthcare professional for family planning advice.
      </div>
    </div>
  );
}
