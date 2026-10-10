"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";

// ─── shared styles ───────────────────────────────────────────────────────────
const labelStyle:React.CSSProperties={display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:6};
const sectionHead=(color:string):React.CSSProperties=>({background:color,color:"#fff",padding:"10px 16px",fontWeight:700,fontSize:14,borderRadius:"8px 8px 0 0",marginTop:20,marginBottom:0});
const sectionBody:React.CSSProperties={border:"1px solid var(--line)",borderTop:"none",borderRadius:"0 0 8px 8px",padding:"4px 16px 12px"};
const rowStyle:React.CSSProperties={display:"grid",gridTemplateColumns:"1fr 180px",gap:16,alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--line)"};

function MoneyInput({label,value,onChange,hint,prefix="$",disabled}:{label:string;value:string;onChange:(v:string)=>void;hint?:string;prefix?:string;disabled?:boolean}){
  return(
    <div style={rowStyle}>
      <div>
        <span style={{...labelStyle,marginBottom:0}}>{label}</span>
        {hint&&<span style={{fontSize:11,color:"var(--muted)"}}>{hint}</span>}
      </div>
      <span style={{position:"relative",display:"flex",alignItems:"center",opacity:disabled?.4:1}}>
        <span aria-hidden style={{position:"absolute",left:11,fontSize:13,color:"var(--muted)",pointerEvents:"none"}}>{prefix}</span>
        <input className="field-input" type="text" inputMode="decimal" value={value} disabled={disabled}
          onChange={e=>onChange(e.currentTarget.value)}
          onBlur={e=>{const n=parseFloat(e.currentTarget.value.replace(/,/g,""));onChange(Number.isFinite(n)&&n>=0?String(n):"0");}}
          style={{paddingLeft:22,textAlign:"right",cursor:disabled?"not-allowed":""}}/>
      </span>
    </div>
  );
}

function btnStyle(active:boolean,accent="#2c5f40"):React.CSSProperties{
  return{padding:"9px 18px",borderRadius:9,border:"1px solid",cursor:"pointer",fontWeight:700,fontSize:13,
    background:active?accent:"white",color:active?"white":"var(--ink)",borderColor:active?accent:"var(--line)"};
}

function pct(x:number,d=1){return x.toFixed(d)+"%";}

// ── slab engine ──────────────────────────────────────────────────────────────
function computeSlabTax(income:number,slabs:[number,number,number][]):number{
  let tax=0,rem=income;
  for(const [lo,hi,rate] of slabs){
    if(rem<=0)break;
    const band=Math.min(rem,hi===Infinity?rem:hi-lo);
    tax+=band*rate;
    rem-=band;
  }
  return tax;
}

// ════════════════════════════════════════════════════════════════════════════
//  INDIA
// ════════════════════════════════════════════════════════════════════════════
type AgeGroup="below60"|"60to80"|"above80";
type INTaxYear="2025-26"|"2024-25";
type INRegime="new"|"old";

const IN_NEW_25:[number,number,number][]=[
  [0,400000,0],[400000,800000,.05],[800000,1200000,.10],
  [1200000,1600000,.15],[1600000,2000000,.20],[2000000,2400000,.25],[2400000,Infinity,.30]];
const IN_NEW_24:[number,number,number][]=[
  [0,300000,0],[300000,700000,.05],[700000,1000000,.10],
  [1000000,1200000,.15],[1200000,1500000,.20],[1500000,Infinity,.30]];
function inOldSlabs(age:AgeGroup):[number,number,number][]{
  const b=age==="below60"?250000:age==="60to80"?300000:500000;
  return[[0,b,0],[b,500000,.05],[500000,1000000,.20],[1000000,Infinity,.30]];
}
function inSurcharge(tax:number,income:number,regime:INRegime){
  if(income<=5000000)return 0;
  const r=income<=10000000?.10:income<=20000000?.15:regime==="old"&&income<=50000000?.25:.37;
  return tax*r;
}
function fmtIN(x:number){return"₹"+Math.round(x).toLocaleString("en-IN");}

