"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";

type AgeGroup="below60"|"60to80"|"above80";
type TaxYear="2025-26"|"2024-25";
type Regime="new"|"old";

const labelStyle:React.CSSProperties={display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:6};
const sectionHead:React.CSSProperties={background:"#2c5f40",color:"#fff",padding:"10px 16px",fontWeight:700,fontSize:14,borderRadius:"8px 8px 0 0",marginTop:20,marginBottom:0};
const tableRow:React.CSSProperties={display:"grid",gridTemplateColumns:"1fr 180px",gap:16,alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--line)"};

function MoneyInput({label,value,onChange,hint}:{label:string;value:string;onChange:(v:string)=>void;hint?:string}){
  return(
    <div style={tableRow}>
      <div>
        <span style={{...labelStyle,marginBottom:0}}>{label}</span>
        {hint&&<span style={{fontSize:11,color:"var(--muted)"}}>{hint}</span>}
      </div>
      <span style={{position:"relative",display:"flex",alignItems:"center"}}>
        <span aria-hidden style={{position:"absolute",left:11,fontSize:13,color:"var(--muted)",pointerEvents:"none"}}>₹</span>
        <input className="field-input" type="text" inputMode="decimal" value={value}
          onChange={e=>onChange(e.currentTarget.value)}
          onBlur={e=>{const n=parseFloat(e.currentTarget.value.replace(/,/g,""));onChange(Number.isFinite(n)?String(n):"0");}}
          style={{paddingLeft:22,textAlign:"right"}}/>
      </span>
    </div>
  );
}

function fmt(x:number){return"₹"+x.toLocaleString("en-IN",{maximumFractionDigits:0});}
function pct(x:number){return x.toFixed(1)+"%";}

// ── New Regime 2025-26 slabs (post-Budget 2025, effective AY 2026-27)
// Rebate u/s 87A: tax = 0 if income ≤ 12,00,000
const NEW_SLABS_25:[number,number,number][]=[
  [0,400000,0],
  [400000,800000,0.05],
  [800000,1200000,0.10],
  [1200000,1600000,0.15],
  [1600000,2000000,0.20],
  [2000000,2400000,0.25],
  [2400000,Infinity,0.30],
];

// ── New Regime 2024-25 slabs
const NEW_SLABS_24:[number,number,number][]=[
  [0,300000,0],
  [300000,700000,0.05],
  [700000,1000000,0.10],
  [1000000,1200000,0.15],
  [1200000,1500000,0.20],
  [1500000,Infinity,0.30],
];

// ── Old Regime slabs (age-based)
function getOldSlabs(age:AgeGroup):[number,number,number][]{
  const basic:number=age==="below60"?250000:age==="60to80"?300000:500000;
  return[
    [0,basic,0],
    [basic,500000,0.05],
    [500000,1000000,0.20],
    [1000000,Infinity,0.30],
  ];
}

function computeTax(income:number,slabs:[number,number,number][]):number{
  let tax=0,remaining=income;
  for(const [lo,hi,rate] of slabs){
    if(remaining<=0)break;
    const band=Math.min(remaining,hi===Infinity?remaining:hi-lo);
    if(band>0)tax+=band*rate;
    remaining-=band;
  }
  return tax;
}

function surcharge(tax:number,income:number,regime:Regime):number{
  // Marginal relief applies but simplified here
  if(income<=5000000)return 0;
  const rate=income<=10000000?0.10:income<=20000000?0.15:regime==="old"&&income<=50000000?0.25:0.37;
  return tax*rate;
}

interface TaxResult{
  grossIncome:number;
  totalDeductions:number;
  taxableIncome:number;
  basicTax:number;
  rebate87A:number;
  taxAfterRebate:number;
  surchargeAmt:number;
  cess:number;
  totalTax:number;
  effectiveRate:number;
  slabBreakdown:Array<{label:string;income:number;rate:number;tax:number}>;
}

