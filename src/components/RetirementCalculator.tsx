"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";
import {IN,type Currency} from "@/lib/calculators/engine";

const isUS=(cur:Currency)=>cur.locale==="en-US";

function makeFmt(currency:Currency){
  const fmt=new Intl.NumberFormat(currency.locale,{maximumFractionDigits:2});
  const fmtN=(x:number,d=2)=>Number.isFinite(x)?new Intl.NumberFormat(currency.locale,{maximumFractionDigits:d}).format(x):"—";
  const money=(x:number)=>Number.isFinite(x)?currency.sym+fmt.format(x):"—";
  return{money,fmtN};
}

function NumInput({
  label,value,onChange,prefix,suffix,min=0,step=1,
  hint
}:{label:string;value:string;onChange:(v:string)=>void;prefix?:string;suffix?:string;min?:number;step?:number;hint?:string}){
  return(
    <label style={{display:"block"}}>
      <span style={{display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8}}>{label}</span>
      {hint&&<span style={{display:"block",fontSize:11,color:"var(--muted)",marginBottom:6}}>{hint}</span>}
      <span style={{display:"flex",position:"relative",alignItems:"center"}}>
        {prefix&&<span aria-hidden style={{position:"absolute",left:12,fontSize:13,color:"var(--muted)",pointerEvents:"none",zIndex:1}}>{prefix}</span>}
        <input
          className="field-input"
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={e=>onChange(e.currentTarget.value)}
          style={{paddingLeft:prefix?28:13,paddingRight:suffix?`${Math.max(suffix.length*8+16,40)}px`:"13px"}}
        />
        {suffix&&<span aria-hidden style={{position:"absolute",right:12,fontSize:12,color:"var(--muted)",pointerEvents:"none"}}>{suffix}</span>}
      </span>
    </label>
  );
}

interface YearRow{
  age:number;
  year:number;
  contributions:number;
  employerMatch:number;
  balance:number;
  totalContributed:number;
}

function buildSchedule(
  currentAge:number,
  retirementAge:number,
  currentSavings:number,
  monthlyContrib:number,
  annualReturn:number,
  // US employer match params
  employerMatchPct:number,
  matchUpToPct:number,
  annualSalary:number,
  useEmployerMatch:boolean,
):YearRow[]{
  const rows:YearRow[]=[];
  let balance=currentSavings;
  let totalContributed=currentSavings;
  const years=Math.max(0,retirementAge-currentAge);
  const monthly=annualReturn/1200;
  const curYear=new Date().getFullYear();

  for(let i=0;i<years;i++){
    const age=currentAge+i+1;
    const annualContrib=monthlyContrib*12;
    let employerMatch=0;
    if(useEmployerMatch&&annualSalary>0&&matchUpToPct>0&&employerMatchPct>0){
      const maxMatchableSalary=annualSalary*matchUpToPct/100;
      const employeeEffective=Math.min(annualContrib,maxMatchableSalary);
      employerMatch=employeeEffective*employerMatchPct/100;
    }
    // compound monthly for the year
    const totalMonthlyDeposit=(annualContrib+employerMatch)/12;
    if(monthly===0){
      balance+=totalMonthlyDeposit*12;
    }else{
      // FV of existing balance grown 12 months + FV of monthly deposits
      balance=balance*Math.pow(1+monthly,12)+totalMonthlyDeposit*((Math.pow(1+monthly,12)-1)/monthly);
    }
    totalContributed+=annualContrib+employerMatch;
    rows.push({age,year:curYear+i+1,contributions:annualContrib,employerMatch,balance,totalContributed});
  }
  return rows;
}

function SvgProgressBar({current,projected}:{current:number;projected:number}){
  const total=Math.max(projected,current,1);
  const cPct=Math.min(current/total,1);
  const pPct=1;
  const W=400,H=70;
  return(
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-hidden="true" style={{display:"block",maxWidth:W}}>
      {/* projected bar background */}
      <rect x={0} y={18} width={W} height={22} rx={8} fill="#e4efea"/>
      {/* projected bar fill */}
      <rect x={0} y={18} width={W*pPct} height={22} rx={8} fill="#b2cfc4"/>
      {/* current savings bar */}
      {cPct>0.02&&(
        <rect x={0} y={18} width={W*cPct} height={22} rx={8} fill="#176b4d"/>
      )}
      {/* label current */}
      <text x={4} y={13} fontSize={10} fontWeight={700} fill="#176b4d">Current savings</text>
      {/* label projected */}
      <text x={W} y={13} fontSize={10} fontWeight={700} fill="#6b8f80" textAnchor="end">At retirement</text>
      {/* percent label inside bar */}
      {cPct>0.08&&(
        <text x={W*cPct/2} y={33} dominantBaseline="middle" textAnchor="middle" fontSize={10} fontWeight={700} fill="white">
          {Math.round(cPct*100)}%
        </text>
      )}
    </svg>
  );
}

