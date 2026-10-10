"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";
import {IN,type Currency} from "@/lib/calculators/engine";

type Mode="grow"|"goal";

function makeFmt(currency:Currency){
  const nf=new Intl.NumberFormat(currency.locale,{maximumFractionDigits:2});
  return(x:number)=>Number.isFinite(x)&&x>=0?currency.sym+nf.format(x):"—";
}

function makeNFmt(currency:Currency){
  const nf=new Intl.NumberFormat(currency.locale,{maximumFractionDigits:2});
  return(x:number,d=2)=>Number.isFinite(x)?new Intl.NumberFormat(currency.locale,{maximumFractionDigits:d}).format(x):"—";
}

// Compound monthly interest with optional tax on interest earned each year
// Returns year-by-year rows
type YearRow={
  year:number;
  openingBalance:number;
  deposited:number;
  grossInterest:number;
  taxOnInterest:number;
  netInterest:number;
  closingBalance:number;
  cumulativeDeposited:number;
  cumulativeGrossInterest:number;
  cumulativeTax:number;
};

function buildSchedule(
  initial:number,
  monthly:number,
  annualRate:number,
  years:number,
  taxRate:number
):YearRow[]{
  const rows:YearRow[]=[];
  let balance=initial;
  let cumDeposited=initial;
  let cumGrossInterest=0;
  let cumTax=0;
  const monthlyRate=annualRate/100/12;

  for(let y=1;y<=years;y++){
    const opening=balance;
    let grossInterest=0;

    // Simulate month-by-month within the year
    for(let m=0;m<12;m++){
      const interest=balance*monthlyRate;
      grossInterest+=interest;
      balance+=interest+monthly;
      cumDeposited+=monthly;
    }

    const taxOnInterest=grossInterest*taxRate/100;
    const netInterest=grossInterest-taxOnInterest;
    // Deduct tax from balance (tax paid out of savings)
    balance-=taxOnInterest;
    cumGrossInterest+=grossInterest;
    cumTax+=taxOnInterest;

    rows.push({
      year:y,
      openingBalance:opening,
      deposited:monthly*12+(y===1?initial:0),
      grossInterest,
      taxOnInterest,
      netInterest,
      closingBalance:balance,
      cumulativeDeposited:cumDeposited,
      cumulativeGrossInterest:cumGrossInterest,
      cumulativeTax:cumTax,
    });
  }
  return rows;
}

// "Reach goal" mode: find required monthly deposit to reach target
function findRequiredMonthly(
  initial:number,
  target:number,
  annualRate:number,
  years:number,
  taxRate:number
):number{
  // Binary search
  if(target<=initial) return 0;
  let lo=0,hi=target;
  for(let i=0;i<60;i++){
    const mid=(lo+hi)/2;
    const rows=buildSchedule(initial,mid,annualRate,years,taxRate);
    const final=rows[rows.length-1]?.closingBalance??0;
    if(final<target) lo=mid; else hi=mid;
  }
  return (lo+hi)/2;
}

