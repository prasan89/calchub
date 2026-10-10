"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";

// Sleep cycle = 90 min by default, plus ~14 min to fall asleep
const CYCLE_MIN=90,FALL_ASLEEP=14;
const NUM_CYCLES=[6,5,4,3];

const labelStyle:React.CSSProperties={display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8};

function fmtTime(date:Date){
  return date.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true});
}
function addMin(base:Date,min:number){
  const d=new Date(base);d.setMinutes(d.getMinutes()+min);return d;
}
function subMin(base:Date,min:number){
  const d=new Date(base);d.setMinutes(d.getMinutes()-min);return d;
}
function parseTimeStr(s:string):Date|null{
  const m=s.match(/^(\d{1,2}):(\d{2})$/);
  if(!m)return null;
  const d=new Date();d.setHours(parseInt(m[1]),parseInt(m[2]),0,0);return d;
}

type Mode="wake"|"bed";

export default function SleepCalculator({calculator}:{calculator:CalculatorDefinition}){
  const [mode,setMode]=useState<Mode>("wake");
  const [timeStr,setTimeStr]=useState(()=>{
    const d=new Date();d.setHours(7,0,0,0);return"07:00";
  });
  const [cycleDuration,setCycleDuration]=useState(String(CYCLE_MIN));
  const [fallAsleep,setFallAsleep]=useState(String(FALL_ASLEEP));

  const nowBtn=(offset:number)=>{
    const d=new Date();d.setMinutes(d.getMinutes()+offset);
    return`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  };

  const results=useMemo(()=>{
    const base=parseTimeStr(timeStr);
    if(!base)return null;
    const cycleMin=parseInt(cycleDuration)||90;
    const fallMin=parseInt(fallAsleep)||14;
    return NUM_CYCLES.map(n=>{
      const totalSleep=n*cycleMin;
      if(mode==="wake"){
        const bedTime=subMin(base,totalSleep+fallMin);
        return{cycles:n,sleep:totalSleep,bedTime:fmtTime(bedTime),wakeTime:fmtTime(base)};
      }else{
        const wakeTime=addMin(base,totalSleep+fallMin);
        return{cycles:n,sleep:totalSleep,bedTime:fmtTime(base),wakeTime:fmtTime(wakeTime)};
      }
    });
  },[timeStr,mode,cycleDuration,fallAsleep]);

  return(
    <section className="surface" style={{padding:28}} aria-label="Sleep calculator">
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:24}}>
        {([["wake","I want to wake up at..."],["bed","I want to go to bed at..."]] as const).map(([k,l])=>(
          <button key={k} type="button" onClick={()=>setMode(k)}
            style={{padding:"10px 18px",borderRadius:10,border:"1px solid",cursor:"pointer",fontWeight:700,fontSize:14,
              background:mode===k?"var(--accent)":"white",color:mode===k?"white":"var(--ink)",
              borderColor:mode===k?"var(--accent)":"var(--line)"}}>
            {l}
          </button>
        ))}
      </div>

      <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap",marginBottom:20}}>
        <label style={{display:"block"}}>
          <span style={labelStyle}>{mode==="wake"?"Wake-up Time":"Bed Time"}</span>
          <input className="field-input" type="time" value={timeStr}
            onChange={e=>setTimeStr(e.currentTarget.value)}
            style={{width:150}}/>
        </label>
        <div style={{display:"flex",gap:6,paddingBottom:2}}>
          {[["Now",0],["In 30m",30],["In 1h",60]].map(([label,offset])=>(
            <button key={label as string} type="button" onClick={()=>setTimeStr(nowBtn(offset as number))}
              style={{padding:"10px 12px",borderRadius:8,border:"1px solid var(--line)",cursor:"pointer",fontWeight:600,fontSize:12,background:"white"}}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,180px),1fr))",gap:18,marginBottom:24}}>
        <label style={{display:"block"}}>
          <span style={labelStyle}>Sleep Cycle Length</span>
          <span style={{display:"flex",position:"relative",alignItems:"center"}}>
            <input className="field-input" type="text" inputMode="numeric" value={cycleDuration}
              onChange={e=>setCycleDuration(e.currentTarget.value)}
              onBlur={e=>{const n=parseInt(e.currentTarget.value);if(n>0)setCycleDuration(String(n));}}
              style={{paddingRight:40}}/>
            <span aria-hidden style={{position:"absolute",right:12,fontSize:12,color:"var(--muted)",pointerEvents:"none"}}>min</span>
          </span>
        </label>
        <label style={{display:"block"}}>
          <span style={labelStyle}>Time to Fall Asleep</span>
          <span style={{display:"flex",position:"relative",alignItems:"center"}}>
            <input className="field-input" type="text" inputMode="numeric" value={fallAsleep}
              onChange={e=>setFallAsleep(e.currentTarget.value)}
              onBlur={e=>{const n=parseInt(e.currentTarget.value);if(n>=0)setFallAsleep(String(n));}}
              style={{paddingRight:40}}/>
            <span aria-hidden style={{position:"absolute",right:12,fontSize:12,color:"var(--muted)",pointerEvents:"none"}}>min</span>
          </span>
        </label>
      </div>

      {results&&(
        <div style={{background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
          <div className="eyebrow" style={{marginBottom:16}}>
            {mode==="wake"?"Recommended bed times to wake up feeling rested":"Recommended wake-up times"}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:0,borderRadius:10,overflow:"hidden",border:"1px solid var(--line)"}}>
            {results.map((r,i)=>(
              <div key={r.cycles} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,padding:"14px 16px",
                background:r.cycles===6?"#e8f5ee":i%2===0?"white":"var(--wash)",
                borderBottom:i<results.length-1?"1px solid var(--line)":"none",alignItems:"center",flexWrap:"wrap"}}>
                <div>
                  <div style={{fontSize:12,color:"var(--muted)",marginBottom:2}}>Sleep</div>
                  <div style={{fontWeight:800,fontSize:15}}>{Math.floor(r.sleep/60)}h {r.sleep%60>0?r.sleep%60+"m":""}</div>
                </div>
                <div>
                  <div style={{fontSize:12,color:"var(--muted)",marginBottom:2}}>Cycles</div>
                  <div style={{fontWeight:700,fontSize:14}}>{r.cycles}</div>
                </div>
                <div>
                  <div style={{fontSize:12,color:"var(--muted)",marginBottom:2}}>Bed at</div>
                  <div style={{fontWeight:700,fontSize:14}}>{r.bedTime}</div>
                </div>
                <div>
                  <div style={{fontSize:12,color:"var(--muted)",marginBottom:2}}>Wake at</div>
                  <div style={{fontWeight:700,fontSize:14}}>{r.wakeTime}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{fontSize:12,lineHeight:1.6,color:"var(--muted)",marginTop:12}}>Most adults need 7–9 hours (5–6 cycles). Waking between cycles leaves you feeling more rested.</p>
        </div>
      )}
    </section>
  );
}