export default function RetirementCalculator({calculator,currency=IN}:{calculator:CalculatorDefinition;currency?:Currency}){
  const {money,fmtN}=makeFmt(currency);
  const us=isUS(currency);

  // Core inputs
  const [currentAge,setCurrentAge]=useState("30");
  const [retirementAge,setRetirementAge]=useState("60");
  const [currentSavings,setCurrentSavings]=useState(us?"50000":"500000");
  const [monthlyContrib,setMonthlyContrib]=useState(us?"500":"5000");
  const [annualReturn,setAnnualReturn]=useState("8");

  // US employer match
  const [employerMatchPct,setEmployerMatchPct]=useState("50");
  const [matchUpToPct,setMatchUpToPct]=useState("6");
  const [annualSalary,setAnnualSalary]=useState("80000");

  // Withdrawal
  const [withdrawYears,setWithdrawYears]=useState("20");
  const [safeWithdrawRate,setSafeWithdrawRate]=useState("4");

  // UI
  const [showSchedule,setShowSchedule]=useState(false);

  const cAge=Math.max(0,parseInt(currentAge)||0);
  const rAge=Math.max(cAge+1,parseInt(retirementAge)||65);
  const savings=parseFloat(currentSavings)||0;
  const contrib=parseFloat(monthlyContrib)||0;
  const retRate=parseFloat(annualReturn)||0;
  const empMatch=parseFloat(employerMatchPct)||0;
  const matchUp=parseFloat(matchUpToPct)||0;
  const salary=parseFloat(annualSalary)||0;
  const wYears=Math.max(1,parseInt(withdrawYears)||20);
  const swr=parseFloat(safeWithdrawRate)||4;

  const schedule=useMemo(()=>buildSchedule(
    cAge,rAge,savings,contrib,retRate,
    empMatch,matchUp,salary,us
  ),[cAge,rAge,savings,contrib,retRate,empMatch,matchUp,salary,us]);

  const yearsUntilRetirement=Math.max(0,rAge-cAge);
  const totalAtRetirement=schedule.length>0?schedule[schedule.length-1].balance:savings;
  const totalContributed=schedule.length>0?schedule[schedule.length-1].totalContributed:savings;
  const totalGrowth=totalAtRetirement-totalContributed;

  // Monthly withdrawal income using annuity formula
  const monthlyWithdrawRate=retRate/1200;
  const withdrawPeriods=wYears*12;
  let monthlyIncome=0;
  if(totalAtRetirement>0&&withdrawPeriods>0){
    if(monthlyWithdrawRate===0){
      monthlyIncome=totalAtRetirement/withdrawPeriods;
    }else{
      monthlyIncome=totalAtRetirement*monthlyWithdrawRate*Math.pow(1+monthlyWithdrawRate,withdrawPeriods)
        /(Math.pow(1+monthlyWithdrawRate,withdrawPeriods)-1);
    }
  }

  // Safe withdrawal rate monthly
  const swrMonthly=totalAtRetirement*swr/100/12;

  const inputGrid:React.CSSProperties={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))",gap:18};

  return(
    <section className="surface" style={{padding:28}} aria-label="Retirement calculator">
      {/* Core inputs */}
      <div className="eyebrow" style={{marginBottom:16}}>Retirement Details</div>
      <div style={inputGrid}>
        <NumInput label="Current Age" value={currentAge} onChange={setCurrentAge} suffix="yrs" min={1}/>
        <NumInput label="Retirement Age" value={retirementAge} onChange={setRetirementAge} suffix="yrs" min={1}/>
        <NumInput
          label="Current Savings"
          value={currentSavings}
          onChange={setCurrentSavings}
          prefix={currency.sym}
          hint={us?undefined:"Includes EPF balance, mutual funds, FDs, etc."}
        />
        <NumInput
          label="Monthly Contribution"
          value={monthlyContrib}
          onChange={setMonthlyContrib}
          prefix={currency.sym}
          hint={us?undefined:"Your monthly EPF + voluntary PF + SIP etc."}
        />
        <NumInput label="Expected Annual Return" value={annualReturn} onChange={setAnnualReturn} suffix="%" step={0.1}/>
      </div>

      {/* US employer match section */}
      {us&&(
        <>
          <div className="eyebrow" style={{marginTop:28,marginBottom:16}}>Employer Match (optional)</div>
          <div style={inputGrid}>
            <NumInput label="Annual Salary" value={annualSalary} onChange={setAnnualSalary} prefix={currency.sym}/>
            <NumInput label="Employer Match" value={employerMatchPct} onChange={setEmployerMatchPct} suffix="% of contribution"/>
            <NumInput label="Match Up To" value={matchUpToPct} onChange={setMatchUpToPct} suffix="% of salary"
              hint="E.g. 50% match up to 6% of salary"/>
          </div>
        </>
      )}

      {/* Results */}
      <div style={{marginTop:32,background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
        <div className="eyebrow" style={{marginBottom:16}}>Projection Summary</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,160px),1fr))",gap:18,marginBottom:24}}>
          <div>
            <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Total at Retirement</div>
            <div className="result-value">{money(totalAtRetirement)}</div>
          </div>
          <div>
            <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Total Contributed</div>
            <div className="result-value">{money(totalContributed)}</div>
          </div>
          <div>
            <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Total Growth (Returns)</div>
            <div className="result-value" style={{color:totalGrowth>=0?"var(--accent)":"#c0392b"}}>{money(totalGrowth)}</div>
          </div>
          <div>
            <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Years Until Retirement</div>
            <div className="result-value">{fmtN(yearsUntilRetirement,0)}</div>
          </div>
        </div>

        {/* Progress bar chart */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:12,color:"var(--muted)",fontWeight:650,marginBottom:10}}>Current savings vs projected corpus</div>
          <SvgProgressBar current={savings} projected={totalAtRetirement}/>
          <div style={{display:"flex",gap:16,marginTop:8,fontSize:12,fontWeight:650}}>
            <span style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{width:10,height:10,borderRadius:2,background:"#176b4d",display:"inline-block"}}/>
              Current ({money(savings)})
            </span>
            <span style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{width:10,height:10,borderRadius:2,background:"#b2cfc4",display:"inline-block"}}/>
              At retirement ({money(totalAtRetirement)})
            </span>
          </div>
        </div>
      </div>

      {/* Withdrawal section */}
      <div style={{marginTop:28,background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
        <div className="eyebrow" style={{marginBottom:16}}>Withdrawal Planning</div>
        <div style={inputGrid}>
          <NumInput label="Withdrawal Period" value={withdrawYears} onChange={setWithdrawYears} suffix="yrs" min={1}/>
          <NumInput label="Safe Withdrawal Rate" value={safeWithdrawRate} onChange={setSafeWithdrawRate} suffix="% / yr" step={0.1}
            hint="Common rule of thumb: 3–4%"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))",gap:18,marginTop:20}}>
          <div>
            <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>
              Monthly Income over {withdrawYears} yrs
            </div>
            <div className="result-value">{money(monthlyIncome)}</div>
            <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>Assumes funds depleted at end of period</div>
          </div>
          <div>
            <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>
              Safe Withdrawal Rate ({safeWithdrawRate}%) / mo
            </div>
            <div className="result-value">{money(swrMonthly)}</div>
            <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>Corpus remains largely intact</div>
          </div>
        </div>
      </div>

      {/* Year-by-year schedule toggle */}
      <div style={{marginTop:24}}>
        <button
          type="button"
          onClick={()=>setShowSchedule(s=>!s)}
          style={{background:"none",border:"1px solid var(--line)",borderRadius:10,padding:"9px 16px",cursor:"pointer",fontWeight:700,fontSize:13,color:"var(--accent)"}}
        >
          {showSchedule?"Hide":"View"} Year-by-Year Schedule
        </button>
      </div>

      {showSchedule&&schedule.length>0&&(
        <div style={{marginTop:18,overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{background:"var(--wash)",borderBottom:"2px solid var(--line)"}}>
                <th style={{padding:"10px 14px",textAlign:"left",fontWeight:750,color:"var(--muted)"}}>Year</th>
                <th style={{padding:"10px 14px",textAlign:"left",fontWeight:750,color:"var(--muted)"}}>Age</th>
                <th style={{padding:"10px 14px",textAlign:"right",fontWeight:750,color:"var(--muted)"}}>Your Contribution</th>
                {us&&<th style={{padding:"10px 14px",textAlign:"right",fontWeight:750,color:"var(--muted)"}}>Employer Match</th>}
                <th style={{padding:"10px 14px",textAlign:"right",fontWeight:750,color:"var(--muted)"}}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map(row=>(
                <tr key={row.year} style={{borderBottom:"1px solid var(--line)"}}>
                  <td style={{padding:"10px 14px",fontWeight:650}}>{row.year}</td>
                  <td style={{padding:"10px 14px"}}>{row.age}</td>
                  <td style={{padding:"10px 14px",textAlign:"right"}}>{money(row.contributions)}</td>
                  {us&&<td style={{padding:"10px 14px",textAlign:"right",color:"#176b4d"}}>{money(row.employerMatch)}</td>}
                  <td style={{padding:"10px 14px",textAlign:"right",fontWeight:700}}>{money(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{fontSize:12,lineHeight:1.6,color:"var(--muted)",marginTop:20}}>
        Projections assume a constant annual return rate. Actual investment returns vary and are not guaranteed.
        This calculator is for illustrative purposes only and does not constitute financial advice.
        {!us&&" EPF rates and tax treatment under Indian regulations may differ from these estimates."}
      </p>
    </section>
  );
}
