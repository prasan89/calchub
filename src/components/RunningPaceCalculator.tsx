"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";

type Mode="pace"|"distance"|"time";
const PRESETS=[
  {label:"5K",dist:5},
  {label:"10K",dist:10},
  {label:"Half Marathon",dist:21.0975},
  {label:"Marathon",dist:42.195},
];

const labelStyle:React.CSSProperties={display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8};
const selStyle:React.CSSProperties={display:"block",width:"100%",border:"1px solid #cbd8cf",borderRadius:10,padding:"12px 13px",background:"#fff",color:"var(--ink)",outline:"none",fontSize:"inherit",cursor:"pointer"};

function TimeInput({label,h,m,s,onH,onM,onS,disabled}:{label:string;h:string;m:string;s:string;onH:(v:string)=>void;onM:(v:string)=>void;onS:(v:string)=>void;disabled?:boolean}){
  const inp=(value:string,onChange:(v:string)=>void,max:number)=>(
    <input className="field-input" type="text" inputMode="numeric" value={value} disabled={disabled}
      onChange={e=>onChange(e.currentTarget.value)}
      onBlur={e=>{const n=Math.min(max,Math.max(0,parseInt(e.currentTarget.value)||0));onChange(String(n).padStart(2,"0"));}}
      style={{width:54,textAlign:"center",opacity:disabled?.45:1,cursor:disabled?"not-allowed":"",padding:"12px 8px"}}/>
  );
  return(
    <div style={{opacity:disabled?.45:1}}>
      <span style={labelStyle}>{label}{disabled&&<span style={{fontSize:11,color:"var(--muted)",marginLeft:6}}>(solved)</span>}</span>
      <span style={{display:"flex",alignItems:"center",gap:4}}>
        {inp(h,onH,99)}<span style={{color:"var(--muted)"}}>h</span>
        {inp(m,onM,59)}<span style={{color:"var(--muted)"}}>m</span>
        {inp(s,onS,59)}<span style={{color:"var(--muted)"}}>s</span>
      </span>
    </div>
  );
}

function toSec(h:string,m:string,s:string){return (parseInt(h)||0)*3600+(parseInt(m)||0)*60+(parseInt(s)||0);}
function fmtSec(sec:number){const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=Math.round(sec%60);return`${h>0?h+"h ":""}${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`;}
function fmtPace(secPerKm:number){const m=Math.floor(secPerKm/60),s=Math.round(secPerKm%60);return`${m}:${String(s).padStart(2,"0")} min/km`;}

