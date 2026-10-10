"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";

const todayStr=()=>new Date().toISOString().slice(0,10);
const labelStyle:React.CSSProperties={display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8};

function NumInput({label,value,onChange,suffix,prefix}:{label:string;value:string;onChange:(v:string)=>void;suffix?:string;prefix?:string}){
  return(
    <label style={{display:"block"}}>
      <span style={labelStyle}>{label}</span>
      <span style={{display:"flex",position:"relative",alignItems:"center"}}>
        {prefix&&<span aria-hidden style={{position:"absolute",left:12,fontSize:13,color:"var(--muted)",pointerEvents:"none",zIndex:1}}>{prefix}</span>}
        <input className="field-input" type="text" inputMode="decimal" value={value}
          onChange={e=>onChange(e.currentTarget.value)}
          onBlur={e=>{const n=parseFloat(e.currentTarget.value);if(Number.isFinite(n))onChange(String(n));}}
          style={{paddingLeft:prefix?28:13,paddingRight:suffix?`${suffix.length*8+16}px`:13}}/>
        {suffix&&<span aria-hidden style={{position:"absolute",right:12,fontSize:12,color:"var(--muted)",pointerEvents:"none"}}>{suffix}</span>}
      </span>
    </label>
  );
}

function PieChart({principal,gain}:{principal:number;gain:number}){
  const total=principal+gain;
  if(total<=0)return null;
  const pct=principal/total;
  const r=70,cx=90,cy=90;
  const sweep=pct*2*Math.PI;
  const x1=cx+r*Math.sin(0),y1=cy-r*Math.cos(0);
  const x2=cx+r*Math.sin(sweep),y2=cy-r*Math.cos(sweep);
  const large=pct>0.5?1:0;
  const fmt=(n:number)=>`₹${n.toLocaleString("en-IN",{maximumFractionDigits:0})}`;
  const pp=Math.round(pct*100),gp=100-pp;
  return(
    <svg width={180} height={180} viewBox="0 0 180 180" aria-hidden>
      {pct>0&&pct<1?(
        <>
          <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`} fill="#27ae60"/>
          <path d={`M${cx},${cy} L${x2},${y2} A${r},${r} 0 ${1-large},1 ${x1},${y1} Z`} fill="#3498db"/>
        </>
      ):(
        <circle cx={cx} cy={cy} r={r} fill={pct===1?"#27ae60":"#3498db"}/>
      )}
      <text x={cx} y={cy-8} textAnchor="middle" fontSize={11} fill="#fff" fontWeight={700}>{fmt(principal)}</text>
      <text x={cx} y={cy+6} textAnchor="middle" fontSize={10} fill="#fff">({pp}%)</text>
      <text x={cx} y={cy+20} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,.8)">Principal</text>
      {gain>0&&(
        <>
          <text x={cx} y={165} textAnchor="middle" fontSize={11} fill="#1a5276" fontWeight={700}>{fmt(gain)}</text>
          <text x={cx} y={177} textAnchor="middle" fontSize={10} fill="#1a5276">Profit ({gp}%)</text>
        </>
      )}
    </svg>
  );
}

export default function RoiCalculator({calculator}:{calculator:CalculatorDefinition}){
  const [useDate,setUseDate]=useState(false);
  const [invested,setInvested]=useState("10000");
  const [returned,setReturned]=useState("15000");
  const [years,setYears]=useState("3");
  const [fromDate,setFromDate]=useState(()=>{const d=new Date();d.setFullYear(d.getFullYear()-3);return d.toISOString().slice(0,10);});
  const [toDate,setToDate]=useState(todayStr());

  const computedYears=useMemo(()=>{
    if(!useDate)return parseFloat(years)||0;
    const a=new Date(fromDate),b=new Date(toDate);
    if(isNaN(a.getTime())||isNaN(b.getTime()))return 0;
    return Math.max(0,(b.getTime()-a.getTime())/(365.25*86400000));
  },[useDate,years,fromDate,toDate]);

  const result=useMemo(()=>{
    const inv=parseFloat(invested)||0,ret=parseFloat(returned)||0;
    if(inv<=0)return null;
    const gain=ret-inv;
    const roi=(gain/inv)*100;
    const annualized=computedYears>0?(Math.pow(ret/inv,1/computedYears)-1)*100:null;
    return{gain,roi,annualized,inv,ret};
  },[invested,returned,computedYears]);

  const f=(n:number)=>n.toLocaleString("en-IN",{maximumFractionDigits:2});

  return(
    <section className="surface" style={{padding:28}} aria-label="ROI calculator">
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,220px),1fr))",gap:18}}>
        <NumInput label="Amount Invested" value={invested} onChange={setInvested} prefix="₹"/>
        <NumInput label="Amount Returned" value={returned} onChange={setReturned} prefix="₹"/>
      </div>

      {/* Investment length */}
      <div style={{marginTop:18}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <span style={labelStyle}>Investment Length</span>
          <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",userSelect:"none"}}>
            <input type="checkbox" checked={useDate} onChange={e=>setUseDate(e.currentTarget.checked)}
              style={{width:14,height:14,accentColor:"var(--accent)",cursor:"pointer"}}/>
            <span style={{fontSize:13,color:"var(--muted)"}}>Use dates</span>
          </label>
        </div>
        {useDate?(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))",gap:18}}>
            <label><span style={labelStyle}>From</span>
              <input className="field-input" type="date" value={fromDate} onChange={e=>setFromDate(e.currentTarget.value)}/></label>
            <label><span style={labelStyle}>To</span>
              <input className="field-input" type="date" value={toDate} onChange={e=>setToDate(e.currentTarget.value)}/></label>
            {computedYears>0&&<div style={{display:"flex",alignItems:"flex-end",paddingBottom:14}}>
              <span style={{fontSize:13,color:"var(--muted)"}}>{computedYears.toFixed(2)} years</span>
            </div>}
          </div>
        ):(
          <NumInput label="" value={years} onChange={setYears} suffix="years"/>
        )}
      </div>

      {result&&(
        <div style={{marginTop:24,background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
          <div className="eyebrow" style={{marginBottom:16}}>Results</div>
          <div style={{display:"flex",gap:28,flexWrap:"wrap",alignItems:"flex-start"}}>
            <PieChart principal={result.inv} gain={Math.max(0,result.gain)}/>
            <div style={{flex:1,minWidth:200,display:"flex",flexDirection:"column",gap:18}}>
              <div>
                <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Investment Gain</div>
                <div className="result-value" style={{color:result.gain>=0?"#27ae60":"#c0392b"}}>
                  {result.gain>=0?"":"−"}₹{f(Math.abs(result.gain))}
                </div>
              </div>
              <div>
                <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>ROI</div>
                <div className="result-value" style={{color:result.roi>=0?"#27ae60":"#c0392b"}}>
                  {result.roi>=0?"":"-"}{Math.abs(result.roi).toFixed(2)}%
                </div>
              </div>
              {result.annualized!==null&&(
                <div>
                  <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Annualized ROI</div>
                  <div className="result-value" style={{color:result.annualized>=0?"#27ae60":"#c0392b"}}>
                    {result.annualized>=0?"":"-"}{Math.abs(result.annualized).toFixed(2)}%
                  </div>
                  <div style={{fontSize:12,color:"var(--muted)",marginTop:4}}>per year over {computedYears.toFixed(2)} years</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <p style={{fontSize:12,lineHeight:1.6,color:"var(--muted)",marginTop:16}}>ROI does not account for taxes, fees, or inflation. Annualized ROI assumes compounding.</p>
    </section>
  );
}
