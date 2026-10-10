"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";

type SubMode="whatIsXPctOfY"|"xIsWhatPctOfY"|"xIsYPctOfWhat"|"pctDiff"|"pctChange";

const MODES:Array<{key:SubMode;label:string;inputs:[string,string];question:(a:string,b:string)=>string}> = [
  {key:"whatIsXPctOfY", label:"What is X% of Y?",          inputs:["Percentage (X)","Number (Y)"],        question:(a,b)=>`What is ${a}% of ${b}?`},
  {key:"xIsWhatPctOfY",label:"X is what % of Y?",          inputs:["Value (X)","Total (Y)"],              question:(a,b)=>`${a} is what percent of ${b}?`},
  {key:"xIsYPctOfWhat",label:"X is Y% of what?",           inputs:["Value (X)","Percentage (Y)"],         question:(a,b)=>`${a} is ${b}% of what number?`},
  {key:"pctDiff",       label:"Percentage difference",      inputs:["Value 1","Value 2"],                  question:(a,b)=>`Percentage difference between ${a} and ${b}?`},
  {key:"pctChange",     label:"Percentage change",          inputs:["From value","To value"],              question:(a,b)=>`Percentage change from ${a} to ${b}?`},
];

const n=(x:number,d=4)=>Number.isFinite(x)?parseFloat(x.toFixed(d)).toLocaleString("en-IN"):"—";

export default function PercentageCalculator({calculator}:{calculator:CalculatorDefinition}){
  const [mode,setMode]=useState<SubMode>("whatIsXPctOfY");
  const [a,setA]=useState("15");
  const [b,setB]=useState("250");

  const def=MODES.find(m=>m.key===mode)!;
  const av=parseFloat(a)||0, bv=parseFloat(b)||0;

  const result=useMemo(()=>{
    switch(mode){
      case"whatIsXPctOfY": return{answer:av/100*bv, formula:`${av}% × ${bv} = ${n(av/100*bv)}`};
      case"xIsWhatPctOfY": return bv!==0?{answer:av/bv*100,formula:`(${av} ÷ ${bv}) × 100 = ${n(av/bv*100)}%`}:null;
      case"xIsYPctOfWhat": return bv!==0?{answer:av/(bv/100),formula:`${av} ÷ (${bv}% ÷ 100) = ${n(av/(bv/100))}`}:null;
      case"pctDiff":{const avg=(av+bv)/2;return avg!==0?{answer:Math.abs(av-bv)/avg*100,formula:`|${av} − ${bv}| ÷ ((${av} + ${bv}) ÷ 2) × 100`}:null;}
      case"pctChange": return av!==0?{answer:(bv-av)/Math.abs(av)*100,formula:`((${bv} − ${av}) ÷ |${av}|) × 100`}:null;
    }
  },[mode,av,bv]);

  const isPercent=["xIsWhatPctOfY","pctDiff","pctChange"].includes(mode);
  const labelStyle:React.CSSProperties={display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8};

  return(
    <section className="surface" style={{padding:28}} aria-label="Percentage calculator">
      {/* Mode tabs */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
        {MODES.map(m=>(
          <button key={m.key} type="button" onClick={()=>setMode(m.key)}
            style={{padding:"8px 14px",borderRadius:8,border:"1px solid",cursor:"pointer",fontWeight:700,fontSize:13,
              background:mode===m.key?"var(--accent)":"white",color:mode===m.key?"white":"var(--ink)",
              borderColor:mode===m.key?"var(--accent)":"var(--line)"}}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Question display */}
      <p style={{fontSize:15,fontWeight:600,color:"var(--ink)",marginBottom:20}}>
        {def.question(a||"X",b||"Y")}
      </p>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))",gap:18}}>
        {[0,1].map(idx=>(
          <label key={idx} style={{display:"block"}}>
            <span style={labelStyle}>{def.inputs[idx]}</span>
            <input className="field-input" type="text" inputMode="decimal"
              value={idx===0?a:b}
              onChange={e=>idx===0?setA(e.currentTarget.value):setB(e.currentTarget.value)}
              onBlur={e=>{const v=parseFloat(e.currentTarget.value);if(Number.isFinite(v)){idx===0?setA(String(v)):setB(String(v));}}}/>
          </label>
        ))}
      </div>

      {result&&(
        <div style={{marginTop:24,background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
          <div className="eyebrow" style={{marginBottom:8}}>Answer</div>
          <div className="result-value">{n(result.answer,4)}{isPercent?"%":""}</div>
          <div style={{fontSize:13,color:"var(--muted)",marginTop:10}}>Formula: {result.formula}</div>
        </div>
      )}
      {!result&&<p style={{marginTop:16,fontSize:13,color:"#c0392b"}}>Cannot divide by zero — enter non-zero values.</p>}
    </section>
  );
}
