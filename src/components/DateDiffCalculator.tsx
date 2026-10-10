"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";

const todayStr=()=>new Date().toISOString().slice(0,10);

function dateDiff(a:Date,b:Date,includeEnd:boolean){
  const [from,to]=a<=b?[a,b]:[b,a];
  let y=to.getFullYear()-from.getFullYear();
  let mo=to.getMonth()-from.getMonth();
  let d=to.getDate()-from.getDate();
  if(d<0){mo--;const prev=new Date(to.getFullYear(),to.getMonth(),0).getDate();d+=prev;}
  if(mo<0){y--;mo+=12;}
  const extra=includeEnd?1:0;
  const ms=to.getTime()-from.getTime()+(includeEnd?86400000:0);
  return{y,mo,d:d+extra,totalDays:Math.round(ms/86400000),totalWeeks:Math.floor(ms/604800000),sign:a<=b?1:-1};
}

function addToDate(base:Date,years:number,months:number,weeks:number,days:number,op:"add"|"sub"):Date{
  const d=new Date(base);
  const sign=op==="add"?1:-1;
  d.setFullYear(d.getFullYear()+sign*years);
  d.setMonth(d.getMonth()+sign*months);
  d.setDate(d.getDate()+sign*(weeks*7+days));
  return d;
}

const labelStyle:React.CSSProperties={display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8};
const selStyle:React.CSSProperties={display:"block",width:"100%",border:"1px solid #cbd8cf",borderRadius:10,padding:"12px 13px",background:"#fff",color:"var(--ink)",outline:"none",fontSize:"inherit",cursor:"pointer"};

function SmallNumInput({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){
  return(
    <label style={{display:"block"}}>
      <span style={labelStyle}>{label}</span>
      <input className="field-input" type="text" inputMode="numeric" value={value}
        onChange={e=>onChange(e.currentTarget.value)}
        onBlur={e=>{const n=parseInt(e.currentTarget.value);onChange(n>=0?String(n):"0");}}/>
    </label>
  );
}

export default function DateDiffCalculator({calculator}:{calculator:CalculatorDefinition}){
  const [mode,setMode]=useState<"diff"|"add">("diff");
  // diff mode
  const [date1,setDate1]=useState(todayStr());
  const [date2,setDate2]=useState(()=>{const d=new Date();d.setDate(d.getDate()+30);return d.toISOString().slice(0,10);});
  const [includeEnd,setIncludeEnd]=useState(false);
  // add mode
  const [baseDate,setBaseDate]=useState(todayStr());
  const [addYears,setAddYears]=useState("0");
  const [addMonths,setAddMonths]=useState("0");
  const [addWeeks,setAddWeeks]=useState("0");
  const [addDays,setAddDays]=useState("30");
  const [addOp,setAddOp]=useState<"add"|"sub">("add");

  const diffResult=useMemo(()=>{
    const a=new Date(date1),b=new Date(date2);
    if(isNaN(a.getTime())||isNaN(b.getTime()))return null;
    return dateDiff(a,b,includeEnd);
  },[date1,date2,includeEnd]);

  const addResult=useMemo(()=>{
    const base=new Date(baseDate);
    if(isNaN(base.getTime()))return null;
    const result=addToDate(base,parseInt(addYears)||0,parseInt(addMonths)||0,parseInt(addWeeks)||0,parseInt(addDays)||0,addOp);
    return{
      date:result.toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),
      diff:dateDiff(base,result,false),
    };
  },[baseDate,addYears,addMonths,addWeeks,addDays,addOp]);

  const tabs=[{key:"diff",label:"Date Difference"},{key:"add",label:"Add / Subtract"}];

  return(
    <section className="surface" style={{padding:28}} aria-label="Date calculator">
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:24}}>
        {tabs.map(t=>(
          <button key={t.key} type="button" onClick={()=>setMode(t.key as "diff"|"add")}
            style={{padding:"10px 18px",borderRadius:10,border:"1px solid",cursor:"pointer",fontWeight:700,fontSize:14,
              background:mode===t.key?"var(--accent)":"white",color:mode===t.key?"white":"var(--ink)",
              borderColor:mode===t.key?"var(--accent)":"var(--line)",transition:"all .15s"}}>
            {t.label}
          </button>
        ))}
      </div>

      {mode==="diff"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,260px),1fr))",gap:18}}>
            <label><span style={labelStyle}>Start Date</span>
              <input className="field-input" type="date" value={date1} onChange={e=>setDate1(e.currentTarget.value)}/></label>
            <label><span style={labelStyle}>End Date</span>
              <input className="field-input" type="date" value={date2} onChange={e=>setDate2(e.currentTarget.value)}/></label>
          </div>
          <label style={{display:"flex",alignItems:"center",gap:8,marginTop:14,cursor:"pointer",userSelect:"none"}}>
            <input type="checkbox" checked={includeEnd} onChange={e=>setIncludeEnd(e.currentTarget.checked)}
              style={{width:16,height:16,accentColor:"var(--accent)",cursor:"pointer"}}/>
            <span style={{fontSize:13,color:"var(--muted)"}}>Include end date in count</span>
          </label>
          {diffResult&&(
            <div style={{marginTop:20,background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
              <div className="eyebrow" style={{marginBottom:12}}>Difference</div>
              <div className="result-value" style={{marginBottom:16}}>
                {diffResult.sign<0&&"−"}{diffResult.y} years, {diffResult.mo} months, {diffResult.d} days
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,140px),1fr))",gap:14}}>
                {[["Total days",diffResult.totalDays],["Total weeks",diffResult.totalWeeks]].map(([l,v])=>(
                  <div key={l as string}>
                    <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:4}}>{l}</div>
                    <div style={{fontSize:18,fontWeight:800}}>{(v as number).toLocaleString("en-IN")}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {mode==="add"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))",gap:18,marginBottom:4}}>
            <label><span style={labelStyle}>Starting Date</span>
              <input className="field-input" type="date" value={baseDate} onChange={e=>setBaseDate(e.currentTarget.value)}/></label>
            <label><span style={labelStyle}>Operation</span>
              <select value={addOp} onChange={e=>setAddOp(e.currentTarget.value as "add"|"sub")} style={selStyle}>
                <option value="add">Add</option>
                <option value="sub">Subtract</option>
              </select>
            </label>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:14}}>
            <SmallNumInput label="Years" value={addYears} onChange={setAddYears}/>
            <SmallNumInput label="Months" value={addMonths} onChange={setAddMonths}/>
            <SmallNumInput label="Weeks" value={addWeeks} onChange={setAddWeeks}/>
            <SmallNumInput label="Days" value={addDays} onChange={setAddDays}/>
          </div>
          {addResult&&(
            <div style={{marginTop:20,background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
              <div className="eyebrow" style={{marginBottom:8}}>Result</div>
              <div className="result-value">{addResult.date}</div>
              <div style={{fontSize:13,color:"var(--muted)",marginTop:10}}>
                {Math.abs(addResult.diff.totalDays).toLocaleString("en-IN")} days {addOp==="add"?"after":"before"} the start date
              </div>
            </div>
          )}
        </>
      )}
      <p style={{fontSize:12,lineHeight:1.6,color:"var(--muted)",marginTop:20}}>Dates are computed in your local timezone.</p>
    </section>
  );
}