export default function RunningPaceCalculator({calculator}:{calculator:CalculatorDefinition}){
  const [mode,setMode]=useState<Mode>("pace");
  const [dist,setDist]=useState("10");
  const [timeH,setTimeH]=useState("00");
  const [timeM,setTimeM]=useState("60");
  const [timeS,setTimeS]=useState("00");
  const [paceM,setPaceM]=useState("06");
  const [paceS,setPaceS]=useState("00");

  const result=useMemo(()=>{
    const d=parseFloat(dist)||0;
    const totalSec=toSec(timeH,timeM,timeS);
    const paceSec=(parseInt(paceM)||0)*60+(parseInt(paceS)||0);
    if(mode==="pace"){
      if(d<=0||totalSec<=0)return null;
      const sec=totalSec/d;
      return{pace:fmtPace(sec),speed:(d/(totalSec/3600)).toFixed(2)+" km/h",time:null,dist:null};
    }
    if(mode==="time"){
      if(d<=0||paceSec<=0)return null;
      const total=d*paceSec;
      return{time:fmtSec(total),speed:(3600/paceSec).toFixed(2)+" km/h",pace:null,dist:null};
    }
    // solve distance
    if(totalSec<=0||paceSec<=0)return null;
    const km=totalSec/paceSec;
    return{dist:`${km.toFixed(2)} km`,speed:(3600/paceSec).toFixed(2)+" km/h",pace:null,time:null};
  },[mode,dist,timeH,timeM,timeS,paceM,paceS]);

  const finishTimes=useMemo(()=>{
    const paceSec=(parseInt(paceM)||0)*60+(parseInt(paceS)||0);
    if(paceSec<=0)return null;
    return PRESETS.map(p=>({...p,time:fmtSec(p.dist*paceSec)}));
  },[paceM,paceS]);

  const tabs:Array<{key:Mode;label:string}> = [
    {key:"pace",label:"Find Pace"},
    {key:"time",label:"Find Finish Time"},
    {key:"distance",label:"Find Distance"},
  ];

  return(
    <section className="surface" style={{padding:28}} aria-label="Running pace calculator">
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:24}}>
        {tabs.map(t=>(
          <button key={t.key} type="button" onClick={()=>setMode(t.key)}
            style={{padding:"9px 16px",borderRadius:9,border:"1px solid",cursor:"pointer",fontWeight:700,fontSize:13,
              background:mode===t.key?"var(--accent)":"white",color:mode===t.key?"white":"var(--ink)",
              borderColor:mode===t.key?"var(--accent)":"var(--line)"}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{display:"flex",gap:18,flexWrap:"wrap",alignItems:"flex-end",marginBottom:18}}>
        <label style={{display:"block",opacity:mode==="distance"?.45:1}}>
          <span style={labelStyle}>Distance{mode==="distance"&&<span style={{fontSize:11,color:"var(--muted)",marginLeft:6}}>(solved)</span>}</span>
          <span style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{display:"flex",position:"relative",alignItems:"center"}}>
              <input className="field-input" type="text" inputMode="decimal" value={dist} disabled={mode==="distance"}
                onChange={e=>setDist(e.currentTarget.value)}
                onBlur={e=>{const n=parseFloat(e.currentTarget.value);if(n>0)setDist(String(n));}}
                style={{width:100,paddingRight:36,opacity:mode==="distance"?.45:1,cursor:mode==="distance"?"not-allowed":""}}/>
              <span aria-hidden style={{position:"absolute",right:10,fontSize:12,color:"var(--muted)",pointerEvents:"none"}}>km</span>
            </span>
            <select value={dist} onChange={e=>setDist(e.currentTarget.value)} style={{...selStyle,width:"auto",padding:"12px 10px"}}>
              {PRESETS.map(p=><option key={p.label} value={String(p.dist)}>{p.label}</option>)}
            </select>
          </span>
        </label>

        <TimeInput label="Time" h={timeH} m={timeM} s={timeS}
          onH={setTimeH} onM={setTimeM} onS={setTimeS}
          disabled={mode==="time"}/>

        <label style={{opacity:mode==="pace"?.45:1}}>
          <span style={labelStyle}>Pace{mode==="pace"&&<span style={{fontSize:11,color:"var(--muted)",marginLeft:6}}>(solved)</span>}</span>
          <span style={{display:"flex",alignItems:"center",gap:4}}>
            <input className="field-input" type="text" inputMode="numeric" value={paceM} disabled={mode==="pace"}
              onChange={e=>setPaceM(e.currentTarget.value)}
              onBlur={e=>{const n=Math.max(0,parseInt(e.currentTarget.value)||0);setPaceM(String(n).padStart(2,"0"));}}
              style={{width:54,textAlign:"center",padding:"12px 8px",opacity:mode==="pace"?.45:1,cursor:mode==="pace"?"not-allowed":""}}/>
            <span style={{color:"var(--muted)"}}>m</span>
            <input className="field-input" type="text" inputMode="numeric" value={paceS} disabled={mode==="pace"}
              onChange={e=>setPaceS(e.currentTarget.value)}
              onBlur={e=>{const n=Math.min(59,Math.max(0,parseInt(e.currentTarget.value)||0));setPaceS(String(n).padStart(2,"0"));}}
              style={{width:54,textAlign:"center",padding:"12px 8px",opacity:mode==="pace"?.45:1,cursor:mode==="pace"?"not-allowed":""}}/>
            <span style={{color:"var(--muted)",fontSize:12}}>s / km</span>
          </span>
        </label>
      </div>

      {result&&(
        <div style={{marginTop:4,background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
          <div className="eyebrow" style={{marginBottom:12}}>Result</div>
          <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
            {result.pace&&<div><div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Pace</div><div className="result-value">{result.pace}</div></div>}
            {result.time&&<div><div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Finish Time</div><div className="result-value">{result.time}</div></div>}
            {result.dist&&<div><div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Distance</div><div className="result-value">{result.dist}</div></div>}
            <div><div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Speed</div><div className="result-value">{result.speed}</div></div>
          </div>
        </div>
      )}

      {finishTimes&&(mode==="time"||mode==="pace")&&(
        <div style={{marginTop:20,background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
          <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:12}}>Finish times at current pace</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,160px),1fr))",gap:14}}>
            {finishTimes.map(p=>(
              <div key={p.label}>
                <div style={{fontSize:13,color:"var(--muted)",marginBottom:4}}>{p.label} ({p.dist} km)</div>
                <div style={{fontWeight:800,fontSize:16}}>{p.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
