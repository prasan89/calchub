"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";

const ACTIVITIES=[
  {label:"Sedentary (little or no exercise)",mult:1.2},
  {label:"Lightly active (1–3 days/week)",mult:1.375},
  {label:"Moderately active (3–5 days/week)",mult:1.55},
  {label:"Very active (6–7 days/week)",mult:1.725},
  {label:"Extra active (physical job + daily exercise)",mult:1.9},
];

const GOALS=[
  {label:"Maintain weight",delta:0,color:"#27ae60"},
  {label:"Mild weight loss (0.25 kg/week)",delta:-250,color:"#2980b9"},
  {label:"Weight loss (0.5 kg/week)",delta:-500,color:"#2980b9"},
  {label:"Extreme weight loss (1 kg/week)",delta:-1000,color:"#8e44ad"},
  {label:"Mild weight gain (0.25 kg/week)",delta:+250,color:"#e67e22"},
  {label:"Weight gain (0.5 kg/week)",delta:+500,color:"#e67e22"},
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

function calcBMR(formula:Formula,sex:"male"|"female",wKg:number,hCm:number,ageYrs:number,bodyFatPct:number):number{
  if(formula==="mifflin")return 10*wKg+6.25*hCm-5*ageYrs+(sex==="male"?5:-161);
  if(formula==="harris")return sex==="male"?88.362+13.397*wKg+4.799*hCm-5.677*ageYrs:447.593+9.247*wKg+3.098*hCm-4.330*ageYrs;
  return 370+21.6*wKg*(1-bodyFatPct/100);
}

export default function CalorieCalculator({calculator}:{calculator:CalculatorDefinition}){
  const [units,setUnits]=useState<Units>("metric");
  const [formula,setFormula]=useState<Formula>("mifflin");
  const [sex,setSex]=useState<"male"|"female">("male");
  const [age,setAge]=useState("25");
  const [heightCm,setHeightCm]=useState("170");
  const [weightKg,setWeightKg]=useState("70");
  const [heightFt,setHeightFt]=useState("5");
  const [heightIn,setHeightIn]=useState("7");
  const [weightLb,setWeightLb]=useState("154");
  const [bodyFat,setBodyFat]=useState("20");
  const [activity,setActivity]=useState(2);

  const {wKg,hCm}=useMemo(()=>{
    if(units==="metric")return{wKg:parseFloat(weightKg)||0,hCm:parseFloat(heightCm)||0};
    const ft=parseFloat(heightFt)||0,inch=parseFloat(heightIn)||0;
    return{wKg:(parseFloat(weightLb)||0)*0.453592,hCm:(ft*12+inch)*2.54};
  },[units,weightKg,heightCm,heightFt,heightIn,weightLb]);

  const tdee=useMemo(()=>{
    const bmr=calcBMR(formula,sex,wKg,hCm,parseFloat(age)||0,parseFloat(bodyFat)||0);
    return bmr*ACTIVITIES[activity].mult;
  },[formula,sex,wKg,hCm,age,bodyFat,activity]);

  const n=(x:number)=>Math.max(0,Math.round(x)).toLocaleString("en-IN");

  const toggleBtn=(active:boolean,onClick:()=>void,label:string)=>(
    <button type="button" onClick={onClick}
      style={{padding:"8px 16px",borderRadius:8,border:"1px solid",cursor:"pointer",fontWeight:700,fontSize:13,
        background:active?"var(--accent)":"white",color:active?"white":"var(--ink)",
        borderColor:active?"var(--accent)":"var(--line)"}}>
      {label}
    </button>
  );

  return(
    <section className="surface" style={{padding:28}} aria-label="Calorie calculator">
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

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,280px),1fr))",gap:18,marginBottom:24}}>
        <label>
          <span style={labelStyle}>Formula</span>
          <select value={formula} onChange={e=>setFormula(e.currentTarget.value as Formula)} style={selStyle}>
            <option value="mifflin">Mifflin-St Jeor (recommended)</option>
            <option value="harris">Revised Harris-Benedict</option>
            <option value="katch">Katch-McArdle (requires body fat %)</option>
          </select>
        </label>
        <label>
          <span style={labelStyle}>Activity Level</span>
          <select value={activity} onChange={e=>setActivity(Number(e.currentTarget.value))} style={selStyle}>
            {ACTIVITIES.map((a,i)=><option key={i} value={i}>{a.label}</option>)}
          </select>
        </label>
      </div>

      {Number.isFinite(tdee)&&tdee>0&&(
        <div style={{background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
          <div className="eyebrow" style={{marginBottom:12}}>Daily calorie needs</div>
          <div style={{display:"flex",flexDirection:"column",gap:0,borderRadius:10,overflow:"hidden",border:"1px solid var(--line)"}}>
            {GOALS.map((g,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",
                background:g.delta===0?"#e8f5ee":i%2===0?"white":"var(--wash)",
                borderBottom:i<GOALS.length-1?"1px solid var(--line)":"none",gap:12,flexWrap:"wrap"}}>
                <span style={{fontSize:14,flex:1,fontWeight:g.delta===0?750:400}}>{g.label}</span>
                <span style={{fontWeight:800,fontSize:16,color:g.color,whiteSpace:"nowrap"}}>{n(tdee+g.delta)} kcal/day</span>
              </div>
            ))}
          </div>
          <p style={{fontSize:12,lineHeight:1.6,color:"var(--muted)",marginTop:12}}>
            {formula==="mifflin"?"Mifflin–St Jeor":formula==="harris"?"Revised Harris-Benedict":"Katch-McArdle"} equation estimate. Seek professional guidance for nutrition or medical needs.
          </p>
        </div>
      )}
    </section>
  );
}
