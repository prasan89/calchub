"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";import {IN,type Currency} from "@/lib/calculators/engine";

type SolveFor="interest"|"principal"|"rate"|"time";
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

function PieChart({principal,interest,currency}:{principal:number;interest:number;currency:Currency}){
  const total=principal+interest;
  if(total<=0||interest<0)return null;
  const pct=principal/total;
  if(!Number.isFinite(pct))return null;
  const r=65,cx=80,cy=80;
  const sweep=pct*2*Math.PI;
  const x1=cx+r*Math.sin(0),y1=cy-r*Math.cos(0);
  const x2=cx+r*Math.sin(sweep),y2=cy-r*Math.cos(sweep);
  const large=pct>0.5?1:0;
  const pp=Math.round(pct*100),ip=100-pp;
  const fmt=(x:number)=>`${currency.sym}${x.toLocaleString(currency.locale,{maximumFractionDigits:0})}`;
  return(
    <div style={{display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
      <svg width={160} height={160} viewBox="0 0 160 160" aria-hidden>
        {pct>0&&pct<1?(
          <>
            <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`} fill="#27ae60"/>
            <path d={`M${cx},${cy} L${x2},${y2} A${r},${r} 0 ${1-large},1 ${x1},${y1} Z`} fill="#3498db"/>
          </>
        ):(
          <circle cx={cx} cy={cy} r={r} fill={pct===1?"#27ae60":"#3498db"}/>
        )}
      </svg>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{width:12,height:12,borderRadius:3,background:"#27ae60",flexShrink:0}}/>
          <span style={{fontSize:13,color:"var(--muted)"}}>Principal — {fmt(principal)} ({pp}%)</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{width:12,height:12,borderRadius:3,background:"#3498db",flexShrink:0}}/>
          <span style={{fontSize:13,color:"var(--muted)"}}>Interest — {fmt(interest)} ({ip}%)</span>
        </div>
      </div>
    </div>
  );
}

export default function SimpleInterestCalculator({calculator,currency=IN}:{calculator:CalculatorDefinition;currency?:Currency}){
  const [solveFor,setSolveFor]=useState<SolveFor>("interest");
  const [rateUnit,setRateUnit]=useState<"year"|"month">("year");
  const [principal,setPrincipal]=useState("10000");
  const [rate,setRate]=useState("8");
  const [years,setYears]=useState("3");
  const [targetInterest,setTargetInterest]=useState("2400");

  const annualRate=(v:number)=>rateUnit==="month"?v*12:v;

  const result=useMemo(()=>{
    const p=parseFloat(principal)||0;
    const r=annualRate(parseFloat(rate)||0)/100;
    const t=parseFloat(years)||0;
    const ti=parseFloat(targetInterest)||0;

    if(solveFor==="interest"){
      const I=p*r*t;
      return{solved:I,principal:p,interest:I,time:t,rate:annualRate(parseFloat(rate)||0),label:"Interest"};
    }
    if(solveFor==="principal"){
      const P=r*t>0?ti/(r*t):NaN;
      return{solved:P,principal:P,interest:ti,time:t,rate:annualRate(parseFloat(rate)||0),label:"Principal"};
    }
    if(solveFor==="rate"){
      const R=p*t>0?ti/(p*t)*100:NaN;
      return{solved:R,principal:p,interest:ti,time:t,rate:R,label:"Annual Rate"};
    }
    // time
    const T=p*r>0?ti/(p*r):NaN;
    return{solved:T,principal:p,interest:ti,time:T,rate:annualRate(parseFloat(rate)||0),label:"Time"};
  },[solveFor,rateUnit,principal,rate,years,targetInterest]);

  const fmt=(x:number)=>`${currency.sym}${x.toLocaleString(currency.locale,{maximumFractionDigits:2})}`;
  const n=(x:number,d=2)=>Number.isFinite(x)?x.toFixed(d):"—";

  const tabs:Array<{key:SolveFor;label:string}> = [
    {key:"interest",label:"Find Interest"},
    {key:"principal",label:"Find Principal"},
    {key:"rate",label:"Find Rate"},
    {key:"time",label:"Find Time"},
  ];

  return(
    <section className="surface" style={{padding:28}} aria-label="Simple interest calculator">
      {/* Solve-for tabs */}
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

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))",gap:18}}>
        <NumInput label="Principal" value={principal} onChange={setPrincipal} prefix={currency.sym}
          disabled={solveFor==="principal"}/>

        {/* Rate field + per-month toggle */}
        <label style={{display:"block",opacity:solveFor==="rate"?.45:1}}>
          <span style={labelStyle}>Interest Rate{solveFor==="rate"&&<span style={{fontSize:11,color:"var(--muted)",marginLeft:6}}>(solved)</span>}</span>
          <span style={{display:"flex",gap:8,alignItems:"stretch"}}>
            <span style={{display:"flex",position:"relative",alignItems:"center",flex:1}}>
              <input className="field-input" type="text" inputMode="decimal" value={rate} disabled={solveFor==="rate"}
                onChange={e=>setRate(e.currentTarget.value)}
                onBlur={e=>{const v=parseFloat(e.currentTarget.value);if(Number.isFinite(v))setRate(String(v));}}
                style={{paddingRight:30,background:solveFor==="rate"?"var(--wash)":"",cursor:solveFor==="rate"?"not-allowed":""}}/>
              <span aria-hidden style={{position:"absolute",right:10,fontSize:12,color:"var(--muted)",pointerEvents:"none"}}>%</span>
            </span>
            <select value={rateUnit} onChange={e=>setRateUnit(e.currentTarget.value as "year"|"month")}
              style={{border:"1px solid #cbd8cf",borderRadius:10,padding:"0 10px",background:"#fff",fontSize:13,cursor:"pointer"}}>
              <option value="year">/ year</option>
              <option value="month">/ month</option>
            </select>
          </span>
        </label>

        <NumInput label="Time" value={years} onChange={setYears} suffix="years"
          disabled={solveFor==="time"}/>
        <NumInput label="Interest Amount" value={targetInterest} onChange={setTargetInterest} prefix={currency.sym}
          disabled={solveFor==="interest"}/>
      </div>

      {result&&Number.isFinite(result.solved)&&result.solved>=0&&(
        <div style={{marginTop:24,background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
          <div className="eyebrow" style={{marginBottom:16}}>Results</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,160px),1fr))",gap:18,marginBottom:20}}>
            <div>
              <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Interest</div>
              <div className="result-value">{fmt(result.interest)}</div>
            </div>
            <div>
              <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Total Amount</div>
              <div className="result-value">{fmt(result.principal+result.interest)}</div>
            </div>
            {solveFor!=="principal"&&<div>
              <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Principal</div>
              <div className="result-value">{fmt(result.principal)}</div>
            </div>}
            {solveFor==="rate"&&<div>
              <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Annual Rate</div>
              <div className="result-value">{n(result.rate)}%</div>
            </div>}
            {solveFor==="time"&&<div>
              <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Time</div>
              <div className="result-value">{n(result.time)} years</div>
            </div>}
          </div>
          <PieChart principal={result.principal} interest={result.interest} currency={currency}/>
          {/* Year-by-year table */}
          {solveFor==="interest"&&result.time>0&&result.time<=30&&(
            <div style={{marginTop:20}}>
              <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:10}}>Year-by-year breakdown</div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead>
                    <tr style={{background:"var(--wash)"}}>
                      {["Year","Principal","Interest","Total Balance"].map(h=>(
                        <th key={h} style={{textAlign:"right",padding:"8px 12px",borderBottom:"1px solid var(--line)",fontWeight:700,color:"var(--muted)"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({length:Math.round(result.time)},(_,i)=>{
                      const yr=i+1;
                      const intSoFar=result.principal*(annualRate(parseFloat(rate)||0)/100)*yr;
                      return(
                        <tr key={yr} style={{borderBottom:"1px solid var(--line)",background:yr%2===0?"white":"var(--wash)"}}>
                          <td style={{textAlign:"right",padding:"8px 12px"}}>{yr}</td>
                          <td style={{textAlign:"right",padding:"8px 12px"}}>{fmt(result.principal)}</td>
                          <td style={{textAlign:"right",padding:"8px 12px"}}>{fmt(intSoFar)}</td>
                          <td style={{textAlign:"right",padding:"8px 12px",fontWeight:700}}>{fmt(result.principal+intSoFar)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      <p style={{fontSize:12,lineHeight:1.6,color:"var(--muted)",marginTop:16}}>Simple interest does not compound. I = P × r × t</p>
    </section>
  );
}
