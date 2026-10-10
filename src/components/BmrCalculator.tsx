"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";

const ACTIVITIES=[
  {label:"Sedentary (little or no exercise)",mult:1.2},
  {label:"Lightly active (light exercise 1–3 days/week)",mult:1.375},
  {label:"Moderately active (moderate exercise 3–5 days/week)",mult:1.55},
  {label:"Very active (hard exercise 6–7 days/week)",mult:1.725},
  {label:"Extra active (very hard exercise, physical job)",mult:1.9},
];

type Formula="mifflin"|"harris"|"katch";
type Units="metric"|"us";

const labelStyle:React.CSSProperties={display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8};
const selStyle:React.CSSProperties={display:"block",width:"100%",border:"1px solid #cbd8cf",borderRadius:10,padding:"12px 13px",background:"#fff",color:"var(--ink)",outline:"none",fontSize:"inherit",cursor:"pointer"};

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

function calcBMR(formula:Formula,sex:"male"|"female",weightKg:number,heightCm:number,ageYrs:number,bodyFatPct:number):number{
  if(formula==="mifflin"){
    return 10*weightKg+6.25*heightCm-5*ageYrs+(sex==="male"?5:-161);
  }else if(formula==="harris"){
    return sex==="male"
      ?88.362+13.397*weightKg+4.799*heightCm-5.677*ageYrs
      :447.593+9.247*weightKg+3.098*heightCm-4.330*ageYrs;
  }else{
    const lbm=weightKg*(1-bodyFatPct/100);
    return 370+21.6*lbm;
  }
}

export default function BmrCalculator({calculator}:{calculator:CalculatorDefinition}){
  const isTdee=calculator.kind==="tdee";
  const [units,setUnits]=useState<Units>("metric");
  const [formula,setFormula]=useState<Formula>("mifflin");
  const [sex,setSex]=useState<"male"|"female">("male");
  const [age,setAge]=useState("25");
  // metric
  const [heightCm,setHeightCm]=useState("170");
  const [weightKg,setWeightKg]=useState("70");
  // us
  const [heightFt,setHeightFt]=useState("5");
  const [heightIn,setHeightIn]=useState("7");
  const [weightLb,setWeightLb]=useState("154");
  // katch-mcardle
  const [bodyFat,setBodyFat]=useState("20");
  const [activity,setActivity]=useState(2);

  const {wKg,hCm}=useMemo(()=>{
    if(units==="metric")return{wKg:parseFloat(weightKg)||0,hCm:parseFloat(heightCm)||0};
    const ft=parseFloat(heightFt)||0,inch=parseFloat(heightIn)||0;
    return{wKg:(parseFloat(weightLb)||0)*0.453592,hCm:(ft*12+inch)*2.54};
  },[units,weightKg,heightCm,heightFt,heightIn,weightLb]);

  const bmr=useMemo(()=>calcBMR(formula,sex,wKg,hCm,parseFloat(age)||0,parseFloat(bodyFat)||0),[formula,sex,wKg,hCm,age,bodyFat]);

  const n=(x:number)=>Number.isFinite(x)?Math.round(x).toLocaleString("en-IN"):"—";

  const toggleBtn=(active:boolean,onClick:()=>void,label:string)=>(
    <button type="button" onClick={onClick}
      style={{padding:"8px 16px",borderRadius:8,border:"1px solid",cursor:"pointer",fontWeight:700,fontSize:13,
        background:active?"var(--accent)":"white",color:active?"white":"var(--ink)",
        borderColor:active?"var(--accent)":"var(--line)"}}>
      {label}
    </button>
  );

  return(
    <section className="surface" style={{padding:28}} aria-label={isTdee?"TDEE calculator":"BMR calculator"}>
      {/* Units + Sex */}
      <div style={{display:"flex",gap:24,flexWrap:"wrap",marginBottom:20}}>
        <div>
          <div style={labelStyle}>Units</div>
          <div style={{display:"flex",gap:8}}>
            {toggleBtn(units==="metric",()=>setUnits("metric"),"Metric (kg/cm)")}
            {toggleBtn(units==="us",()=>setUnits("us"),"US (lb/ft/in)")}
          </div>
        </div>
        {formula!=="katch"&&(
          <div>
            <div style={labelStyle}>Sex</div>
            <div style={{display:"flex",gap:8}}>
              {toggleBtn(sex==="male",()=>setSex("male"),"Male")}
              {toggleBtn(sex==="female",()=>setSex("female"),"Female")}
            </div>
          </div>
        )}
      </div>

      {/* Inputs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,180px),1fr))",gap:18,marginBottom:18}}>
        {formula!=="katch"&&<NumInput label="Age" value={age} onChange={setAge} suffix="years"/>}
        {units==="metric"?(
          <>
            <NumInput label="Height" value={heightCm} onChange={setHeightCm} suffix="cm"/>
            <NumInput label="Weight" value={weightKg} onChange={setWeightKg} suffix="kg"/>
          </>
        ):(
          <>
            <label style={{display:"block"}}>
              <span style={labelStyle}>Height</span>
              <span style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
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
            <NumInput label="Weight" value={weightLb} onChange={setWeightLb} suffix="lbs"/>
          </>
        )}
        {formula==="katch"&&<NumInput label="Body Fat" value={bodyFat} onChange={setBodyFat} suffix="%"/>}
      </div>

      {/* Formula selector */}
      <label style={{display:"block",marginBottom:18}}>
        <span style={labelStyle}>Formula</span>
        <select value={formula} onChange={e=>setFormula(e.currentTarget.value as Formula)} style={selStyle}>
          <option value="mifflin">Mifflin-St Jeor (recommended)</option>
          <option value="harris">Revised Harris-Benedict</option>
          <option value="katch">Katch-McArdle (requires body fat %)</option>
        </select>
      </label>

      {isTdee&&(
        <label style={{display:"block",marginBottom:18}}>
          <span style={labelStyle}>Activity Level</span>
          <select value={activity} onChange={e=>setActivity(Number(e.currentTarget.value))} style={selStyle}>
            {ACTIVITIES.map((a,i)=><option key={i} value={i}>{a.label}</option>)}
          </select>
        </label>
      )}

      {Number.isFinite(bmr)&&bmr>0&&(
        <div style={{marginTop:8,background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
          <div className="eyebrow" style={{marginBottom:12}}>Results</div>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Basal Metabolic Rate (BMR)</div>
            <div className="result-value">{n(bmr)} kcal/day</div>
          </div>
          <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:12}}>Daily calorie needs by activity level</div>
          <div style={{display:"flex",flexDirection:"column",gap:0,borderRadius:10,overflow:"hidden",border:"1px solid var(--line)"}}>
            {ACTIVITIES.map((a,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",
                background:i===activity&&isTdee?"#e8f5ee":i%2===0?"white":"var(--wash)",
                borderBottom:i<ACTIVITIES.length-1?"1px solid var(--line)":"none",gap:12,flexWrap:"wrap"}}>
                <span style={{fontSize:13,color:"var(--muted)",flex:1}}>{a.label}</span>
                <span style={{fontWeight:800,fontSize:15,whiteSpace:"nowrap"}}>{n(bmr*a.mult)} kcal/day</span>
              </div>
            ))}
          </div>
          <p style={{fontSize:12,lineHeight:1.6,color:"var(--muted)",marginTop:12}}>
            {formula==="mifflin"?"Mifflin–St Jeor":formula==="harris"?"Revised Harris-Benedict":"Katch-McArdle"} equation. Population estimate — individual metabolic rates vary.
          </p>
        </div>
      )}
    </section>
  );
}