export default function IncomeTaxCalculator({calculator}:{calculator:CalculatorDefinition}){
  const [regime,setRegime]=useState<Regime>("new");
  const [taxYear,setTaxYear]=useState<TaxYear>("2025-26");
  const [age,setAge]=useState<AgeGroup>("below60");

  // Income fields
  const [salary,setSalary]=useState("800000");
  const [business,setBusiness]=useState("0");
  const [stcg,setStcg]=useState("0");       // short-term capital gains (taxed at 20% slab)
  const [ltcg,setLtcg]=useState("0");       // long-term capital gains >1L taxed at 12.5%
  const [otherIncome,setOtherIncome]=useState("0");
  const [exemptIncome,setExemptIncome]=useState("0"); // agriculture, PPF interest etc.

  // Old-regime deductions
  const [std80C,setStd80C]=useState("150000");
  const [nps80CCD,setNps80CCD]=useState("0");     // 80CCD(1B) extra ₹50k
  const [hra,setHra]=useState("0");
  const [homeLoan,setHomeLoan]=useState("0");     // 24(b) interest on self-occupied
  const [med80D,setMed80D]=useState("0");
  const [educationLoan,setEducationLoan]=useState("0"); // 80E
  const [otherDeductions,setOtherDeductions]=useState("0");

  const result=useMemo<TaxResult>(()=>{
    const parse=(s:string)=>Math.max(0,parseFloat(s)||0);
    const sal=parse(salary),biz=parse(business),st=parse(stcg),lt=parse(ltcg);
    const other=parse(otherIncome);

    // Standard deduction: ₹75,000 in new regime; ₹50,000 in old regime (for salaried)
    const stdDed=sal>0?(regime==="new"?75000:50000):0;

    const grossIncome=sal+biz+st+lt+other;

    // Deductions (only in old regime for income other than LTCG/STCG at special rates)
    let totalDeductions=stdDed;
    if(regime==="old"){
      const c=Math.min(parse(std80C),150000);
      const nps=Math.min(parse(nps80CCD),50000);
      const hraAmt=parse(hra);
      const hl=Math.min(parse(homeLoan),200000);
      const med=parse(med80D);
      const edu=parse(educationLoan);
      const od=parse(otherDeductions);
      totalDeductions=stdDed+c+nps+hraAmt+hl+med+edu+od;
    }

    // LTCG taxed separately at 12.5% above ₹1,25,000 exempt
    const ltcgExempt=Math.min(lt,125000);
    const ltcgTaxable=Math.max(0,lt-ltcgExempt);
    const ltcgTax=ltcgTaxable*0.125;

    // STCG on equity taxed at 20% (Section 111A) — rest at slab
    const stcgEquityTax=st*0.20;

    // Normal income (excluding special-rate CG)
    const normalIncome=sal+biz+other;
    const taxableNormal=Math.max(0,normalIncome-totalDeductions);
    const taxableIncome=Math.max(0,taxableNormal+ltcgTaxable+st);

    const slabs=regime==="new"
      ?(taxYear==="2025-26"?NEW_SLABS_25:NEW_SLABS_24)
      :getOldSlabs(age);

    const basicTaxOnNormal=computeTax(taxableNormal,slabs);
    const basicTax=basicTaxOnNormal+ltcgTax+stcgEquityTax;

    // Rebate u/s 87A
    let rebate87A=0;
    if(regime==="new"&&taxYear==="2025-26"&&taxableIncome<=1200000){
      rebate87A=Math.min(basicTax-ltcgTax-stcgEquityTax,25000); // rebate on normal income tax only
    }else if(regime==="old"&&taxableIncome<=500000){
      rebate87A=Math.min(basicTax,12500);
    }else if(regime==="new"&&taxYear==="2024-25"&&taxableIncome<=700000){
      rebate87A=Math.min(basicTax,25000);
    }

    const taxAfterRebate=Math.max(0,basicTax-rebate87A);
    const surchargeAmt=surcharge(taxAfterRebate,taxableIncome,regime);
    const cess=(taxAfterRebate+surchargeAmt)*0.04;
    const totalTax=taxAfterRebate+surchargeAmt+cess;
    const effectiveRate=grossIncome>0?totalTax/grossIncome*100:0;

    // Slab breakdown for normal income
    const slabBreakdown=slabs.map(([lo,hi,rate])=>{
      const incInBand=Math.max(0,Math.min(taxableNormal,hi===Infinity?taxableNormal:hi)-lo);
      return{label:hi===Infinity?`Above ${fmt(lo)}`:rate===0?`Up to ${fmt(hi)}`:`${fmt(lo)} – ${fmt(hi)}`,income:incInBand,rate:rate*100,tax:incInBand*rate};
    }).filter(r=>r.income>0||r.rate===0);

    return{grossIncome,totalDeductions,taxableIncome,basicTax,rebate87A,taxAfterRebate,surchargeAmt,cess,totalTax,effectiveRate,slabBreakdown};
  },[regime,taxYear,age,salary,business,stcg,ltcg,otherIncome,std80C,nps80CCD,hra,homeLoan,med80D,educationLoan,otherDeductions]);

  const btnStyle=(active:boolean):React.CSSProperties=>({
    padding:"9px 18px",borderRadius:9,border:"1px solid",cursor:"pointer",fontWeight:700,fontSize:13,
    background:active?"var(--accent)":"white",color:active?"white":"var(--ink)",
    borderColor:active?"var(--accent)":"var(--line)"
  });

  return(
    <section className="surface" style={{padding:28}} aria-label="Income tax calculator">

      {/* Regime + year toggles */}
      <div style={{display:"flex",gap:20,flexWrap:"wrap",marginBottom:20,alignItems:"flex-start"}}>
        <div>
          <div style={{...labelStyle,marginBottom:8}}>Tax Regime</div>
          <div style={{display:"flex",gap:8}}>
            <button type="button" style={btnStyle(regime==="new")} onClick={()=>setRegime("new")}>New Regime</button>
            <button type="button" style={btnStyle(regime==="old")} onClick={()=>setRegime("old")}>Old Regime</button>
          </div>
        </div>
        <div>
          <div style={{...labelStyle,marginBottom:8}}>Assessment Year</div>
          <div style={{display:"flex",gap:8}}>
            <button type="button" style={btnStyle(taxYear==="2025-26")} onClick={()=>setTaxYear("2025-26")}>2025-26 (AY 2026-27)</button>
            <button type="button" style={btnStyle(taxYear==="2024-25")} onClick={()=>setTaxYear("2024-25")}>2024-25 (AY 2025-26)</button>
          </div>
        </div>
        <div>
          <div style={{...labelStyle,marginBottom:8}}>Age Group</div>
          <select value={age} onChange={e=>setAge(e.currentTarget.value as AgeGroup)}
            style={{border:"1px solid var(--line)",borderRadius:10,padding:"10px 14px",background:"#fff",fontSize:13,cursor:"pointer",minWidth:190}}>
            <option value="below60">Below 60</option>
            <option value="60to80">Senior (60–80)</option>
            <option value="above80">Super Senior (80+)</option>
          </select>
        </div>
      </div>

      {/* Income section */}
      <div style={sectionHead}>Income</div>
      <div style={{border:"1px solid var(--line)",borderTop:"none",borderRadius:"0 0 8px 8px",padding:"4px 16px 12px"}}>
        <MoneyInput label="Salary / Pension" value={salary} onChange={setSalary} hint="Standard deduction applied automatically"/>
        <MoneyInput label="Business / Profession Income" value={business} onChange={setBusiness}/>
        <MoneyInput label="Short-term Capital Gains (Equity/MF)" value={stcg} onChange={setStcg} hint="Taxed at 20% (Sec 111A)"/>
        <MoneyInput label="Long-term Capital Gains (Equity/MF)" value={ltcg} onChange={setLtcg} hint="₹1,25,000 exempt; excess taxed at 12.5%"/>
        <MoneyInput label="Other Income (FD interest, rent, etc.)" value={otherIncome} onChange={setOtherIncome}/>
        <MoneyInput label="Exempt Income (agriculture, PPF, etc.)" value={exemptIncome} onChange={setExemptIncome} hint="For reference only; excluded from tax"/>
      </div>

      {/* Deductions section — old regime only */}
      {regime==="old"&&(
        <>
          <div style={sectionHead}>Deductions &amp; Exemptions (Old Regime)</div>
          <div style={{border:"1px solid var(--line)",borderTop:"none",borderRadius:"0 0 8px 8px",padding:"4px 16px 12px"}}>
            <MoneyInput label="80C (PPF, ELSS, LIC, PF, etc.)" value={std80C} onChange={setStd80C} hint="Max ₹1,50,000"/>
            <MoneyInput label="80CCD(1B) — NPS extra contribution" value={nps80CCD} onChange={setNps80CCD} hint="Max ₹50,000"/>
            <MoneyInput label="HRA exemption" value={hra} onChange={setHra} hint="Actual exempt HRA amount"/>
            <MoneyInput label="Home loan interest (Sec 24b)" value={homeLoan} onChange={setHomeLoan} hint="Max ₹2,00,000 for self-occupied"/>
            <MoneyInput label="80D — Medical insurance premiums" value={med80D} onChange={setMed80D}/>
            <MoneyInput label="80E — Education loan interest" value={educationLoan} onChange={setEducationLoan}/>
            <MoneyInput label="Other deductions (80G, 80TTA, etc.)" value={otherDeductions} onChange={setOtherDeductions}/>
          </div>
        </>
      )}

      {regime==="new"&&(
        <p style={{fontSize:12,color:"var(--muted)",marginTop:10,lineHeight:1.6}}>
          New Regime: Standard deduction of ₹75,000 applied automatically. Most chapter VI-A deductions (80C, 80D, etc.) are not available except NPS employer contribution.
        </p>
      )}

      {/* Results */}
      <div style={{marginTop:28,background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
        <div className="eyebrow" style={{marginBottom:18}}>Tax Summary</div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,180px),1fr))",gap:16,marginBottom:24}}>
          <div style={{background:"white",border:"1px solid var(--line)",borderRadius:10,padding:16}}>
            <div style={{fontSize:12,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Gross Total Income</div>
            <div style={{fontSize:20,fontWeight:800,color:"var(--ink)"}}>{fmt(result.grossIncome)}</div>
          </div>
          <div style={{background:"white",border:"1px solid var(--line)",borderRadius:10,padding:16}}>
            <div style={{fontSize:12,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Total Deductions</div>
            <div style={{fontSize:20,fontWeight:800,color:"#e67e22"}}>{fmt(result.totalDeductions)}</div>
          </div>
          <div style={{background:"white",border:"1px solid var(--line)",borderRadius:10,padding:16}}>
            <div style={{fontSize:12,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Taxable Income</div>
            <div style={{fontSize:20,fontWeight:800,color:"var(--ink)"}}>{fmt(result.taxableIncome)}</div>
          </div>
          <div style={{background:"#2c5f40",borderRadius:10,padding:16}}>
            <div style={{fontSize:12,color:"rgba(255,255,255,.75)",fontWeight:650,marginBottom:6}}>Total Tax Payable</div>
            <div style={{fontSize:20,fontWeight:800,color:"white"}}>{fmt(result.totalTax)}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:4}}>Effective rate: {pct(result.effectiveRate)}</div>
          </div>
        </div>

        {/* Tax computation breakdown */}
        <div style={{fontSize:13,marginBottom:16}}>
          <div style={{fontWeight:700,marginBottom:8,color:"var(--ink)"}}>Tax Computation</div>
          <div style={{display:"grid",gap:4}}>
            {[
              {label:"Basic tax on normal income",value:fmt(result.basicTax-(parseFloat(ltcg)||0>125000?(Math.max(0,parseFloat(ltcg)||0-125000))*0.125:0)-(parseFloat(stcg)||0)*0.20)},
              ...(parseFloat(stcg)||0>0?[{label:"STCG tax @20% (Sec 111A)",value:fmt((parseFloat(stcg)||0)*0.20)}]:[]),
              ...(parseFloat(ltcg)||0>125000?[{label:`LTCG tax @12.5% on ${fmt(Math.max(0,(parseFloat(ltcg)||0)-125000))}`,value:fmt(Math.max(0,(parseFloat(ltcg)||0)-125000)*0.125)}]:[]),
              ...(result.rebate87A>0?[{label:"Less: Rebate u/s 87A",value:"– "+fmt(result.rebate87A),color:"#27ae60"}]:[]),
              {label:"Tax after rebate",value:fmt(result.taxAfterRebate)},
              ...(result.surchargeAmt>0?[{label:"Surcharge",value:fmt(result.surchargeAmt)}]:[]),
              {label:"Health & Education Cess @4%",value:fmt(result.cess)},
              {label:"Total Tax Payable",value:fmt(result.totalTax),bold:true},
            ].map((row,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid var(--line)",color:(row as {color?:string}).color||"var(--ink)",fontWeight:(row as {bold?:boolean}).bold?700:400}}>
                <span>{row.label}</span><span>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Slab breakdown */}
        <div style={{marginTop:16}}>
          <div style={{fontWeight:700,marginBottom:8,color:"var(--ink)",fontSize:13}}>Tax Slab Breakdown (Normal Income)</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:"#2c5f40"}}>
                  {["Income Slab","Income in Slab","Rate","Tax"].map(h=>(
                    <th key={h} style={{padding:"8px 12px",color:"white",fontWeight:700,textAlign:"right",whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.slabBreakdown.map((row,i)=>(
                  <tr key={i} style={{background:i%2===0?"white":"var(--wash)",borderBottom:"1px solid var(--line)"}}>
                    <td style={{padding:"8px 12px",textAlign:"right",color:"var(--muted)"}}>{row.label}</td>
                    <td style={{padding:"8px 12px",textAlign:"right"}}>{fmt(row.income)}</td>
                    <td style={{padding:"8px 12px",textAlign:"right"}}>{pct(row.rate)}</td>
                    <td style={{padding:"8px 12px",textAlign:"right",fontWeight:700}}>{fmt(row.tax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly take-home */}
        {result.totalTax>0&&(
          <div style={{marginTop:16,display:"flex",gap:20,flexWrap:"wrap"}}>
            <div style={{background:"white",border:"1px solid var(--line)",borderRadius:10,padding:14,flex:1,minWidth:180}}>
              <div style={{fontSize:12,color:"var(--muted)",fontWeight:650,marginBottom:4}}>Monthly Tax Liability</div>
              <div style={{fontSize:18,fontWeight:800}}>{fmt(Math.round(result.totalTax/12))}</div>
            </div>
            <div style={{background:"white",border:"1px solid var(--line)",borderRadius:10,padding:14,flex:1,minWidth:180}}>
              <div style={{fontSize:12,color:"var(--muted)",fontWeight:650,marginBottom:4}}>Monthly Take-home (after tax)</div>
              <div style={{fontSize:18,fontWeight:800,color:"#27ae60"}}>{fmt(Math.round((result.grossIncome-result.totalTax)/12))}</div>
            </div>
          </div>
        )}
      </div>

      <p style={{fontSize:11,color:"var(--muted)",marginTop:14,lineHeight:1.6}}>
        Estimates only. Based on FY {taxYear} slabs. Does not account for TDS, advance tax schedules, marginal relief computation, AMT, or surcharge on special-rate income. Consult a tax professional for filing.
      </p>
    </section>
  );
}
