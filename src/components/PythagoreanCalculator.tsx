"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";

type SolveFor="c"|"a"|"b";
const labelStyle:React.CSSProperties={display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8};

function NumInput({label,value,onChange,disabled,sub}:{label:string;value:string;onChange:(v:string)=>void;disabled?:boolean;sub:string}){
  return(
    <label style={{display:"block",opacity:disabled?.45:1}}>
      <span style={labelStyle}>Side {label} {sub&&<sub style={{fontSize:10}}>{sub}</sub>}{disabled&&<span style={{fontSize:11,color:"var(--muted)",marginLeft:6}}>(solved)</span>}</span>
      <input className="field-input" type="text" inputMode="decimal" value={value} disabled={disabled}
        onChange={e=>onChange(e.currentTarget.value)}
        onBlur={e=>{const n=parseFloat(e.currentTarget.value);if(Number.isFinite(n)&&n>0)onChange(String(n));}}
        style={{background:disabled?"var(--wash)":"",cursor:disabled?"not-allowed":""}}/>
    </label>
  );
}

export default function PythagoreanCalculator({calculator}:{calculator:CalculatorDefinition}){
  const [solveFor,setSolveFor]=useState<SolveFor>("c");
  const [a,setA]=useState("3");
  const [b,setB]=useState("4");
  const [c,setC]=useState("5");

  const result=useMemo(()=>{
    if(solveFor==="c"){
      const av=parseFloat(a)||0,bv=parseFloat(b)||0;
      if(av<=0||bv<=0)return null;
      return{value:Math.sqrt(av*av+bv*bv),label:"c (hypotenuse)",formula:`√(${av}² + ${bv}²)`};
    }
    if(solveFor==="a"){
      const bv=parseFloat(b)||0,cv=parseFloat(c)||0;
      if(bv<=0||cv<=0||cv<=bv)return null;
      return{value:Math.sqrt(cv*cv-bv*bv),label:"a",formula:`√(${cv}² − ${bv}²)`};
    }
    const av=parseFloat(a)||0,cv=parseFloat(c)||0;
    if(av<=0||cv<=0||cv<=av)return null;
    return{value:Math.sqrt(cv*cv-av*av),label:"b",formula:`√(${cv}² − ${av}²)`};
  },[solveFor,a,b,c]);

  const tabs:Array<{key:SolveFor;label:string}> = [
    {key:"c",label:"Find Hypotenuse (c)"},
    {key:"a",label:"Find Leg a"},
    {key:"b",label:"Find Leg b"},
  ];

  return(
    <section className="surface" style={{padding:28}} aria-label="Pythagorean theorem calculator">
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

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18,maxWidth:480}}>
        <NumInput label="a" sub="leg" value={a} onChange={setA} disabled={solveFor==="a"}/>
        <NumInput label="b" sub="leg" value={b} onChange={setB} disabled={solveFor==="b"}/>
        <NumInput label="c" sub="hyp" value={c} onChange={setC} disabled={solveFor==="c"}/>
      </div>

      {result&&Number.isFinite(result.value)&&(
        <div style={{marginTop:24,background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
          <div className="eyebrow" style={{marginBottom:8}}>Result</div>
          <div style={{fontSize:13,color:"var(--muted)",marginBottom:6}}>Side {result.label} = {result.formula}</div>
          <div className="result-value">{parseFloat(result.value.toFixed(10)).toLocaleString("en-IN",{maximumFractionDigits:8})}</div>
        </div>
      )}
      {result===null&&<p style={{marginTop:16,fontSize:13,color:"#c0392b"}}>The hypotenuse must be longer than either leg.</p>}
      <p style={{fontSize:12,lineHeight:1.6,color:"var(--muted)",marginTop:16}}>a² + b² = c²</p>
    </section>
  );
}
