"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";

type Units="metric"|"us";
const labelStyle:React.CSSProperties={display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8};

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

// 4 ideal weight formulas (height in cm, returns kg)
function idealWeights(heightCm:number,sex:"male"|"female"){
  const hIn=heightCm/2.54;
  const over60=hIn-60;
  const robinson=sex==="male"?52+1.9*over60:49+1.7*over60;
  const miller=sex==="male"?56.2+1.41*over60:53.1+1.36*over60;
  const devine=sex==="male"?50+2.3*over60:45.5+2.3*over60;
  const hamwi=sex==="male"?48+2.7*over60:45.4+2.27*over60;
  return{robinson,miller,devine,hamwi};
}

export default function IdealWeightCalculator({calculator}:{calculator:CalculatorDefinition}){
  const [units,setUnits]=useState<Units>("metric");
  const [sex,setSex]=useState<"male"|"female">("male");
  const [heightCm,setHeightCm]=useState("170");
  const [heightFt,setHeightFt]=useState("5");
  const [heightIn,setHeightIn]=useState("7");

  const hCm=useMemo(()=>{
    if(units==="metric")return parseFloat(heightCm)||0;
    return((parseFloat(heightFt)||0)*12+(parseFloat(heightIn)||0))*2.54;
  },[units,heightCm,heightFt,heightIn]);

  const results=useMemo(()=>{
    if(hCm<130)return null;
    const iw=idealWeights(hCm,sex);
    const loW=18.5*(hCm/100)*(hCm/100),hiW=24.9*(hCm/100)*(hCm/100);
    return{...iw,loW,hiW};
  },[hCm,sex]);

  const fmt=(kg:number)=>{
    if(units==="metric")return`${kg.toFixed(1)} kg`;
    const lb=kg*2.20462;
    return`${lb.toFixed(1)} lbs (${kg.toFixed(1)} kg)`;
  };

  const toggleBtn=(active:boolean,onClick:()=>void,label:string)=>(
    <button type="button" onClick={onClick}
      style={{padding:"8px 16px",borderRadius:8,border:"1px solid",cursor:"pointer",fontWeight:700,fontSize:13,
        background:active?"var(--accent)":"white",color:active?"white":"var(--ink)",
        borderColor:active?"var(--accent)":"var(--line)"}}>
      {label}
    </button>
  );

  return(
    <section className="surface" style={{padding:28}} aria-label="Ideal weight calculator">
      <div style={{display:"flex",gap:24,flexWrap:"wrap",marginBottom:20}}>
        <div>
          <div style={labelStyle}>Units</div>
          <div style={{display:"flex",gap:8}}>
            {toggleBtn(units==="metric",()=>setUnits("metric"),"Metric (cm)")}
            {toggleBtn(units==="us",()=>setUnits("us"),"US (ft/in)")}
          </div>
        </div>
        <div>
          <div style={labelStyle}>Sex</div>
          <div style={{display:"flex",gap:8}}>
            {toggleBtn(sex==="male",()=>setSex("male"),"Male")}
            {toggleBtn(sex==="female",()=>setSex("female"),"Female")}
          </div>
        </div>
      </div>

      {units==="metric"?(
        <NumInput label="Height" value={heightCm} onChange={setHeightCm} suffix="cm"/>
      ):(
        <label style={{display:"block"}}>
          <span style={labelStyle}>Height</span>
          <span style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,maxWidth:260}}>
            <span style={{display:"flex",position:"relative",alignItems:"center"}}>
              <input className="field-input" type="text" inputMode="decimal" value={heightFt}
                onChange={e=>setHeightFt(e.currentTarget.value)}
                onBlur={e=>{const n=parseFloat(e.currentTarget.value);if(Number.isFinite(n))setHeightFt(String(n));}}
                style={{paddingRight:32}}/>
              <span aria-hidden style={{position:"absolute",right:10,fontSize:12,color:"var(--muted)",pointerEvents:"none"}}>ft</span>
            </span>
            <span style={{display:"flex",position:"relative",alignItems:"center"}}>
              <input className="field-input" type="text" inputMode="decimal" value={heightIn}
                onChange={e=>setHeightIn(e.currentTarget.value)}
                onBlur={e=>{const n=parseFloat(e.currentTarget.value);if(Number.isFinite(n))setHeightIn(String(n));}}
                style={{paddingRight:28}}/>
              <span aria-hidden style={{position:"absolute",right:10,fontSize:12,color:"var(--muted)",pointerEvents:"none"}}>in</span>
            </span>
          </span>
        </label>
      )}

      {results&&(
        <div style={{marginTop:24,background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
          <div className="eyebrow" style={{marginBottom:12}}>Ideal Weight Estimates</div>
          <div style={{display:"flex",flexDirection:"column",gap:0,borderRadius:10,overflow:"hidden",border:"1px solid var(--line)"}}>
            {[
              ["Robinson (1983)", results.robinson],
              ["Miller (1983)", results.miller],
              ["Devine (1974)", results.devine],
              ["Hamwi (1964)", results.hamwi],
            ].map(([label,val],i)=>(
              <div key={label as string} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",
                background:i%2===0?"white":"var(--wash)",borderBottom:i<3?"1px solid var(--line)":"none",gap:12,flexWrap:"wrap"}}>
                <span style={{fontSize:14,flex:1}}>{label}</span>
                <span style={{fontWeight:800,fontSize:15,whiteSpace:"nowrap"}}>{fmt(val as number)}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:16,padding:"12px 16px",background:"#e8f5ee",borderRadius:10,border:"1px solid #c3e6cb"}}>
            <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:4}}>Healthy BMI Range (18.5–24.9)</div>
            <div style={{fontWeight:800,fontSize:15}}>{fmt(results.loW)} – {fmt(results.hiW)}</div>
          </div>
        </div>
      )}
      <p style={{fontSize:12,lineHeight:1.6,color:"var(--muted)",marginTop:16}}>Ideal weight formulas are population-based estimates. Individual healthy weight depends on body composition, age, and other factors.</p>
    </section>
  );
}
