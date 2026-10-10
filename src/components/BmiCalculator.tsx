"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";

type Units="metric"|"us";
const labelStyle:React.CSSProperties={display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8};

function calcBmi(weightKg:number,heightM:number){
  if(heightM<=0||weightKg<=0)return NaN;
  return weightKg/(heightM*heightM);
}

const BMI_RANGES=[
  {label:"Severe thinness",max:16,color:"#c0392b"},
  {label:"Moderate thinness",max:17,color:"#e67e22"},
  {label:"Mild thinness",max:18.5,color:"#f39c12"},
  {label:"Normal weight",max:25,color:"#27ae60"},
  {label:"Overweight",max:30,color:"#f39c12"},
  {label:"Obese Class I",max:35,color:"#e67e22"},
  {label:"Obese Class II",max:40,color:"#c0392b"},
  {label:"Obese Class III",max:Infinity,color:"#922b21"},
];

function getCategory(bmi:number){return BMI_RANGES.find(r=>bmi<r.max)||BMI_RANGES[BMI_RANGES.length-1];}

function NumInput({label,value,onChange,suffix}:{label:string;value:string;onChange:(v:string)=>void;suffix?:string}){
  return(
    <label style={{display:"block"}}>
      <span style={labelStyle}>{label}</span>
      <span style={{display:"flex",position:"relative",alignItems:"center"}}>
        <input className="field-input" type="text" inputMode="decimal" value={value}
          onChange={e=>onChange(e.currentTarget.value)}
          onBlur={e=>{const n=parseFloat(e.currentTarget.value);if(Number.isFinite(n))onChange(String(n));}}
          style={{paddingRight:suffix?`${suffix.length*8+16}px`:"13px"}}/>
        {suffix&&<span aria-hidden style={{position:"absolute",right:12,fontSize:12,color:"var(--muted)",pointerEvents:"none"}}>{suffix}</span>}
      </span>
    </label>
  );
}

export default function BmiCalculator({calculator}:{calculator:CalculatorDefinition}){
  const [units,setUnits]=useState<Units>("metric");
  const [sex,setSex]=useState<"male"|"female">("male");
  const [age,setAge]=useState("25");
  const [weight,setWeight]=useState("70");
  const [heightCm,setHeightCm]=useState("170");
  const [heightFt,setHeightFt]=useState("5");
  const [heightIn,setHeightIn]=useState("7");
  const [weightLb,setWeightLb]=useState("154");

  const ageVal=parseInt(age)||0;

  const result=useMemo(()=>{
    let w=0,h=0;
    if(units==="metric"){w=parseFloat(weight)||0;h=(parseFloat(heightCm)||0)/100;}
    else{w=(parseFloat(weightLb)||0)*0.453592;const ft=parseFloat(heightFt)||0,inch=parseFloat(heightIn)||0;h=(ft*12+inch)*0.0254;}
    const bmi=calcBmi(w,h);
    if(!Number.isFinite(bmi))return null;
    const cat=getCategory(bmi);
    const loW=18.5*h*h,hiW=24.9*h*h;
    const prime=bmi/25;
    const ponderal=w/(h*h*h);
    return{bmi,cat,loW,hiW,prime,ponderal,h,w};
  },[units,sex,age,weight,heightCm,heightFt,heightIn,weightLb]);

  const n=(x:number,d=1)=>Number.isFinite(x)?x.toFixed(d):"—";

  return(
    <section className="surface" style={{padding:28}} aria-label="BMI calculator">
      {/* Unit + Gender toggles */}
      <div style={{display:"flex",gap:24,flexWrap:"wrap",marginBottom:24}}>
        <div>
          <div style={labelStyle}>Units</div>
          <div style={{display:"flex",gap:8}}>
            {(["metric","us"] as Units[]).map(u=>(
              <button key={u} type="button" onClick={()=>setUnits(u)}
                style={{padding:"8px 16px",borderRadius:8,border:"1px solid",cursor:"pointer",fontWeight:700,fontSize:13,
                  background:units===u?"var(--accent)":"white",color:units===u?"white":"var(--ink)",
                  borderColor:units===u?"var(--accent)":"var(--line)"}}>
                {u==="metric"?"Metric (kg/cm)":"US (lb/ft/in)"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={labelStyle}>Sex</div>
          <div style={{display:"flex",gap:8}}>
            {(["male","female"] as const).map(s=>(
              <button key={s} type="button" onClick={()=>setSex(s)}
                style={{padding:"8px 16px",borderRadius:8,border:"1px solid",cursor:"pointer",fontWeight:700,fontSize:13,
                  background:sex===s?"var(--accent)":"white",color:sex===s?"white":"var(--ink)",
                  borderColor:sex===s?"var(--accent)":"var(--line)"}}>
                {s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))",gap:18}}>
        <NumInput label="Age" value={age} onChange={setAge} suffix="years"/>
        {units==="metric"?(
          <>
            <NumInput label="Height" value={heightCm} onChange={setHeightCm} suffix="cm"/>
            <NumInput label="Weight" value={weight} onChange={setWeight} suffix="kg"/>
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
      </div>

      {result&&(
        <div style={{marginTop:28,background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
          <div className="eyebrow" style={{marginBottom:12}}>Results</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,180px),1fr))",gap:20}}>
            <div>
              <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>BMI</div>
              <div className="result-value" style={{color:result.cat.color}}>{n(result.bmi)}</div>
              <div style={{fontSize:13,fontWeight:700,color:result.cat.color,marginTop:4}}>{result.cat.label}</div>
            </div>
            <div>
              <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Healthy weight range</div>
              <div className="result-value">{n(result.loW)}–{n(result.hiW)} {units==="metric"?"kg":"lbs"}</div>
            </div>
            <div>
              <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>BMI Prime</div>
              <div className="result-value">{n(result.prime,2)}</div>
              <div style={{fontSize:12,color:"var(--muted)",marginTop:4}}>Ratio to upper normal (1.0 = BMI 25)</div>
            </div>
            <div>
              <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Ponderal Index</div>
              <div className="result-value">{n(result.ponderal,1)} kg/m³</div>
            </div>
          </div>
          {/* BMI range bar */}
          <div style={{marginTop:20}}>
            <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:8}}>BMI categories</div>
            <div style={{display:"flex",height:12,borderRadius:6,overflow:"hidden"}}>
              {BMI_RANGES.filter(r=>r.max!==Infinity).map((r,i,arr)=>{
                const prev=i===0?0:arr[i-1].max;
                const w=(r.max-prev)/(40-0)*100;
                return <div key={r.label} style={{width:`${w}%`,background:r.color,flexShrink:0}}/>;
              })}
              <div style={{flex:1,background:"#922b21"}}/>
            </div>
            <div style={{position:"relative",height:20,marginTop:4}}>
              <div style={{position:"absolute",left:`${Math.min(98,Math.max(0,(result.bmi/40)*100))}%`,transform:"translateX(-50%)",width:3,height:20,background:"#13261f",borderRadius:2}}/>
            </div>
          </div>
        </div>
      )}
      <p style={{fontSize:12,lineHeight:1.6,color:"var(--muted)",marginTop:16}}>BMI is a screening tool, not a diagnostic measure. Consult a healthcare professional for health assessments.{ageVal>0&&ageVal<20?" For children and teens under 20, BMI is interpreted using age- and sex-specific percentile charts rather than fixed thresholds.":""}</p>
    </section>
  );
}
