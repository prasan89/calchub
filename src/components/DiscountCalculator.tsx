"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";import {IN,type Currency} from "@/lib/calculators/engine";

type Mode="percent"|"fixed"|"solve";
const labelStyle:React.CSSProperties={display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8};

function NumInput({label,value,onChange,suffix,prefix,disabled}:{label:string;value:string;onChange:(v:string)=>void;suffix?:string;prefix?:string;disabled?:boolean}){
  return(
    <label style={{display:"block",opacity:disabled?.45:1}}>
      <span style={labelStyle}>{label}{disabled&&<span style={{fontSize:11,color:"var(--muted)",marginLeft:6}}>(solved)</span>}</span>
      <span style={{display:"flex",position:"relative",alignItems:"center"}}>
        {prefix&&<span aria-hidden style={{position:"absolute",left:12,fontSize:13,color:"var(--muted)",pointerEvents:"none",zIndex:1}}>{prefix}</span>}
        <input className="field-input" type="text" inputMode="decimal" value={value} disabled={disabled}
          onChange={e=>onChange(e.currentTarget.value)}
          onBlur={e=>{const n=parseFloat(e.currentTarget.value);if(Number.isFinite(n))onChange(String(n));}}
          style={{paddingLeft:prefix?28:13,paddingRight:suffix?`${suffix.length*8+16}px`:13,
            background:disabled?"var(--wash)":"",cursor:disabled?"not-allowed":""}}/>
        {suffix&&<span aria-hidden style={{position:"absolute",right:12,fontSize:12,color:"var(--muted)",pointerEvents:"none"}}>{suffix}</span>}
      </span>
    </label>
  );
}

export default function DiscountCalculator({calculator,currency=IN}:{calculator:CalculatorDefinition;currency?:Currency}){
  const [mode,setMode]=useState<Mode>("percent");
  // percent mode
  const [origPrice,setOrigPrice]=useState("1000");
  const [discountPct,setDiscountPct]=useState("20");
  // fixed amount mode
  const [origFixed,setOrigFixed]=useState("1000");
  const [discountAmt,setDiscountAmt]=useState("200");
  // solve mode — given final price and discount%, find original
  const [finalPrice,setFinalPrice]=useState("800");
  const [pctForSolve,setPctForSolve]=useState("20");

  const result=useMemo(()=>{
    if(mode==="percent"){
      const p=parseFloat(origPrice)||0,d=parseFloat(discountPct)||0;
      const saved=p*d/100;
      return{original:p,saved,final:p-saved,pct:d};
    }
    if(mode==="fixed"){
      const p=parseFloat(origFixed)||0,d=parseFloat(discountAmt)||0;
      const pct=p>0?d/p*100:0;
      return{original:p,saved:d,final:p-d,pct};
    }
    // solve for original
    const fp=parseFloat(finalPrice)||0,pct=parseFloat(pctForSolve)||0;
    const original=pct<100?fp/(1-pct/100):NaN;
    const saved=original-fp;
    return{original,saved,final:fp,pct};
  },[mode,origPrice,discountPct,origFixed,discountAmt,finalPrice,pctForSolve]);

  const fmt=(x:number)=>Number.isFinite(x)?`${currency.sym}${x.toLocaleString(currency.locale,{maximumFractionDigits:2})}`:"—";
  const n=(x:number)=>Number.isFinite(x)?x.toFixed(2):"—";

  const tabs:Array<{key:Mode;label:string}> = [
    {key:"percent",label:"Percent Off"},
    {key:"fixed",label:"Fixed Amount Off"},
    {key:"solve",label:"Find Original Price"},
  ];

  return(
    <section className="surface" style={{padding:28}} aria-label="Discount calculator">
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

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))",gap:18}}>
        {mode==="percent"&&(
          <>
            <NumInput label="Original Price" value={origPrice} onChange={setOrigPrice} prefix={currency.sym}/>
            <NumInput label="Discount" value={discountPct} onChange={setDiscountPct} suffix="%"/>
          </>
        )}
        {mode==="fixed"&&(
          <>
            <NumInput label="Original Price" value={origFixed} onChange={setOrigFixed} prefix={currency.sym}/>
            <NumInput label="Discount Amount" value={discountAmt} onChange={setDiscountAmt} prefix={currency.sym}/>
          </>
        )}
        {mode==="solve"&&(
          <>
            <NumInput label="Sale Price (Final)" value={finalPrice} onChange={setFinalPrice} prefix={currency.sym}/>
            <NumInput label="Discount Applied" value={pctForSolve} onChange={setPctForSolve} suffix="%"/>
          </>
        )}
      </div>

      {result&&Number.isFinite(result.original)&&result.original>0&&(
        <div style={{marginTop:24,background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
          <div className="eyebrow" style={{marginBottom:16}}>Results</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,160px),1fr))",gap:18}}>
            <div>
              <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Original Price</div>
              <div className="result-value">{fmt(result.original)}</div>
            </div>
            <div>
              <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>You Save</div>
              <div className="result-value" style={{color:"#27ae60"}}>{fmt(result.saved)}</div>
              <div style={{fontSize:13,color:"var(--muted)",marginTop:4}}>({n(result.pct)}% off)</div>
            </div>
            <div>
              <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Sale Price</div>
              <div className="result-value">{fmt(result.final)}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
