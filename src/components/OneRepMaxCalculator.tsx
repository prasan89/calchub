"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";

const labelStyle:React.CSSProperties={display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8};
const selStyle:React.CSSProperties={display:"block",width:"100%",border:"1px solid #cbd8cf",borderRadius:10,padding:"12px 13px",background:"#fff",color:"var(--ink)",outline:"none",fontSize:"inherit",cursor:"pointer"};

function NumInput({label,value,onChange,suffix}:{label:string;value:string;onChange:(v:string)=>void;suffix:string}){
  return(
    <label style={{display:"block"}}>
      <span style={labelStyle}>{label}</span>
      <span style={{display:"flex",position:"relative",alignItems:"center"}}>
        <input className="field-input" type="text" inputMode="decimal" value={value}
          onChange={e=>onChange(e.currentTarget.value)}
          onBlur={e=>{const n=parseFloat(e.currentTarget.value);if(Number.isFinite(n))onChange(String(n));}}
          style={{paddingRight:`${suffix.length*8+16}px`}}/>
        <span aria-hidden style={{position:"absolute",right:12,fontSize:12,color:"var(--muted)",pointerEvents:"none"}}>{suffix}</span>
      </span>
    </label>
  );
}

const FORMULAS=[
  {key:"epley",label:"Epley",fn:(w:number,r:number)=>w*(1+r/30)},
  {key:"brzycki",label:"Brzycki",fn:(w:number,r:number)=>w*(36/(37-r))},
  {key:"lombardi",label:"Lombardi",fn:(w:number,r:number)=>w*Math.pow(r,0.1)},
  {key:"mayhew",label:"Mayhew et al.",fn:(w:number,r:number)=>100*w/(52.2+41.9*Math.exp(-0.055*r))},
  {key:"oconnor",label:"O'Conner et al.",fn:(w:number,r:number)=>w*(1+r/40)},
  {key:"wathan",label:"Wathan",fn:(w:number,r:number)=>100*w/(48.8+53.8*Math.exp(-0.075*r))},
];

const PCT_ROWS=[100,95,90,85,80,75,70,65,60,55,50];

export default function OneRepMaxCalculator({calculator}:{calculator:CalculatorDefinition}){
  const [weightUnit,setWeightUnit]=useState<"kg"|"lb">("kg");
  const [weight,setWeight]=useState("100");
  const [reps,setReps]=useState("5");
  const [formula,setFormula]=useState("epley");

  const result=useMemo(()=>{
    const w=parseFloat(weight)||0,r=parseInt(reps)||0;
    if(w<=0||r<=0||r>36)return null;
    const wKg=weightUnit==="lb"?w*0.453592:w;
    const fn=FORMULAS.find(f=>f.key===formula)?.fn||FORMULAS[0].fn;
    const orm=fn(wKg,r);
    return{orm,wKg};
  },[weight,reps,formula,weightUnit]);

  const fmtW=(kg:number)=>weightUnit==="lb"?`${(kg*2.20462).toFixed(1)} lb`:`${kg.toFixed(1)} kg`;

  const toggleBtn=(active:boolean,onClick:()=>void,label:string)=>(
    <button type="button" onClick={onClick}
      style={{padding:"7px 14px",borderRadius:8,border:"1px solid",cursor:"pointer",fontWeight:700,fontSize:13,
        background:active?"var(--accent)":"white",color:active?"white":"var(--ink)",
        borderColor:active?"var(--accent)":"var(--line)"}}>
      {label}
    </button>
  );

  return(
    <section className="surface" style={{padding:28}} aria-label="One rep max calculator">
      <div style={{marginBottom:18}}>
        <div style={labelStyle}>Weight Unit</div>
        <div style={{display:"flex",gap:8}}>
          {toggleBtn(weightUnit==="kg",()=>setWeightUnit("kg"),"kg")}
          {toggleBtn(weightUnit==="lb",()=>setWeightUnit("lb"),"lb")}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,180px),1fr))",gap:18,marginBottom:18}}>
        <NumInput label="Weight Lifted" value={weight} onChange={setWeight} suffix={weightUnit}/>
        <NumInput label="Repetitions" value={reps} onChange={setReps} suffix="reps"/>
      </div>

      <label style={{display:"block",marginBottom:24}}>
        <span style={labelStyle}>Formula</span>
        <select value={formula} onChange={e=>setFormula(e.currentTarget.value)} style={selStyle}>
          {FORMULAS.map(f=><option key={f.key} value={f.key}>{f.label}</option>)}
        </select>
      </label>

      {result&&(
        <div style={{background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
          <div className="eyebrow" style={{marginBottom:12}}>Estimated 1RM</div>
          <div className="result-value" style={{marginBottom:20}}>{fmtW(result.orm)}</div>
          <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:10}}>% of 1RM training weights</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr>
                  {["% of 1RM","Weight","Reps in zone"].map(h=>(
                    <th key={h} style={{textAlign:"right",padding:"8px 12px",borderBottom:"1px solid var(--line)",fontWeight:700,color:"var(--muted)"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PCT_ROWS.map((pct,i)=>(
                  <tr key={pct} style={{borderBottom:"1px solid var(--line)",background:i%2===0?"white":"var(--wash)"}}>
                    <td style={{textAlign:"right",padding:"8px 12px",fontWeight:700}}>{pct}%</td>
                    <td style={{textAlign:"right",padding:"8px 12px"}}>{fmtW(result.orm*pct/100)}</td>
                    <td style={{textAlign:"right",padding:"8px 12px",color:"var(--muted)"}}>{pct===100?"1":pct>=90?"1–2":pct>=85?"2–3":pct>=80?"3–4":pct>=75?"5–6":pct>=70?"6–8":pct>=65?"9–12":pct>=60?"12–15":"15–20+"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{fontSize:12,lineHeight:1.6,color:"var(--muted)",marginTop:12}}>Estimates only. Attempting true 1RM without a spotter is not recommended.</p>
        </div>
      )}
    </section>
  );
}
