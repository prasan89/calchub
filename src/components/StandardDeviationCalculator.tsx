"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";

const labelStyle:React.CSSProperties={display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8};

export default function StandardDeviationCalculator({calculator}:{calculator:CalculatorDefinition}){
  const [type,setType]=useState<"population"|"sample">("population");
  const [input,setInput]=useState("2, 4, 4, 4, 5, 5, 7, 9");

  const result=useMemo(()=>{
    const nums=input.split(/[\s,;]+/).map(Number).filter(n=>Number.isFinite(n));
    if(nums.length<2)return null;
    const n=nums.length;
    const sum=nums.reduce((a,b)=>a+b,0);
    const mean=sum/n;
    const variance=nums.reduce((acc,x)=>acc+(x-mean)**2,0)/(type==="population"?n:n-1);
    const sd=Math.sqrt(variance);
    const sorted=[...nums].sort((a,b)=>a-b);
    const mid=Math.floor(n/2);
    const median=n%2===0?(sorted[mid-1]+sorted[mid])/2:sorted[mid];
    const modeMap:Record<number,number>={};
    nums.forEach(x=>{modeMap[x]=(modeMap[x]||0)+1;});
    const maxFreq=Math.max(...Object.values(modeMap));
    const modeVals=Object.entries(modeMap).filter(([,v])=>v===maxFreq).map(([k])=>Number(k));
    const se=sd/Math.sqrt(n);
    return{n,sum,mean,median,mode:modeVals,variance,sd,se,min:sorted[0],max:sorted[n-1]};
  },[input,type]);

  const nf=(x:number,d=4)=>Number.isFinite(x)?parseFloat(x.toFixed(d)).toLocaleString("en-IN"):"—";

  return(
    <section className="surface" style={{padding:28}} aria-label="Standard deviation calculator">
      <div style={{marginBottom:20}}>
        <div style={labelStyle}>Data type</div>
        <div style={{display:"flex",gap:8}}>
          {(["population","sample"] as const).map(t=>(
            <button key={t} type="button" onClick={()=>setType(t)}
              style={{padding:"8px 16px",borderRadius:8,border:"1px solid",cursor:"pointer",fontWeight:700,fontSize:13,
                background:type===t?"var(--accent)":"white",color:type===t?"white":"var(--ink)",
                borderColor:type===t?"var(--accent)":"var(--line)"}}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <label style={{display:"block",marginBottom:24}}>
        <span style={labelStyle}>Data (comma or space separated)</span>
        <textarea className="field-input" value={input} onChange={e=>setInput(e.currentTarget.value)}
          rows={3} style={{resize:"vertical",fontFamily:"monospace",fontSize:14}}/>
      </label>

      {result&&(
        <div style={{background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
          <div className="eyebrow" style={{marginBottom:16}}>Results ({type})</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,180px),1fr))",gap:16}}>
            {[
              ["Count (n)", result.n],
              ["Sum", result.sum],
              ["Mean", result.mean],
              ["Median", result.median],
              ["Min", result.min],
              ["Max", result.max],
              [type==="population"?"Population SD":"Sample SD", result.sd],
              [type==="population"?"Population Variance":"Sample Variance", result.variance],
              ["Standard Error", result.se],
              ["Mode", result.mode.join(", ")],
            ].map(([label,val])=>(
              <div key={label as string}>
                <div style={{fontSize:12,color:"var(--muted)",fontWeight:650,marginBottom:4}}>{label}</div>
                <div style={{fontWeight:800,fontSize:16}}>{typeof val==="number"?nf(val):val}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {(!result||result.n<2)&&input.trim()&&<p style={{marginTop:16,fontSize:13,color:"#c0392b"}}>Enter at least 2 numbers separated by commas or spaces.</p>}
    </section>
  );
}
