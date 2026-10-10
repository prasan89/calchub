"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";

// ── helpers ──────────────────────────────────────────────────────────────────

function addDays(date:Date,n:number):Date{
  const d=new Date(date);
  d.setDate(d.getDate()+n);
  return d;
}

function diffDays(a:Date,b:Date):number{
  return Math.round((b.getTime()-a.getTime())/(1000*60*60*24));
}

function fmtDate(d:Date):string{
  return d.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
}

function fmtShort(d:Date):string{
  return d.toLocaleDateString("en-GB",{day:"numeric",month:"short"});
}

function isSameDay(a:Date,b:Date):boolean{
  return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
}

// Returns yyyy-mm-dd string for <input type="date">
function toInputDate(d:Date):string{
  const y=d.getFullYear();
  const m=String(d.getMonth()+1).padStart(2,"0");
  const dd=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${dd}`;
}

function fromInputDate(s:string):Date|null{
  if(!s) return null;
  const d=new Date(s+"T00:00:00");
  return Number.isNaN(d.getTime())?null:d;
}

// ── types ─────────────────────────────────────────────────────────────────────

type Phase="menstrual"|"follicular"|"ovulation"|"luteal";
interface PredictedPeriod{start:Date;end:Date;daysUntil:number;ovulation:Date;}

// ── calculation ───────────────────────────────────────────────────────────────

function calcPhase(lastStart:Date,cycleLen:number,periodDur:number,today:Date):Phase{
  // Find the most recent cycle start relative to today
  const dayInCycle=((diffDays(lastStart,today)%cycleLen)+cycleLen)%cycleLen;
  if(dayInCycle<periodDur) return "menstrual";
  // Ovulation around day (cycleLen-14)
  const ovulationDay=Math.max(periodDur+1,cycleLen-14);
  if(dayInCycle>=ovulationDay-1&&dayInCycle<=ovulationDay+1) return "ovulation";
  if(dayInCycle<ovulationDay-1) return "follicular";
  return "luteal";
}

function predictPeriods(lastStart:Date,cycleLen:number,periodDur:number,today:Date):PredictedPeriod[]{
  const results:PredictedPeriod[]=[];
  // Find next 3 period starts strictly after today
  let n=1;
  while(results.length<3&&n<200){
    const start=addDays(lastStart,n*cycleLen);
    if(start>=today){
      const end=addDays(start,periodDur-1);
      const daysUntil=Math.max(0,diffDays(today,start));
      const ovulation=addDays(start,cycleLen-14);
      results.push({start,end,daysUntil,ovulation});
    }
    n++;
  }
  return results;
}

// ── day classification for calendar strip ─────────────────────────────────────

type DayKind="period"|"ovulation"|"fertile"|"today"|"normal";

function classifyDay(
  d:Date,
  lastStart:Date,
  cycleLen:number,
  periodDur:number,
  today:Date
):DayKind{
  if(isSameDay(d,today)) return "today";
  const dayInCycle=((diffDays(lastStart,d)%cycleLen)+cycleLen)%cycleLen;
  if(dayInCycle<periodDur) return "period";
  const ovulationDay=Math.max(periodDur+1,cycleLen-14);
  if(dayInCycle===ovulationDay) return "ovulation";
  if(dayInCycle>=ovulationDay-4&&dayInCycle<=ovulationDay+1) return "fertile";
  return "normal";
}

const KIND_COLORS:Record<DayKind,{bg:string;color:string;label?:string}> = {
  period:   {bg:"#e05c7a", color:"white",    label:"Period"},
  ovulation:{bg:"#176b4d", color:"white",    label:"Ovulation"},
  fertile:  {bg:"#b2e6d0", color:"#0d3d28",  label:"Fertile window"},
  today:    {bg:"var(--accent)", color:"white"},
  normal:   {bg:"transparent", color:"var(--ink)"},
};

const PHASE_COLORS:Record<Phase,{bg:string;color:string;desc:string}> = {
  menstrual:  {bg:"#e05c7a", color:"white",   desc:"Menstruation is occurring."},
  follicular: {bg:"#5b8ff9", color:"white",   desc:"The follicular phase — rising estrogen, increasing energy."},
  ovulation:  {bg:"#176b4d", color:"white",   desc:"Ovulation window — peak fertility."},
  luteal:     {bg:"#a78bfa", color:"white",   desc:"Luteal phase — progesterone rises; mood may shift."},
};

// ── sub-components ─────────────────────────────────────────────────────────────

function CalendarStrip({lastStart,cycleLen,periodDur,today}:{lastStart:Date;cycleLen:number;periodDur:number;today:Date}){
  const days=useMemo(()=>{
    const arr:Date[]=[];
    for(let i=0;i<60;i++) arr.push(addDays(today,i));
    return arr;
  },[today]);

  // Group into weeks (rows of 7)
  const weeks:Date[][]=[];
  for(let i=0;i<days.length;i+=7) weeks.push(days.slice(i,i+7));

  const DOW=["Su","Mo","Tu","We","Th","Fr","Sa"];

  return(
    <div style={{overflowX:"auto"}}>
      <table style={{borderCollapse:"separate",borderSpacing:"3px 3px",fontSize:12}}>
        <thead>
          <tr>
            {DOW.map(d=>(
              <th key={d} style={{padding:"4px 0",textAlign:"center",color:"var(--muted)",fontWeight:700,width:36,minWidth:32}}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week,wi)=>(
            <tr key={wi}>
              {week.map((day,di)=>{
                const kind=classifyDay(day,lastStart,cycleLen,periodDur,today);
                const col=KIND_COLORS[kind];
                const isCurrentDay=kind==="today";
                return(
                  <td key={di} title={`${fmtShort(day)}${col.label?" — "+col.label:""}`}
                    style={{
                      textAlign:"center",
                      verticalAlign:"middle",
                      padding:"5px 0",
                      width:36,minWidth:32,
                    }}
                  >
                    <span style={{
                      display:"inline-flex",
                      alignItems:"center",
                      justifyContent:"center",
                      width:30,height:30,
                      borderRadius:"50%",
                      background:col.bg,
                      color:col.color,
                      fontWeight:isCurrentDay?800:500,
                      border:isCurrentDay?"2px solid #176b4d":"none",
                      fontSize:12,
                    }}>{day.getDate()}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:12,fontSize:12,fontWeight:650}}>
        {(Object.entries(KIND_COLORS) as [DayKind,{bg:string;color:string;label?:string}][])
          .filter(([k])=>k!=="normal")
          .map(([k,v])=>(
            <span key={k} style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{width:12,height:12,borderRadius:"50%",background:v.bg,display:"inline-block",border:k==="today"?"2px solid #176b4d":"none"}}/>
              {k==="today"?"Today":v.label??k}
            </span>
          ))
        }
      </div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────────

export default function PeriodCalculator({calculator}:{calculator:CalculatorDefinition}){
  const today=useMemo(()=>{
    const d=new Date();
    d.setHours(0,0,0,0);
    return d;
  },[]);

  // Default last period start to 14 days ago
  const defaultLastStart=toInputDate(addDays(today,-14));

  const [lastStartStr,setLastStartStr]=useState(defaultLastStart);
  const [cycleStr,setCycleStr]=useState("28");
  const [durStr,setDurStr]=useState("5");

  const lastStart=fromInputDate(lastStartStr)??today;
  const cycleLen=Math.min(60,Math.max(15,parseInt(cycleStr)||28));
  const periodDur=Math.min(10,Math.max(1,parseInt(durStr)||5));

  const phase=useMemo(()=>calcPhase(lastStart,cycleLen,periodDur,today),[lastStart,cycleLen,periodDur,today]);
  const predictions=useMemo(()=>predictPeriods(lastStart,cycleLen,periodDur,today),[lastStart,cycleLen,periodDur,today]);

  const phaseInfo=PHASE_COLORS[phase];
  const phaseLabel=phase.charAt(0).toUpperCase()+phase.slice(1);

  const inputLabelStyle:React.CSSProperties={display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8};

  return(
    <section className="surface" style={{padding:28}} aria-label="Period / cycle tracker">
      {/* Inputs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))",gap:18,marginBottom:28}}>
        <label style={{display:"block"}}>
          <span style={inputLabelStyle}>Last Period Start Date</span>
          <input
            className="field-input"
            type="date"
            value={lastStartStr}
            max={toInputDate(today)}
            onChange={e=>setLastStartStr(e.target.value)}
          />
        </label>

        <label style={{display:"block"}}>
          <span style={inputLabelStyle}>Cycle Length (days)</span>
          <span style={{display:"flex",position:"relative",alignItems:"center"}}>
            <input
              className="field-input"
              type="number"
              value={cycleStr}
              min={15}
              max={60}
              onChange={e=>setCycleStr(e.target.value)}
              style={{paddingRight:40}}
            />
            <span aria-hidden style={{position:"absolute",right:12,fontSize:12,color:"var(--muted)",pointerEvents:"none"}}>days</span>
          </span>
        </label>

        <label style={{display:"block"}}>
          <span style={inputLabelStyle}>Period Duration (days)</span>
          <span style={{display:"flex",position:"relative",alignItems:"center"}}>
            <input
              className="field-input"
              type="number"
              value={durStr}
              min={1}
              max={10}
              onChange={e=>setDurStr(e.target.value)}
              style={{paddingRight:40}}
            />
            <span aria-hidden style={{position:"absolute",right:12,fontSize:12,color:"var(--muted)",pointerEvents:"none"}}>days</span>
          </span>
        </label>
      </div>

      {/* Current phase badge */}
      <div style={{background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22,marginBottom:24}}>
        <div className="eyebrow" style={{marginBottom:14}}>Cycle Phase Today</div>
        <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
          <span style={{
            display:"inline-block",
            padding:"8px 20px",
            borderRadius:24,
            background:phaseInfo.bg,
            color:phaseInfo.color,
            fontWeight:750,
            fontSize:16,
            letterSpacing:.3,
          }}>{phaseLabel}</span>
          <span style={{color:"var(--muted)",fontSize:14,lineHeight:1.5,flex:1}}>{phaseInfo.desc}</span>
        </div>
      </div>

      {/* Next 3 periods */}
      <div style={{background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22,marginBottom:24}}>
        <div className="eyebrow" style={{marginBottom:16}}>Next 3 Predicted Periods</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,240px),1fr))",gap:16}}>
          {predictions.map((p,i)=>(
            <div key={i} style={{
              background:"white",
              border:"1px solid var(--line)",
              borderRadius:12,
              padding:"16px 18px",
            }}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--muted)",marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>
                Period {i+1}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                <div>
                  <div style={{fontSize:11,color:"var(--muted)",fontWeight:600,marginBottom:3}}>Starts</div>
                  <div style={{fontWeight:700,fontSize:14}}>{fmtDate(p.start)}</div>
                </div>
                <div>
                  <div style={{fontSize:11,color:"var(--muted)",fontWeight:600,marginBottom:3}}>Ends</div>
                  <div style={{fontWeight:700,fontSize:14}}>{fmtDate(p.end)}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <span style={{
                  background:"#fce4ec",color:"#b71c51",
                  borderRadius:8,padding:"3px 10px",
                  fontSize:12,fontWeight:700,
                }}>
                  {p.daysUntil===0?"Today":p.daysUntil===1?"Tomorrow":`In ${p.daysUntil} days`}
                </span>
                <span style={{
                  background:"#e8f5e9",color:"#176b4d",
                  borderRadius:8,padding:"3px 10px",
                  fontSize:12,fontWeight:700,
                }}>
                  Ovulation ~{fmtShort(p.ovulation)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar strip */}
      <div style={{background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22,marginBottom:24}}>
        <div className="eyebrow" style={{marginBottom:16}}>Next 60 Days</div>
        <CalendarStrip
          lastStart={lastStart}
          cycleLen={cycleLen}
          periodDur={periodDur}
          today={today}
        />
      </div>

      {/* Disclaimer */}
      <p style={{
        fontSize:12,
        lineHeight:1.6,
        color:"var(--muted)",
        background:"#fff8e1",
        border:"1px solid #ffe082",
        borderRadius:10,
        padding:"12px 16px",
        marginTop:8,
      }}>
        <strong>Estimates only.</strong> Predictions are based on average cycle length and may not reflect your individual cycle. Consult a healthcare provider for medical advice.
      </p>
    </section>
  );
}
