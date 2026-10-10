"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";

const today=()=>new Date().toISOString().slice(0,10);

function diff(from:Date,to:Date){
  let y=to.getFullYear()-from.getFullYear();
  let mo=to.getMonth()-from.getMonth();
  let d=to.getDate()-from.getDate();
  if(d<0){mo--;const prev=new Date(to.getFullYear(),to.getMonth(),0).getDate();d+=prev;}
  if(mo<0){y--;mo+=12;}
  const msTotal=to.getTime()-from.getTime();
  const totalDays=Math.floor(msTotal/86400000);
  const totalWeeks=Math.floor(totalDays/7);
  const totalHours=Math.floor(msTotal/3600000);
  const totalMins=Math.floor(msTotal/60000);
  const totalSecs=Math.floor(msTotal/1000);
  return{y,mo,d,totalDays,totalWeeks,totalHours,totalMins,totalSecs};
}

const label=(s:React.CSSProperties)=>({display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8,...s} as React.CSSProperties);

export default function AgeCalculator({calculator}:{calculator:CalculatorDefinition}){
  const [dob,setDob]=useState("1990-01-01");
  const [atDate,setAtDate]=useState(today());

  const result=useMemo(()=>{
    const from=new Date(dob);
    const to=new Date(atDate);
    if(isNaN(from.getTime())||isNaN(to.getTime())||from>to)return null;
    return diff(from,to);
  },[dob,atDate]);

  return(
    <section className="surface" style={{padding:28}} aria-label="Age calculator">
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,260px),1fr))",gap:18}}>
        <label>
          <span style={label({})}>Date of Birth</span>
          <input className="field-input" type="date" value={dob} max={atDate}
            onChange={e=>setDob(e.currentTarget.value)}/>
        </label>
        <label>
          <span style={label({})}>Age at the Date of</span>
          <input className="field-input" type="date" value={atDate} min={dob}
            onChange={e=>setAtDate(e.currentTarget.value)}/>
        </label>
      </div>

      {result&&(
        <div style={{marginTop:28,background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
          <div className="eyebrow" style={{marginBottom:16}}>Age</div>
          <div style={{marginBottom:20}}>
            <div className="result-value">{result.y} years, {result.mo} months, {result.d} days</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,160px),1fr))",gap:16}}>
            {[
              ["Total months", result.y*12+result.mo],
              ["Total weeks", result.totalWeeks.toLocaleString("en-IN")],
              ["Total days", result.totalDays.toLocaleString("en-IN")],
              ["Total hours", result.totalHours.toLocaleString("en-IN")],
              ["Total minutes", result.totalMins.toLocaleString("en-IN")],
              ["Total seconds", result.totalSecs.toLocaleString("en-IN")],
            ].map(([l,v])=>(
              <div key={l as string}>
                <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:4}}>{l}</div>
                <div style={{fontSize:18,fontWeight:800}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!result&&dob&&atDate&&new Date(dob)>new Date(atDate)&&(
        <p style={{marginTop:16,color:"#c0392b",fontSize:13}}>Date of birth must be before the target date.</p>
      )}
      <p style={{fontSize:12,lineHeight:1.6,color:"var(--muted)",marginTop:20}}>Age calculation is based on calendar dates. Exact times of day are not considered.</p>
    </section>
  );
}