function IndiaTab(){
  const [regime,setRegime]=useState<INRegime>("new");
  const [taxYear,setTaxYear]=useState<INTaxYear>("2025-26");
  const [age,setAge]=useState<AgeGroup>("below60");
  const [salary,setSalary]=useState("800000");
  const [business,setBusiness]=useState("0");
  const [stcg,setStcg]=useState("0");
  const [ltcg,setLtcg]=useState("0");
  const [otherIncome,setOtherIncome]=useState("0");
  const [c80,setC80]=useState("150000");
  const [nps,setNps]=useState("0");
  const [hra,setHra]=useState("0");
  const [homeLoan,setHomeLoan]=useState("0");
  const [med,setMed]=useState("0");
  const [edu,setEdu]=useState("0");
  const [otherDed,setOtherDed]=useState("0");

  const r=useMemo(()=>{
    const p=(s:string)=>Math.max(0,parseFloat(s)||0);
    const sal=p(salary),biz=p(business),st=p(stcg),lt=p(ltcg),other=p(otherIncome);
    const stdDed=sal>0?(regime==="new"?75000:50000):0;
    const grossIncome=sal+biz+st+lt+other;
    let totalDed=stdDed;
    if(regime==="old"){
      totalDed=stdDed+Math.min(p(c80),150000)+Math.min(p(nps),50000)+p(hra)+Math.min(p(homeLoan),200000)+p(med)+p(edu)+p(otherDed);
    }
    const ltcgTaxable=Math.max(0,lt-125000);
    const ltcgTax=ltcgTaxable*.125;
    const stcgTax=st*.20;
    const normalIncome=sal+biz+other;
    const taxableNormal=Math.max(0,normalIncome-totalDed);
    const taxableIncome=Math.max(0,taxableNormal+ltcgTaxable+st);
    const slabs=regime==="new"?(taxYear==="2025-26"?IN_NEW_25:IN_NEW_24):inOldSlabs(age);
    const basicTax=computeSlabTax(taxableNormal,slabs)+ltcgTax+stcgTax;
    let rebate=0;
    if(regime==="new"&&taxYear==="2025-26"&&taxableIncome<=1200000) rebate=Math.min(basicTax-ltcgTax-stcgTax,25000);
    else if(regime==="old"&&taxableIncome<=500000) rebate=Math.min(basicTax,12500);
    else if(regime==="new"&&taxYear==="2024-25"&&taxableIncome<=700000) rebate=Math.min(basicTax,25000);
    const afterRebate=Math.max(0,basicTax-rebate);
    const surcharge=inSurcharge(afterRebate,taxableIncome,regime);
    const cess=(afterRebate+surcharge)*.04;
    const totalTax=afterRebate+surcharge+cess;
    const slabBreakdown=slabs.map(([lo,hi,rate])=>{
      const inc=Math.max(0,Math.min(taxableNormal,hi===Infinity?taxableNormal:hi)-lo);
      const lbl=hi===Infinity?`Above ${fmtIN(lo)}`:rate===0?`Up to ${fmtIN(hi)}`:`${fmtIN(lo)} – ${fmtIN(hi)}`;
      return{lbl,inc,rate:rate*100,tax:inc*rate};
    }).filter(row=>row.inc>0);
    return{grossIncome,totalDed,taxableIncome,basicTax,rebate,afterRebate,surcharge,cess,totalTax,rate:grossIncome>0?totalTax/grossIncome*100:0,slabBreakdown,stcgTax,ltcgTax,st,lt};
  },[regime,taxYear,age,salary,business,stcg,ltcg,otherIncome,c80,nps,hra,homeLoan,med,edu,otherDed]);

  const accent="#2c5f40";
  return(
    <>
      <div style={{display:"flex",gap:20,flexWrap:"wrap",marginBottom:20,alignItems:"flex-start"}}>
        <div>
          <div style={{...labelStyle,marginBottom:8}}>Tax Regime</div>
          <div style={{display:"flex",gap:8}}>
            <button type="button" style={btnStyle(regime==="new",accent)} onClick={()=>setRegime("new")}>New Regime</button>
            <button type="button" style={btnStyle(regime==="old",accent)} onClick={()=>setRegime("old")}>Old Regime</button>
          </div>
        </div>
        <div>
          <div style={{...labelStyle,marginBottom:8}}>Assessment Year</div>
          <div style={{display:"flex",gap:8}}>
            <button type="button" style={btnStyle(taxYear==="2025-26",accent)} onClick={()=>setTaxYear("2025-26")}>2025-26</button>
            <button type="button" style={btnStyle(taxYear==="2024-25",accent)} onClick={()=>setTaxYear("2024-25")}>2024-25</button>
          </div>
        </div>
        <div>
          <div style={{...labelStyle,marginBottom:8}}>Age Group</div>
          <select value={age} onChange={e=>setAge(e.currentTarget.value as AgeGroup)}
            style={{border:"1px solid var(--line)",borderRadius:10,padding:"10px 14px",background:"#fff",fontSize:13,cursor:"pointer"}}>
            <option value="below60">Below 60</option>
            <option value="60to80">Senior (60–80)</option>
            <option value="above80">Super Senior (80+)</option>
          </select>
        </div>
      </div>

      <div style={sectionHead(accent)}>Income</div>
      <div style={sectionBody}>
        <MoneyInput prefix="₹" label="Salary / Pension" value={salary} onChange={setSalary} hint="Standard deduction applied automatically"/>
        <MoneyInput prefix="₹" label="Business / Profession Income" value={business} onChange={setBusiness}/>
        <MoneyInput prefix="₹" label="Short-term Capital Gains (Equity/MF)" value={stcg} onChange={setStcg} hint="Taxed at 20% (Sec 111A)"/>
        <MoneyInput prefix="₹" label="Long-term Capital Gains (Equity/MF)" value={ltcg} onChange={setLtcg} hint="₹1,25,000 exempt; excess taxed at 12.5%"/>
        <MoneyInput prefix="₹" label="Other Income (FD interest, rent, etc.)" value={otherIncome} onChange={setOtherIncome}/>
      </div>

      {regime==="old"&&(
        <>
          <div style={sectionHead(accent)}>Deductions &amp; Exemptions</div>
          <div style={sectionBody}>
            <MoneyInput prefix="₹" label="80C (PPF, ELSS, LIC, PF, etc.)" value={c80} onChange={setC80} hint="Max ₹1,50,000"/>
            <MoneyInput prefix="₹" label="80CCD(1B) — NPS extra contribution" value={nps} onChange={setNps} hint="Max ₹50,000"/>
            <MoneyInput prefix="₹" label="HRA exemption (actual exempt amount)" value={hra} onChange={setHra}/>
            <MoneyInput prefix="₹" label="Home loan interest (Sec 24b)" value={homeLoan} onChange={setHomeLoan} hint="Max ₹2,00,000 self-occupied"/>
            <MoneyInput prefix="₹" label="80D — Medical insurance premiums" value={med} onChange={setMed}/>
            <MoneyInput prefix="₹" label="80E — Education loan interest" value={edu} onChange={setEdu}/>
            <MoneyInput prefix="₹" label="Other deductions (80G, 80TTA, etc.)" value={otherDed} onChange={setOtherDed}/>
          </div>
        </>
      )}
      {regime==="new"&&<p style={{fontSize:12,color:"var(--muted)",marginTop:10,lineHeight:1.6}}>New Regime: ₹75,000 standard deduction applied. Most 80C/80D deductions not available.</p>}

      <ResultPanel
        accent={accent}
        rows={[
          {label:"Gross Total Income",value:fmtIN(r.grossIncome)},
          {label:"Total Deductions",value:fmtIN(r.totalDed),color:"#e67e22"},
          {label:"Taxable Income",value:fmtIN(r.taxableIncome)},
        ]}
        computation={[
          {label:"Basic tax on slab income",value:fmtIN(r.basicTax-r.ltcgTax-r.stcgTax)},
          ...(r.st>0?[{label:"STCG tax @20% (Sec 111A)",value:fmtIN(r.stcgTax)}]:[]),
          ...(r.lt>125000?[{label:`LTCG tax @12.5% on ${fmtIN(r.lt-125000)}`,value:fmtIN(r.ltcgTax)}]:[]),
          ...(r.rebate>0?[{label:"Less: Rebate u/s 87A",value:"– "+fmtIN(r.rebate),color:"#27ae60"}]:[]),
          {label:"Tax after rebate",value:fmtIN(r.afterRebate)},
          ...(r.surcharge>0?[{label:"Surcharge",value:fmtIN(r.surcharge)}]:[]),
          {label:"Health & Education Cess @4%",value:fmtIN(r.cess)},
          {label:"Total Tax Payable",value:fmtIN(r.totalTax),bold:true},
        ]}
        slabBreakdown={r.slabBreakdown.map(s=>({lbl:s.lbl,inc:fmtIN(s.inc),rate:pct(s.rate),tax:fmtIN(s.tax)}))}
        totalTax={r.totalTax}
        grossIncome={r.grossIncome}
        effectiveRate={r.rate}
        fmtMoney={fmtIN}
        disclaimer={`Estimates only. FY ${taxYear} slabs. Marginal relief, AMT, and advance tax not modelled. Consult a tax professional.`}
      />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  USA
// ════════════════════════════════════════════════════════════════════════════
type FilingStatus="single"|"mfj"|"mfs"|"hoh"|"qss";
type USTaxYear="2025"|"2024";

// 2025 Federal brackets (One Big Beautiful Bill signed July 2025 — same brackets as 2024 with inflation adjustments)
const US_BRACKETS_2025:Record<FilingStatus,[number,number,number][]>={
  single:[[0,11925,0.10],[11925,48475,0.12],[48475,103350,0.22],[103350,197300,0.24],[197300,250525,0.32],[250525,626350,0.35],[626350,Infinity,0.37]],
  mfj:[[0,23850,0.10],[23850,96950,0.12],[96950,206700,0.22],[206700,394600,0.24],[394600,501050,0.32],[501050,751600,0.35],[751600,Infinity,0.37]],
  mfs:[[0,11925,0.10],[11925,48475,0.12],[48475,103350,0.22],[103350,197300,0.24],[197300,250525,0.32],[250525,375800,0.35],[375800,Infinity,0.37]],
  hoh:[[0,17000,0.10],[17000,64850,0.12],[64850,103350,0.22],[103350,197300,0.24],[197300,250500,0.32],[250500,626350,0.35],[626350,Infinity,0.37]],
  qss:[[0,23850,0.10],[23850,96950,0.12],[96950,206700,0.22],[206700,394600,0.24],[394600,501050,0.32],[501050,751600,0.35],[751600,Infinity,0.37]],
};
// 2024 brackets
const US_BRACKETS_2024:Record<FilingStatus,[number,number,number][]>={
  single:[[0,11600,0.10],[11600,47150,0.12],[47150,100525,0.22],[100525,191950,0.24],[191950,243725,0.32],[243725,609350,0.35],[609350,Infinity,0.37]],
  mfj:[[0,23200,0.10],[23200,94300,0.12],[94300,201050,0.22],[201050,383900,0.24],[383900,487450,0.32],[487450,731200,0.35],[731200,Infinity,0.37]],
  mfs:[[0,11600,0.10],[11600,47150,0.12],[47150,100525,0.22],[100525,191950,0.24],[191950,243725,0.32],[243725,365600,0.35],[365600,Infinity,0.37]],
  hoh:[[0,16550,0.10],[16550,63100,0.12],[63100,100500,0.22],[100500,191950,0.24],[191950,243700,0.32],[243700,609350,0.35],[609350,Infinity,0.37]],
  qss:[[0,23200,0.10],[23200,94300,0.12],[94300,201050,0.22],[201050,383900,0.24],[383900,487450,0.32],[487450,731200,0.35],[731200,Infinity,0.37]],
};
// Standard deductions 2025 / 2024
const US_STD_DED:Record<USTaxYear,Record<FilingStatus,number>>={
  "2025":{single:15000,mfj:30000,mfs:15000,hoh:22500,qss:30000},
  "2024":{single:14600,mfj:29200,mfs:14600,hoh:21900,qss:29200},
};
// 2025 LTCG brackets (single)
const LTCG_BRACKETS_2025:Record<FilingStatus,[number,number,number][]>={
  single:[[0,48350,0],[48350,533400,0.15],[533400,Infinity,0.20]],
  mfj:[[0,96700,0],[96700,600050,0.15],[600050,Infinity,0.20]],
  mfs:[[0,48350,0],[48350,300025,0.15],[300025,Infinity,0.20]],
  hoh:[[0,64750,0],[64750,566700,0.15],[566700,Infinity,0.20]],
  qss:[[0,96700,0],[96700,600050,0.15],[600050,Infinity,0.20]],
};

function fmtUS(x:number){return"$"+Math.round(x).toLocaleString("en-US");}

function USTab(){
  const [status,setStatus]=useState<FilingStatus>("single");
  const [taxYear,setTaxYear]=useState<USTaxYear>("2025");
  const [youngDeps,setYoungDeps]=useState("0");   // age 0-16 → child tax credit $2000 each
  const [otherDeps,setOtherDeps]=useState("0");   // age 17+ → credit $500 each
  const [useItemized,setUseItemized]=useState(false);

  // W-2 / income
  const [wages,setWages]=useState("80000");
  const [fedWithheld,setFedWithheld]=useState("9000");
  const [ssIncome,setSsIncome]=useState("0");
  const [interestInc,setInterestInc]=useState("0");
  const [ordDividends,setOrdDividends]=useState("0");
  const [qualDividends,setQualDividends]=useState("0");
  const [stcg,setStcg]=useState("0");
  const [ltcg,setLtcg]=useState("0");
  const [businessInc,setBusinessInc]=useState("0");
  const [otherInc,setOtherInc]=useState("0");

  // Itemized deductions
  const [mortgageInt,setMortgageInt]=useState("0");
  const [realEstateTax,setRealEstateTax]=useState("0");
  const [charitableDon,setCharitableDon]=useState("0");
  const [studentLoanInt,setStudentLoanInt]=useState("0");
  const [childCareExp,setChildCareExp]=useState("0");
  const [iraContrib,setIraContrib]=useState("0");
  const [otherItemized,setOtherItemized]=useState("0");

  const r=useMemo(()=>{
    const p=(s:string)=>Math.max(0,parseFloat(s)||0);
    const brackets=taxYear==="2025"?US_BRACKETS_2025[status]:US_BRACKETS_2024[status];
    const stdDed=US_STD_DED[taxYear][status];
    const ltcgBrackets=LTCG_BRACKETS_2025[status]; // simplified: use 2025 for both years

    const yd=Math.round(p(youngDeps)),od=Math.round(p(otherDeps));
    const w=p(wages),ss=p(ssIncome)*.85; // 85% of SS taxable (simplified)
    const interest=p(interestInc),ordDiv=p(ordDividends),qualDiv=p(qualDividends);
    const st=p(stcg),lt=p(ltcg),biz=p(businessInc),other=p(otherInc);

    // QBI deduction for business income (simplified 20% if income below threshold)
    const qbiDed=biz>0?Math.min(biz*.20,biz):0;

    // Above-the-line: student loan interest (max $2500), IRA (max $7000/$8000 50+)
    const studentLoan=Math.min(p(studentLoanInt),2500);
    const ira=Math.min(p(iraContrib),7000);
    const aboveLine=studentLoan+ira+qbiDed;

    const grossIncome=w+ss+interest+ordDiv+st+lt+biz+other;
    const agi=Math.max(0,grossIncome-aboveLine);

    // Itemized vs standard
    const mortInt=Math.min(p(mortgageInt),750000*0); // simplified: take as-entered
    const salt=Math.min(p(realEstateTax),10000); // SALT cap
    const charity=p(charitableDon);
    const childCare=Math.min(p(childCareExp),6000); // for credit calc, not deduction
    const itemizedTotal=p(mortgageInt)+salt+charity+p(otherItemized);
    const deduction=useItemized?Math.max(stdDed,itemizedTotal):stdDed;

    // Ordinary taxable income excludes LTCG+qual dividends
    const ordinaryIncome=Math.max(0,agi-deduction-(lt>0?lt:0)-(qualDiv>0?qualDiv:0));
    const ltcgIncome=lt+qualDiv; // taxed at preferential rates

    // Ordinary tax
    const ordTax=computeSlabTax(ordinaryIncome,brackets);

    // LTCG tax (stack on top of ordinary income)
    const ltcgBase=ordinaryIncome;
    let ltcgTax=0;
    let ltcgRem=ltcgIncome;
    let stackedIncome=ltcgBase;
    for(const [lo,hi,rate] of ltcgBrackets){
      if(ltcgRem<=0)break;
      const available=Math.max(0,(hi===Infinity?stackedIncome+ltcgRem:hi)-stackedIncome);
      const taxed=Math.min(ltcgRem,available);
      ltcgTax+=taxed*rate;
      ltcgRem-=taxed;
      stackedIncome+=taxed;
    }

    // STCG taxed as ordinary income (already included in ordinaryIncome above via wages...)
    // Actually STCG should be in ordinary income — recalculate including it
    const ordWithStcg=Math.max(0,agi-deduction-lt-qualDiv); // same since st is already in agi
    const ordTaxFinal=computeSlabTax(ordWithStcg,brackets);

    const grossTax=ordTaxFinal+ltcgTax;

    // Credits
    const childTaxCredit=Math.min(yd*2000,grossTax); // simplified, no phase-out
    const otherDepCredit=Math.min(od*500,Math.max(0,grossTax-childTaxCredit));
    // Child & dependent care credit: up to 20% of expenses (simplified)
    const careCredit=childCare*.20;
    const totalCredits=childTaxCredit+otherDepCredit+careCredit;

    const taxAfterCredits=Math.max(0,grossTax-totalCredits);

    // Self-employment tax (if business income > 400)
    const seTax=biz>400?Math.min(biz,147000)*.153+(Math.max(0,biz-147000))*.029:0;

    const totalTax=taxAfterCredits+seTax;
    const taxOwed=Math.max(0,totalTax-p(fedWithheld));
    const refund=Math.max(0,p(fedWithheld)-totalTax);

    const effectiveRate=grossIncome>0?totalTax/grossIncome*100:0;
    const marginalRate=(()=>{for(const [lo,,rate] of [...brackets].reverse()){if(ordWithStcg>lo)return rate*100;}return 0;})();

    const slabBreakdown=brackets.map(([lo,hi,rate])=>{
      const inc=Math.max(0,Math.min(ordWithStcg,hi===Infinity?ordWithStcg:hi)-lo);
      const lbl=hi===Infinity?`Over ${fmtUS(lo)}`:rate===0?`Up to ${fmtUS(hi)}`:`${fmtUS(lo)} – ${fmtUS(hi)}`;
      return{lbl,inc:fmtUS(inc),rate:pct(rate*100),tax:fmtUS(inc*rate)};
    }).filter(row=>row.inc!==fmtUS(0));

    return{grossIncome,agi,deduction,ordinaryIncome:ordWithStcg,grossTax,totalCredits,taxAfterCredits,seTax,totalTax,taxOwed,refund,effectiveRate,marginalRate,slabBreakdown,ltcgTax,ltcgIncome,itemizedTotal,stdDed,useItemized};
  },[status,taxYear,youngDeps,otherDeps,wages,fedWithheld,ssIncome,interestInc,ordDividends,qualDividends,stcg,ltcg,businessInc,otherInc,mortgageInt,realEstateTax,charitableDon,studentLoanInt,childCareExp,iraContrib,otherItemized,useItemized]);

  const accent="#1a4b8c";
  const filingOptions=[
    {value:"single",label:"Single"},
    {value:"mfj",label:"Married Filing Jointly"},
    {value:"mfs",label:"Married Filing Separately"},
    {value:"hoh",label:"Head of Household"},
    {value:"qss",label:"Qualifying Surviving Spouse"},
  ];

  return(
    <>
      {/* Filing status + year */}
      <div style={{display:"flex",gap:20,flexWrap:"wrap",marginBottom:20,alignItems:"flex-start"}}>
        <div style={{flex:1,minWidth:220}}>
          <div style={{...labelStyle,marginBottom:8}}>Filing Status</div>
          <select value={status} onChange={e=>setStatus(e.currentTarget.value as FilingStatus)}
            style={{border:"1px solid var(--line)",borderRadius:10,padding:"10px 14px",background:"#fff",fontSize:13,cursor:"pointer",width:"100%"}}>
            {filingOptions.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <div style={{...labelStyle,marginBottom:8}}>Tax Year</div>
          <div style={{display:"flex",gap:8}}>
            <button type="button" style={btnStyle(taxYear==="2025",accent)} onClick={()=>setTaxYear("2025")}>2025</button>
            <button type="button" style={btnStyle(taxYear==="2024",accent)} onClick={()=>setTaxYear("2024")}>2024</button>
          </div>
        </div>
        <div>
          <div style={{...labelStyle,marginBottom:8}}>Dependents</div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <label style={{fontSize:13}}>
              <span style={{display:"block",color:"var(--muted)",fontSize:11,marginBottom:4}}>Age 0–16</span>
              <input className="field-input" type="text" inputMode="numeric" value={youngDeps} onChange={e=>setYoungDeps(e.currentTarget.value)}
                style={{width:60,textAlign:"center"}}/>
            </label>
            <label style={{fontSize:13}}>
              <span style={{display:"block",color:"var(--muted)",fontSize:11,marginBottom:4}}>Age 17+</span>
              <input className="field-input" type="text" inputMode="numeric" value={otherDeps} onChange={e=>setOtherDeps(e.currentTarget.value)}
                style={{width:60,textAlign:"center"}}/>
            </label>
          </div>
        </div>
      </div>

      {/* Income */}
      <div style={sectionHead(accent)}>Income</div>
      <div style={sectionBody}>
        <MoneyInput prefix="$" label="Wages, Tips, Other Compensation" value={wages} onChange={setWages} hint="W-2 Box 1"/>
        <MoneyInput prefix="$" label="Federal Income Tax Withheld" value={fedWithheld} onChange={setFedWithheld} hint="W-2 Box 2"/>
        <MoneyInput prefix="$" label="Social Security Income" value={ssIncome} onChange={setSsIncome} hint="SSA-1099 (85% taxable, simplified)"/>
        <MoneyInput prefix="$" label="Interest Income" value={interestInc} onChange={setInterestInc} hint="1099-INT"/>
        <MoneyInput prefix="$" label="Ordinary Dividends" value={ordDividends} onChange={setOrdDividends}/>
        <MoneyInput prefix="$" label="Qualified Dividends" value={qualDividends} onChange={setQualDividends} hint="Taxed at preferential LTCG rates"/>
        <MoneyInput prefix="$" label="Short-term Capital Gains" value={stcg} onChange={setStcg} hint="Taxed as ordinary income"/>
        <MoneyInput prefix="$" label="Long-term Capital Gains" value={ltcg} onChange={setLtcg} hint="0% / 15% / 20% preferential rates"/>
        <MoneyInput prefix="$" label="Business / Self-employment Income" value={businessInc} onChange={setBusinessInc} hint="Schedule C / 1099-NEC; SE tax applies"/>
        <MoneyInput prefix="$" label="Other Income" value={otherInc} onChange={setOtherInc} hint="Rental, alimony, miscellaneous"/>
      </div>

      {/* Deductions */}
      <div style={sectionHead(accent)}>Deductions &amp; Credits</div>
      <div style={sectionBody}>
        <div style={{...rowStyle,borderBottom:"none",paddingBottom:4}}>
          <div>
            <span style={{...labelStyle,marginBottom:0}}>Deduction Type</span>
            <span style={{fontSize:11,color:"var(--muted)"}}>Standard: {fmtUS(r.stdDed)} · Itemized: {fmtUS(r.itemizedTotal)}</span>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button type="button" style={btnStyle(!useItemized,accent)} onClick={()=>setUseItemized(false)}>Standard</button>
            <button type="button" style={btnStyle(useItemized,accent)} onClick={()=>setUseItemized(true)}>Itemize</button>
          </div>
        </div>
        <MoneyInput prefix="$" label="Mortgage Interest" value={mortgageInt} onChange={setMortgageInt} disabled={!useItemized}/>
        <MoneyInput prefix="$" label="Real Estate / Property Tax" value={realEstateTax} onChange={setRealEstateTax} hint="SALT cap $10,000" disabled={!useItemized}/>
        <MoneyInput prefix="$" label="Charitable Donations" value={charitableDon} onChange={setCharitableDon} disabled={!useItemized}/>
        <MoneyInput prefix="$" label="Other Itemized Deductions" value={otherItemized} onChange={setOtherItemized} disabled={!useItemized}/>
        <MoneyInput prefix="$" label="Student Loan Interest (80E equiv.)" value={studentLoanInt} onChange={setStudentLoanInt} hint="Above-the-line; max $2,500"/>
        <MoneyInput prefix="$" label="IRA Contributions" value={iraContrib} onChange={setIraContrib} hint="Above-the-line; max $7,000"/>
        <MoneyInput prefix="$" label="Child & Dependent Care Expenses" value={childCareExp} onChange={setChildCareExp} hint="Credit: ~20% of expenses (max $6k)"/>
      </div>

      <ResultPanel
        accent={accent}
        rows={[
          {label:"Gross Income",value:fmtUS(r.grossIncome)},
          {label:"Adjusted Gross Income (AGI)",value:fmtUS(r.agi)},
          {label:`${r.useItemized?"Itemized":"Standard"} Deduction`,value:fmtUS(r.deduction),color:"#e67e22"},
          {label:"Ordinary Taxable Income",value:fmtUS(r.ordinaryIncome)},
        ]}
        computation={[
          {label:"Ordinary income tax",value:fmtUS(r.grossTax-r.ltcgTax)},
          ...(r.ltcgIncome>0?[{label:`LTCG / Qual. Dividends tax`,value:fmtUS(r.ltcgTax)}]:[]),
          ...(r.totalCredits>0?[{label:"Less: Tax Credits",value:"– "+fmtUS(r.totalCredits),color:"#27ae60"}]:[]),
          ...(r.seTax>0?[{label:"Self-employment tax",value:fmtUS(r.seTax)}]:[]),
          {label:"Total Federal Tax",value:fmtUS(r.totalTax),bold:true},
          {label:"Federal Tax Withheld",value:fmtUS(parseFloat(fedWithheld)||0),color:"#27ae60"},
          r.refund>0
            ?{label:"Estimated Refund",value:fmtUS(r.refund),color:"#27ae60",bold:true}
            :{label:"Tax Owed",value:fmtUS(r.taxOwed),color:r.taxOwed>0?"#c0392b":"var(--ink)",bold:true},
        ]}
        slabBreakdown={r.slabBreakdown}
        totalTax={r.totalTax}
        grossIncome={r.grossIncome}
        effectiveRate={r.effectiveRate}
        fmtMoney={fmtUS}
        extraCards={[
          {label:"Marginal Rate",value:pct(r.marginalRate,0)},
          {label:r.refund>0?"Estimated Refund":"Tax Owed",value:r.refund>0?fmtUS(r.refund):fmtUS(r.taxOwed),highlight:true,good:r.refund>0},
        ]}
        disclaimer="Federal estimate only. Does not include state/local taxes, AMT, IRMAA, phase-outs, or all credits. Consult a tax professional."
      />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  Shared result panel
// ════════════════════════════════════════════════════════════════════════════
interface ResultPanelProps{
  accent:string;
  rows:Array<{label:string;value:string;color?:string}>;
  computation:Array<{label:string;value:string;color?:string;bold?:boolean}>;
  slabBreakdown:Array<{lbl:string;inc:string;rate:string;tax:string}>;
  totalTax:number;
  grossIncome:number;
  effectiveRate:number;
  fmtMoney:(x:number)=>string;
  extraCards?:Array<{label:string;value:string;highlight?:boolean;good?:boolean}>;
  disclaimer:string;
}
function ResultPanel({accent,rows,computation,slabBreakdown,totalTax,grossIncome,effectiveRate,fmtMoney,extraCards,disclaimer}:ResultPanelProps){
  return(
    <>
      <div style={{marginTop:28,background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
        <div className="eyebrow" style={{marginBottom:18}}>Tax Summary</div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,170px),1fr))",gap:14,marginBottom:22}}>
          {rows.map((r,i)=>(
            <div key={i} style={{background:"white",border:"1px solid var(--line)",borderRadius:10,padding:14}}>
              <div style={{fontSize:11,color:"var(--muted)",fontWeight:650,marginBottom:5}}>{r.label}</div>
              <div style={{fontSize:18,fontWeight:800,color:r.color||"var(--ink)"}}>{r.value}</div>
            </div>
          ))}
          <div style={{background:accent,borderRadius:10,padding:14}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,.75)",fontWeight:650,marginBottom:5}}>Total Tax</div>
            <div style={{fontSize:18,fontWeight:800,color:"white"}}>{fmtMoney(totalTax)}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:3}}>Effective rate: {pct(effectiveRate)}</div>
          </div>
          {extraCards?.map((c,i)=>(
            <div key={i} style={{background:c.highlight?(c.good?"#e8f8ed":"#fef0f0"):"white",border:"1px solid "+(c.highlight?(c.good?"#a3d9b0":"#f5c6c6"):"var(--line)"),borderRadius:10,padding:14}}>
              <div style={{fontSize:11,color:"var(--muted)",fontWeight:650,marginBottom:5}}>{c.label}</div>
              <div style={{fontSize:18,fontWeight:800,color:c.highlight?(c.good?"#27ae60":"#c0392b"):"var(--ink)"}}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Computation */}
        <div style={{fontSize:13,marginBottom:18}}>
          <div style={{fontWeight:700,marginBottom:8}}>Tax Computation</div>
          {computation.map((row,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid var(--line)",color:row.color||"var(--ink)",fontWeight:row.bold?700:400}}>
              <span>{row.label}</span><span>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Slab breakdown */}
        {slabBreakdown.length>0&&(
          <div>
            <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>Tax Bracket Breakdown</div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{background:accent}}>
                    {["Income Bracket","Income in Bracket","Rate","Tax"].map(h=>(
                      <th key={h} style={{padding:"8px 12px",color:"white",fontWeight:700,textAlign:"right",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slabBreakdown.map((row,i)=>(
                    <tr key={i} style={{background:i%2===0?"white":"var(--wash)",borderBottom:"1px solid var(--line)"}}>
                      <td style={{padding:"8px 12px",textAlign:"right",color:"var(--muted)"}}>{row.lbl}</td>
                      <td style={{padding:"8px 12px",textAlign:"right"}}>{row.inc}</td>
                      <td style={{padding:"8px 12px",textAlign:"right"}}>{row.rate}</td>
                      <td style={{padding:"8px 12px",textAlign:"right",fontWeight:700}}>{row.tax}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalTax>0&&(
          <div style={{marginTop:16,display:"flex",gap:14,flexWrap:"wrap"}}>
            <div style={{background:"white",border:"1px solid var(--line)",borderRadius:10,padding:14,flex:1,minWidth:160}}>
              <div style={{fontSize:11,color:"var(--muted)",fontWeight:650,marginBottom:4}}>Monthly Tax</div>
              <div style={{fontSize:17,fontWeight:800}}>{fmtMoney(Math.round(totalTax/12))}</div>
            </div>
            <div style={{background:"white",border:"1px solid var(--line)",borderRadius:10,padding:14,flex:1,minWidth:160}}>
              <div style={{fontSize:11,color:"var(--muted)",fontWeight:650,marginBottom:4}}>Monthly Take-home</div>
              <div style={{fontSize:17,fontWeight:800,color:"#27ae60"}}>{fmtMoney(Math.round((grossIncome-totalTax)/12))}</div>
            </div>
          </div>
        )}
      </div>
      <p style={{fontSize:11,color:"var(--muted)",marginTop:12,lineHeight:1.6}}>{disclaimer}</p>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  Root component — country switcher
// ════════════════════════════════════════════════════════════════════════════
export default function IncomeTaxCalculator({calculator}:{calculator:CalculatorDefinition}){
  const [country,setCountry]=useState<"india"|"usa">("india");
  void calculator;
  return(
    <section className="surface" style={{padding:28}} aria-label="Income tax calculator">
      {/* Country switcher */}
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28,background:"var(--wash)",borderRadius:12,padding:4,width:"fit-content",border:"1px solid var(--line)"}}>
        {(["india","usa"] as const).map(c=>(
          <button key={c} type="button" onClick={()=>setCountry(c)}
            style={{padding:"10px 28px",borderRadius:9,border:"none",cursor:"pointer",fontWeight:700,fontSize:14,
              background:country===c?"white":"transparent",
              color:country===c?"var(--ink)":"var(--muted)",
              boxShadow:country===c?"0 1px 4px rgba(0,0,0,.12)":"none",
              transition:"all .15s"}}>
            {c==="india"?"🇮🇳  India":"🇺🇸  USA"}
          </button>
        ))}
      </div>
      {country==="india"?<IndiaTab/>:<USTab/>}
    </section>
  );
}
