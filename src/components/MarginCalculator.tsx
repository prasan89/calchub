"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";import {IN,type Currency} from "@/lib/calculators/engine";

type SolveFor="margin"|"revenue"|"cost"|"profit";
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

function PieChart({cost,profit,currency}:{cost:number;profit:number;currency:Currency}){
  const total=cost+profit;
  if(total<=0||profit<0)return null;
  const pct=cost/total;
  if(!Number.isFinite(pct))return null;
  const r=65,cx=80,cy=80;
  const sweep=pct*2*Math.PI;
  const x1=cx+r*Math.sin(0),y1=cy-r*Math.cos(0);
  const x2=cx+r*Math.sin(sweep),y2=cy-r*Math.cos(sweep);
  const large=pct>0.5?1:0;
  const cp=Math.round(pct*100),pp=100-cp;
  const fmt=(x:number)=>`${currency.sym}${x.toLocaleString(currency.locale,{maximumFractionDigits:0})}`;
  return(
    <div style={{display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
      <svg width={160} height={160} viewBox="0 0 160 160" aria-hidden>
        {pct>0&&pct<1?(
          <>
            <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`} fill="#e67e22"/>
            <path d={`M${cx},${cy} L${x2},${y2} A${r},${r} 0 ${1-large},1 ${x1},${y1} Z`} fill="#27ae60"/>
          </>
        ):(
          <circle cx={cx} cy={cy} r={r} fill={pct===1?"#e67e22":"#27ae60"}/>
        )}
      </svg>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{width:12,height:12,borderRadius:3,background:"#e67e22",flexShrink:0}}/>
          <span style={{fontSize:13,color:"var(--muted)"}}>Cost — {fmt(cost)} ({cp}%)</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{width:12,height:12,borderRadius:3,background:"#27ae60",flexShrink:0}}/>
          <span style={{fontSize:13,color:"var(--muted)"}}>Profit — {fmt(profit)} ({pp}%)</span>
        </div>
      </div>
    </div>
  );
}

export default function MarginCalculator({calculator,currency=IN}:{calculator:CalculatorDefinition;currency?:Currency}){
  const [solveFor,setSolveFor]=useState<SolveFor>("margin");
  const [cost,setCost]=useState("500");
  const [revenue,setRevenue]=useState("800");
  const [marginPct,setMarginPct]=useState("37.5");
  const [profit,setProfit]=useState("300");

  const result=useMemo(()=>{
    const c=parseFloat(cost)||0,rev=parseFloat(revenue)||0;
    const m=parseFloat(marginPct)||0,prof=parseFloat(profit)||0;
    if(solveFor==="margin"){
      const p=rev-c,gm=rev>0?p/rev*100:0,markup=c>0?p/c*100:0;
      return{cost:c,revenue:rev,profit:p,margin:gm,markup};
    }
    if(solveFor==="revenue"){
      const rev2=m<100?c/(1-m/100):NaN;
      const p=rev2-c,markup=c>0?p/c*100:0;
      return{cost:c,revenue:rev2,profit:p,margin:m,markup};
    }
    if(solveFor==="cost"){
      const c2=rev*(1-m/100);
      const p=rev-c2,markup=c2>0?p/c2*100:0;
      return{cost:c2,revenue:rev,profit:p,margin:m,markup};
    }
    // solve profit → revenue
    const rev2=c+prof;
    const gm=rev2>0?prof/rev2*100:0,markup=c>0?prof/c*100:0;
    return{cost:c,revenue:rev2,profit:prof,margin:gm,markup};
  },[solveFor,cost,revenue,marginPct,profit]);

  const fmt=(x:number)=>Number.isFinite(x)?`${currency.sym}${x.toLocaleString(currency.locale,{maximumFractionDigits:2})}`:"—";
  const n=(x:number,d=2)=>Number.isFinite(x)?x.toFixed(d):"—";

  const tabs:Array<{key:SolveFor;label:string}> = [
    {key:"margin",label:"Find Margin"},
    {key:"revenue",label:"Find Revenue"},
    {key:"cost",label:"Find Cost"},
    {key:"profit",label:"Find Profit"},
  ];

  return(
    <section className="surface" style={{padding:28}} aria-label="Profit margin calculator">
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
        <NumInput label="Cost" value={cost} onChange={setCost} prefix={currency.sym}
          disabled={solveFor==="cost"}/>
        <NumInput label="Revenue (Selling Price)" value={revenue} onChange={setRevenue} prefix={currency.sym}
          disabled={solveFor==="revenue"||solveFor==="profit"}/>
        <NumInput label="Gross Margin %" value={marginPct} onChange={setMarginPct} suffix="%"
          disabled={solveFor==="margin"||solveFor==="profit"}/>
        <NumInput label="Profit" value={profit} onChange={setProfit} prefix={currency.sym}
          disabled={solveFor!=="profit"}/>
      </div>

      {result&&Number.isFinite(result.revenue)&&result.revenue>0&&(
        <div style={{marginTop:24,background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
          <div className="eyebrow" style={{marginBottom:16}}>Results</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,160px),1fr))",gap:18,marginBottom:20}}>
            <div>
              <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Gross Profit</div>
              <div className="result-value" style={{color:"#27ae60"}}>{fmt(result.profit)}</div>
            </div>
            <div>
              <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Gross Margin</div>
              <div className="result-value">{n(result.margin)}%</div>
              <div style={{fontSize:12,color:"var(--muted)",marginTop:4}}>Profit ÷ Revenue</div>
            </div>
            <div>
              <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Markup</div>
              <div className="result-value">{n(result.markup)}%</div>
              <div style={{fontSize:12,color:"var(--muted)",marginTop:4}}>Profit ÷ Cost</div>
            </div>
            <div>
              <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Revenue</div>
              <div className="result-value">{fmt(result.revenue)}</div>
            </div>
          </div>
          <PieChart cost={result.cost} profit={result.profit} currency={currency}/>
        </div>
      )}
      <p style={{fontSize:12,lineHeight:1.6,color:"var(--muted)",marginTop:16}}>Gross margin = Profit ÷ Revenue × 100. Markup = Profit ÷ Cost × 100.</p>
    </section>
  );
}
