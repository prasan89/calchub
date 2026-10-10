"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";

type SolveFor="speed"|"distance"|"time";
const labelStyle:React.CSSProperties={display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8};
const selStyle:React.CSSProperties={border:"1px solid #cbd8cf",borderRadius:10,padding:"12px 10px",background:"#fff",color:"var(--ink)",outline:"none",fontSize:13,cursor:"pointer"};

const SPEED_UNITS=[
  {label:"m/s",toMs:1},{label:"km/h",toMs:1/3.6},{label:"mph",toMs:0.44704},
  {label:"knot",toMs:0.514444},{label:"ft/s",toMs:0.3048},{label:"Mach",toMs:343},
];
const DIST_UNITS=[
  {label:"m",toM:1},{label:"km",toM:1000},{label:"mile",toM:1609.344},
  {label:"ft",toM:0.3048},{label:"yard",toM:0.9144},{label:"nautical mile",toM:1852},
];
const TIME_UNITS=[
  {label:"seconds",toS:1},{label:"minutes",toS:60},{label:"hours",toS:3600},{label:"days",toS:86400},
];

function NumInput({label,value,onChange,disabled,unit,onUnit,units}:{
  label:string;value:string;onChange:(v:string)=>void;disabled?:boolean;
  unit:string;onUnit:(v:string)=>void;units:Array<{label:string}>;
}){
  return(
    <label style={{display:"block",opacity:disabled?.45:1}}>
      <span style={labelStyle}>{label}{disabled&&<span style={{fontSize:11,color:"var(--muted)",marginLeft:6}}>(solved)</span>}</span>
      <span style={{display:"flex",gap:6}}>
        <input className="field-input" type="text" inputMode="decimal" value={value} disabled={disabled}
          onChange={e=>onChange(e.currentTarget.value)}
          onBlur={e=>{const n=parseFloat(e.currentTarget.value);if(Number.isFinite(n))onChange(String(n));}}
          style={{flex:1,minWidth:0,background:disabled?"var(--wash)":"",cursor:disabled?"not-allowed":""}}/>
        <select value={unit} onChange={e=>onUnit(e.currentTarget.value)} style={selStyle}>
          {units.map(u=><option key={u.label} value={u.label}>{u.label}</option>)}
        </select>
      </span>
    </label>
  );
}

export default function SpeedCalculator({calculator}:{calculator:CalculatorDefinition}){
  const [solveFor,setSolveFor]=useState<SolveFor>("speed");
  const [speed,setSpeed]=useState("60");
  const [speedUnit,setSpeedUnit]=useState("km/h");
  const [distance,setDistance]=useState("100");
  const [distUnit,setDistUnit]=useState("km");
  const [time,setTime]=useState("1");
  const [timeUnit,setTimeUnit]=useState("hours");
  const [resultUnit,setResultUnit]=useState("km/h");

  const result=useMemo(()=>{
    const su=SPEED_UNITS.find(u=>u.label===speedUnit)||SPEED_UNITS[1];
    const du=DIST_UNITS.find(u=>u.label===distUnit)||DIST_UNITS[1];
    const tu=TIME_UNITS.find(u=>u.label===timeUnit)||TIME_UNITS[2];
    const ru=SPEED_UNITS.find(u=>u.label===resultUnit)||SPEED_UNITS[1];

    const sMs=(parseFloat(speed)||0)*su.toMs;
    const dM=(parseFloat(distance)||0)*du.toM;
    const tS=(parseFloat(time)||0)*tu.toS;

    if(solveFor==="speed"){
      if(dM<=0||tS<=0)return null;
      const ms=dM/tS;
      return{value:ms/ru.toMs,unit:resultUnit,label:"Speed"};
    }
    if(solveFor==="distance"){
      if(sMs<=0||tS<=0)return null;
      const m=sMs*tS;
      const dru=DIST_UNITS.find(u=>u.label===distUnit)||DIST_UNITS[1];
      return{value:m/dru.toM,unit:distUnit,label:"Distance"};
    }
    // time
    if(sMs<=0||dM<=0)return null;
    const s=dM/sMs;
    const tru=TIME_UNITS.find(u=>u.label===timeUnit)||TIME_UNITS[2];
    return{value:s/tru.toS,unit:timeUnit,label:"Time"};
  },[solveFor,speed,speedUnit,distance,distUnit,time,timeUnit,resultUnit]);

  const tabs:Array<{key:SolveFor;label:string}> = [
    {key:"speed",label:"Find Speed"},
    {key:"distance",label:"Find Distance"},
    {key:"time",label:"Find Time"},
  ];

  return(
    <section className="surface" style={{padding:28}} aria-label="Speed calculator">
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:24}}>
        {tabs.map(t=>(
          <button key={t.key} type="button" onClick={()=>setSolveFor(t.key)}
            style={{padding:"9px 16px",borderRadius:9,border:"1px solid",cursor:"pointer",fontWeight:700,fontSize:13,
              background:solveFor===t.key?"var(--accent)":"white",color:solveFor===t.key?"white":"var(--ink)",
              borderColor:solveFor===t.key?"var(--accent)":"var(--line)"}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,220px),1fr))",gap:18}}>
        <NumInput label="Speed" value={speed} onChange={setSpeed} disabled={solveFor==="speed"}
          unit={solveFor==="speed"?resultUnit:speedUnit}
          onUnit={solveFor==="speed"?setResultUnit:setSpeedUnit}
          units={SPEED_UNITS}/>
        <NumInput label="Distance" value={distance} onChange={setDistance} disabled={solveFor==="distance"}
          unit={distUnit} onUnit={setDistUnit} units={DIST_UNITS}/>
        <NumInput label="Time" value={time} onChange={setTime} disabled={solveFor==="time"}
          unit={timeUnit} onUnit={setTimeUnit} units={TIME_UNITS}/>
      </div>

      {result&&Number.isFinite(result.value)&&result.value>=0&&(
        <div style={{marginTop:24,background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
          <div className="eyebrow" style={{marginBottom:8}}>Result</div>
          <div className="result-value">{parseFloat(result.value.toFixed(6)).toLocaleString("en-IN")} {result.unit}</div>
        </div>
      )}
      <p style={{fontSize:12,lineHeight:1.6,color:"var(--muted)",marginTop:16}}>Speed = Distance ÷ Time</p>
    </section>
  );
}