function SvgPie({principal,interest}:{principal:number;interest:number}){
  const total=principal+interest;
  if(total<=0||!Number.isFinite(total))return null;
  const pRatio=Math.max(0,Math.min(1,principal/total));
  const cx=90,cy=90,r=75;
  const angle=pRatio*2*Math.PI;
  const safeAngle=angle>=2*Math.PI?2*Math.PI-0.0001:angle<=0?0.0001:angle;
  const x1=cx,y1=cy-r;
  const x2=cx+r*Math.sin(safeAngle),y2=cy-r*Math.cos(safeAngle);
  const large=safeAngle>Math.PI?1:0;
  const midP=safeAngle/2;
  const midI=safeAngle+(2*Math.PI-safeAngle)/2;
  const lx=cx+(r*0.65)*Math.sin(midP);
  const ly=cy-(r*0.65)*Math.cos(midP);
  const lx2=cx+(r*0.65)*Math.sin(midI);
  const ly2=cy-(r*0.65)*Math.cos(midI);
  return(
    <svg width={180} height={180} viewBox="0 0 180 180" aria-hidden="true">
      <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`} fill="#176b4d"/>
      <path d={`M${cx},${cy} L${x2},${y2} A${r},${r} 0 ${1-large},1 ${x1},${y1} Z`} fill="#b2cfc4"/>
      {pRatio>0.08&&<text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={11} fontWeight={700}>{Math.round(pRatio*100)}%</text>}
      {pRatio<0.92&&<text x={lx2} y={ly2} textAnchor="middle" dominantBaseline="middle" fill="#13261f" fontSize={11} fontWeight={700}>{Math.round((1-pRatio)*100)}%</text>}
    </svg>
  );
}

function NumInput({label,value,onChange,prefix,suffix}:{label:string;value:string;onChange:(v:string)=>void;prefix?:string;suffix?:string}){
  return(
    <label style={{display:"block"}}>
      <span style={{display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8}}>{label}</span>
      <span style={{display:"flex",position:"relative",alignItems:"center"}}>
        {prefix&&<span aria-hidden style={{position:"absolute",left:12,fontSize:13,color:"var(--muted)",pointerEvents:"none",zIndex:1}}>{prefix}</span>}
        <input
          className="field-input"
          type="text"
          inputMode="decimal"
          value={value}
          onChange={e=>onChange(e.currentTarget.value)}
          onBlur={e=>{const n=parseFloat(e.currentTarget.value);if(Number.isFinite(n))onChange(String(Math.max(0,n)));}}
          style={{paddingLeft:prefix?28:13,paddingRight:suffix?`${Math.max((suffix.length)*8+16,40)}px`:"13px"}}
        />
        {suffix&&<span aria-hidden style={{position:"absolute",right:12,fontSize:12,color:"var(--muted)",pointerEvents:"none"}}>{suffix}</span>}
      </span>
    </label>
  );
}

const thStyle:React.CSSProperties={padding:"10px 14px",textAlign:"right",fontWeight:750,color:"var(--muted)",whiteSpace:"nowrap"};
const tdStyle:React.CSSProperties={padding:"10px 14px",textAlign:"right"};
const tableBtnStyle:React.CSSProperties={
  background:"none",border:"1px solid var(--line)",borderRadius:10,
  padding:"9px 16px",cursor:"pointer",fontWeight:700,fontSize:13,color:"var(--accent)"
};

export default function SavingsCalculator({calculator,currency=IN}:{calculator:CalculatorDefinition;currency?:Currency}){
  const money=makeFmt(currency);

  const [mode,setMode]=useState<Mode>("grow");

  // Grow mode inputs
  const [initial,setInitial]=useState("10000");
  const [monthly,setMonthly]=useState("500");
  const [rate,setRate]=useState("5");
  const [years,setYears]=useState("10");
  const [taxRate,setTaxRate]=useState("0");

  // Goal mode extra
  const [goal,setGoal]=useState("100000");

  const [showTable,setShowTable]=useState(false);

  const p=Math.max(0,parseFloat(initial)||0);
  const m=Math.max(0,parseFloat(monthly)||0);
  const r=Math.max(0,parseFloat(rate)||0);
  const y=Math.max(1,Math.round(parseFloat(years)||1));
  const tax=Math.max(0,Math.min(100,parseFloat(taxRate)||0));
  const g=Math.max(0,parseFloat(goal)||0);

  const result=useMemo(()=>{
    if(mode==="grow"){
      if(y<=0) return null;
      const schedule=buildSchedule(p,m,r,y,tax);
      const last=schedule[schedule.length-1];
      if(!last) return null;
      const finalBalance=last.closingBalance;
      const totalDeposited=last.cumulativeDeposited;
      const grossInterest=last.cumulativeGrossInterest;
      const totalTax=last.cumulativeTax;
      const netInterest=grossInterest-totalTax;
      return{mode:"grow" as const,finalBalance,totalDeposited,grossInterest,netInterest,totalTax,schedule};
    } else {
      // Goal mode
      if(y<=0||g<=0) return null;
      const requiredMonthly=findRequiredMonthly(p,g,r,y,tax);
      const schedule=buildSchedule(p,requiredMonthly,r,y,tax);
      const last=schedule[schedule.length-1];
      if(!last) return null;
      const finalBalance=last.closingBalance;
      const totalDeposited=last.cumulativeDeposited;
      const grossInterest=last.cumulativeGrossInterest;
      const totalTax=last.cumulativeTax;
      const netInterest=grossInterest-totalTax;
      return{mode:"goal" as const,requiredMonthly,finalBalance,totalDeposited,grossInterest,netInterest,totalTax,schedule};
    }
  },[mode,p,m,r,y,tax,g]);

  const inputGrid:React.CSSProperties={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))",gap:18};

  const piePrincipal=result?.totalDeposited??0;
  const pieInterest=result?.netInterest??0;

  return(
    <section className="surface" style={{padding:28}} aria-label="Savings calculator">
      {/* Mode tabs */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:24}}>
        {([
          {key:"grow" as Mode,label:"Grow Savings",desc:"Calculate the future value of your savings over time."},
          {key:"goal" as Mode,label:"Reach a Goal",desc:"Find the monthly deposit needed to hit a target balance."},
        ]).map(t=>(
          <button
            key={t.key}
            type="button"
            onClick={()=>{setMode(t.key);setShowTable(false);}}
            style={{
              padding:"10px 18px",borderRadius:10,border:"1px solid",cursor:"pointer",fontWeight:700,fontSize:14,
              background:mode===t.key?"var(--accent)":"white",
              color:mode===t.key?"white":"var(--ink)",
              borderColor:mode===t.key?"var(--accent)":"var(--line)",
              transition:"all .15s",textAlign:"left",lineHeight:1.3
            }}
          >
            <div>{t.label}</div>
            <div style={{fontSize:11,fontWeight:500,opacity:.8}}>{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div style={inputGrid}>
        <NumInput label="Initial Deposit" value={initial} onChange={setInitial} prefix={currency.sym}/>
        {mode==="grow"?(
          <NumInput label="Monthly Contribution" value={monthly} onChange={setMonthly} prefix={currency.sym}/>
        ):(
          <NumInput label="Savings Goal" value={goal} onChange={setGoal} prefix={currency.sym}/>
        )}
        <NumInput label="Annual Interest Rate" value={rate} onChange={setRate} suffix="%"/>
        <NumInput label="Duration" value={String(y)} onChange={v=>{const n=parseInt(v);if(Number.isFinite(n))setYears(String(Math.max(1,n)));else setYears(v);}} suffix="years"/>
        <NumInput label="Tax Rate on Interest (optional)" value={taxRate} onChange={setTaxRate} suffix="%"/>
      </div>

      {/* Results */}
      {result&&(
        <div style={{marginTop:32,background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
          <div className="eyebrow" style={{marginBottom:16}}>Results</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:24,alignItems:"start"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,170px),1fr))",gap:20}}>
              {result.mode==="goal"&&(
                <div>
                  <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Required Monthly Deposit</div>
                  <div className="result-value" style={{color:"var(--accent)"}}>{money(result.requiredMonthly)}</div>
                </div>
              )}
              <div>
                <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Final Balance</div>
                <div className="result-value">{money(result.finalBalance)}</div>
              </div>
              <div>
                <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Total Deposited</div>
                <div className="result-value">{money(result.totalDeposited)}</div>
              </div>
              <div>
                <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Interest Earned (Gross)</div>
                <div className="result-value">{money(result.grossInterest)}</div>
              </div>
              {tax>0&&<>
                <div>
                  <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Tax on Interest ({tax}%)</div>
                  <div className="result-value" style={{color:"#8a5a3a"}}>− {money(result.totalTax)}</div>
                </div>
                <div>
                  <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>After-Tax Interest</div>
                  <div className="result-value" style={{color:"#176b4d"}}>{money(result.netInterest)}</div>
                </div>
              </>}
            </div>
            {/* Pie chart */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,minWidth:160}}>
              <SvgPie principal={piePrincipal} interest={Math.max(0,pieInterest)}/>
              <div style={{display:"flex",gap:12,fontSize:12,fontWeight:650}}>
                <span style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{width:10,height:10,borderRadius:2,background:"#176b4d",display:"inline-block"}}/>Principal
                </span>
                <span style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{width:10,height:10,borderRadius:2,background:"#b2cfc4",display:"inline-block"}}/>Interest
                </span>
              </div>
            </div>
          </div>

          {/* Table toggle */}
          <div style={{marginTop:20}}>
            <button type="button" style={tableBtnStyle} onClick={()=>setShowTable(s=>!s)}>
              {showTable?"Hide":"View"} Year-by-Year Breakdown
            </button>
          </div>
        </div>
      )}

      {/* Year-by-year table */}
      {showTable&&result&&(
        <div style={{marginTop:18,overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{background:"var(--wash)",borderBottom:"2px solid var(--line)"}}>
                <th style={{...thStyle,textAlign:"left"}}>Year</th>
                <th style={thStyle}>Opening Balance</th>
                <th style={thStyle}>Contributions</th>
                <th style={thStyle}>Gross Interest</th>
                {tax>0&&<th style={thStyle}>Tax ({tax}%)</th>}
                <th style={thStyle}>Closing Balance</th>
              </tr>
            </thead>
            <tbody>
              {result.schedule.map((row,idx)=>(
                <tr key={row.year} style={{borderBottom:"1px solid var(--line)",background:idx%2===0?"white":"#f9fcfa"}}>
                  <td style={{padding:"10px 14px",fontWeight:700}}>Year {row.year}</td>
                  <td style={tdStyle}>{money(row.openingBalance)}</td>
                  <td style={{...tdStyle,color:"#176b4d"}}>{money(row.deposited+(idx===0?0:0))}</td>
                  <td style={{...tdStyle,color:"#8a5a3a"}}>{money(row.grossInterest)}</td>
                  {tax>0&&<td style={{...tdStyle,color:"#c0392b"}}>− {money(row.taxOnInterest)}</td>}
                  <td style={{...tdStyle,fontWeight:700}}>{money(row.closingBalance)}</td>
                </tr>
              ))}
              {/* Totals row */}
              <tr style={{borderTop:"2px solid var(--line)",background:"var(--wash)",fontWeight:700}}>
                <td style={{padding:"10px 14px"}}>Total</td>
                <td style={tdStyle}/>
                <td style={{...tdStyle,color:"#176b4d"}}>{money(result.totalDeposited)}</td>
                <td style={{...tdStyle,color:"#8a5a3a"}}>{money(result.grossInterest)}</td>
                {tax>0&&<td style={{...tdStyle,color:"#c0392b"}}>− {money(result.totalTax)}</td>}
                <td style={{...tdStyle,fontWeight:700}}>{money(result.finalBalance)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <p style={{fontSize:12,lineHeight:1.6,color:"var(--muted)",marginTop:20}}>
        Results are estimates based on compound monthly interest. Actual returns may vary. Not financial advice.
      </p>
    </section>
  );
}
