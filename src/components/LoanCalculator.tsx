"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";

type Mode="amortized"|"deferred"|"bond";
type CompoundKey="annually"|"semi-annually"|"quarterly"|"monthly"|"semi-monthly"|"biweekly"|"weekly"|"daily"|"continuously";
type PayFreqKey="daily"|"weekly"|"biweekly"|"semi-monthly"|"monthly"|"quarterly"|"semi-annually"|"annually";

const COMP_PERIODS:Record<CompoundKey,number>={
  "annually":1,"semi-annually":2,"quarterly":4,"monthly":12,
  "semi-monthly":24,"biweekly":26,"weekly":52,"daily":365,"continuously":Infinity
};
const PAY_PERIODS:Record<PayFreqKey,number>={
  "daily":365,"weekly":52,"biweekly":26,"semi-monthly":24,
  "monthly":12,"quarterly":4,"semi-annually":2,"annually":1
};
const PAY_LABELS:Record<PayFreqKey,string>={
  "daily":"Every Day","weekly":"Every Week","biweekly":"Every 2 Weeks",
  "semi-monthly":"Every Half Month","monthly":"Every Month","quarterly":"Every Quarter",
  "semi-annually":"Every 6 Months","annually":"Every Year"
};
// Label like "Payment Every Month" matching calculator.net format
const PAY_NOUN:Record<PayFreqKey,string>={
  "daily":"Day","weekly":"Week","biweekly":"2 Weeks",
  "semi-monthly":"Half Month","monthly":"Month","quarterly":"Quarter",
  "semi-annually":"6 Months","annually":"Year"
};
const COMP_LABELS:Record<CompoundKey,string>={
  "annually":"Annually (APY)","semi-annually":"Semi-annually","quarterly":"Quarterly",
  "monthly":"Monthly (APR)","semi-monthly":"Semi-monthly","biweekly":"Biweekly",
  "weekly":"Weekly","daily":"Daily","continuously":"Continuously"
};

const fmt=new Intl.NumberFormat("en-IN",{maximumFractionDigits:2});
const money=(x:number)=>Number.isFinite(x)?"₹"+fmt.format(x):"—";

function effectiveRatePerPeriod(annualRate:number,compKey:CompoundKey,payPerYear:number):number{
  const r=annualRate/100;
  const c=COMP_PERIODS[compKey];
  if(c===Infinity) return Math.exp(r/payPerYear)-1;
  return Math.pow(1+r/c,c/payPerYear)-1;
}

function effectiveAnnualRate(annualRate:number,compKey:CompoundKey):number{
  const r=annualRate/100;
  const c=COMP_PERIODS[compKey];
  if(c===Infinity) return Math.exp(r)-1;
  return Math.pow(1+r/c,c)-1;
}

type AmortRow={period:number;payment:number;principal:number;interest:number;balance:number};

function amortize(principal:number,ratePerPeriod:number,totalPeriods:number,payment:number):AmortRow[]{
  const rows:AmortRow[]=[];
  let balance=principal;
  for(let i=1;i<=totalPeriods&&balance>0.005;i++){
    const interest=balance*ratePerPeriod;
    const prin=Math.min(payment-interest,balance);
    balance=Math.max(0,balance-prin);
    rows.push({period:i,payment:prin+interest,principal:prin,interest,balance});
  }
  return rows;
}

// Deferred / Bond schedule: one row per year showing accrued balance
function buildGrowthSchedule(principal:number,ear:number,totalYears:number):{year:number;balance:number;interestAccrued:number}[]{
  const rows=[];
  const wholeYears=Math.ceil(totalYears);
  for(let y=1;y<=wholeYears;y++){
    const t=Math.min(y,totalYears);
    const balance=principal*Math.pow(1+ear,t);
    rows.push({year:y,balance,interestAccrued:balance-principal});
  }
  return rows;
}

function SvgPie({principal,interest}:{principal:number;interest:number}){
  const total=principal+interest;
  if(total<=0||!Number.isFinite(total))return null;
  const pRatio=Math.max(0,Math.min(1,principal/total));
  const cx=90,cy=90,r=75;
  const angle=pRatio*2*Math.PI;
  // avoid degenerate full-circle path
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

function NumInput({label,value,onChange,suffix}:{label:string;value:string;onChange:(v:string)=>void;suffix?:string}){
  return(
    <label style={{display:"block"}}>
      <span style={{display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8}}>{label}</span>
      <span style={{display:"flex",position:"relative",alignItems:"center"}}>
        <input
          className="field-input"
          type="text"
          inputMode="decimal"
          value={value}
          onChange={e=>onChange(e.currentTarget.value)}
          onBlur={e=>{const n=parseFloat(e.currentTarget.value);if(Number.isFinite(n))onChange(String(n));}}
          style={{paddingRight:suffix?`${Math.max(suffix.length*7+16,40)}px`:"13px"}}
        />
        {suffix&&<span aria-hidden style={{position:"absolute",right:12,fontSize:12,color:"var(--muted)",pointerEvents:"none"}}>{suffix}</span>}
      </span>
    </label>
  );
}

function SelectInput({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:Record<string,string>}){
  return(
    <label style={{display:"block"}}>
      <span style={{display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8}}>{label}</span>
      <select
        value={value}
        onChange={e=>onChange(e.currentTarget.value)}
        style={{display:"block",width:"100%",border:"1px solid #cbd8cf",borderRadius:10,padding:"12px 13px",background:"#fff",color:"var(--ink)",outline:"none",fontSize:"inherit",cursor:"pointer"}}
      >
        {Object.entries(options).map(([k,v])=><option key={k} value={k}>{v}</option>)}
      </select>
    </label>
  );
}

type YearlySummary={year:number;payment:number;principal:number;interest:number;balance:number;rows:AmortRow[]};

function groupByYear(rows:AmortRow[],payPerYear:number):YearlySummary[]{
  const map=new Map<number,AmortRow[]>();
  for(const r of rows){
    const yr=Math.ceil(r.period/payPerYear);
    if(!map.has(yr))map.set(yr,[]);
    map.get(yr)!.push(r);
  }
  return Array.from(map.entries()).map(([year,rs])=>({
    year,
    payment:rs.reduce((s,r)=>s+r.payment,0),
    principal:rs.reduce((s,r)=>s+r.principal,0),
    interest:rs.reduce((s,r)=>s+r.interest,0),
    balance:rs[rs.length-1].balance,
    rows:rs,
  }));
}

const tableBtnStyle:React.CSSProperties={
  background:"none",border:"1px solid var(--line)",borderRadius:10,
  padding:"9px 16px",cursor:"pointer",fontWeight:700,fontSize:13,color:"var(--accent)"
};
const thStyle:React.CSSProperties={padding:"10px 14px",textAlign:"right",fontWeight:750,color:"var(--muted)",whiteSpace:"nowrap"};
const tdStyle:React.CSSProperties={padding:"10px 14px",textAlign:"right"};

export default function LoanCalculator({calculator}:{calculator:CalculatorDefinition}){
  const [mode,setMode]=useState<Mode>("amortized");
  const [principal,setPrincipal]=useState("2500000");
  const [termYears,setTermYears]=useState("20");
  const [termMonths,setTermMonths]=useState("0");
  const [rate,setRate]=useState("8.5");
  const [compound,setCompound]=useState<CompoundKey>("monthly");
  const [payFreq,setPayFreq]=useState<PayFreqKey>("monthly");
  const [dueAmount,setDueAmount]=useState("3000000");
  const [showTable,setShowTable]=useState(false);
  const [expandedYears,setExpandedYears]=useState<Set<number>>(new Set());

  const p=parseFloat(principal)||0;
  const r=parseFloat(rate)||0;
  const ty=parseInt(termYears)||0;
  const tm=parseInt(termMonths)||0;
  const totalYears=ty+tm/12;
  const da=parseFloat(dueAmount)||0;

  const result=useMemo(()=>{
    if(mode==="amortized"){
      const payPerYear=PAY_PERIODS[payFreq];
      const rPerPeriod=effectiveRatePerPeriod(r,compound,payPerYear);
      const n=Math.round(totalYears*payPerYear);
      if(n<=0||p<=0)return null;
      const payment=rPerPeriod===0?p/n:p*rPerPeriod*Math.pow(1+rPerPeriod,n)/(Math.pow(1+rPerPeriod,n)-1);
      const totalPayment=payment*n;
      const totalInterest=totalPayment-p;
      const rows=amortize(p,rPerPeriod,n,payment);
      return{type:"amortized" as const,payment,totalPayment,totalInterest,rows,payPerYear,n};
    }
    if(mode==="deferred"){
      const ear=effectiveAnnualRate(r,compound);
      const maturity=p*Math.pow(1+ear,totalYears);
      const schedule=buildGrowthSchedule(p,ear,totalYears);
      return{type:"deferred" as const,maturity,totalInterest:maturity-p,schedule};
    }
    // bond
    const ear=effectiveAnnualRate(r,compound);
    const pv=da/Math.pow(1+ear,totalYears);
    const schedule=buildGrowthSchedule(pv,ear,totalYears);
    return{type:"bond" as const,pv,totalInterest:da-pv,dueAmount:da,schedule};
  },[mode,p,r,compound,payFreq,totalYears,da]);

  const yearlySummary=useMemo(()=>{
    if(result?.type!=="amortized")return[];
    return groupByYear(result.rows,result.payPerYear);
  },[result]);

  const toggleYear=(yr:number)=>{
    setExpandedYears(prev=>{const n=new Set(prev);n.has(yr)?n.delete(yr):n.add(yr);return n;});
  };

  const tabs:Array<{key:Mode;label:string;sublabel:string;desc:string}>=[
    {key:"amortized",label:"Amortized Loan",sublabel:"Paying Back a Fixed Amount Periodically",desc:"Use this calculator for basic calculations of common loan types such as mortgages, auto loans, student loans, or personal loans."},
    {key:"deferred",label:"Deferred Payment Loan",sublabel:"Paying Back a Lump Sum Due at Maturity",desc:"A deferred payment loan is one where the borrower is allowed to make no payments for a period of time."},
    {key:"bond",label:"Bond",sublabel:"Paying Back a Predetermined Amount Due at Loan Maturity",desc:"A bond is a form of debt where the issuer (borrower) agrees to pay the bondholder a fixed amount at maturity."},
  ];

  const inputGrid:React.CSSProperties={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))",gap:18};

  const piePrincipal=result?.type==="amortized"?p:result?.type==="bond"?(result.pv??0):p;
  const pieInterest=result?.totalInterest??0;

  return(
    <section className="surface" style={{padding:28}} aria-label="Loan calculator">
      {/* Mode tabs */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
        {tabs.map(t=>(
          <button
            key={t.key}
            type="button"
            onClick={()=>{setMode(t.key);setShowTable(false);setExpandedYears(new Set());}}
            style={{
              padding:"10px 18px",borderRadius:10,border:"1px solid",cursor:"pointer",fontWeight:700,fontSize:14,
              background:mode===t.key?"var(--accent)":"white",
              color:mode===t.key?"white":"var(--ink)",
              borderColor:mode===t.key?"var(--accent)":"var(--line)",
              transition:"all .15s",textAlign:"left",lineHeight:1.3
            }}
          >
            <div>{t.label}</div>
            <div style={{fontSize:11,fontWeight:500,opacity:.8}}>{t.sublabel}</div>
          </button>
        ))}
      </div>
      <p style={{fontSize:13,color:"var(--muted)",marginBottom:24}}>
        {tabs.find(t=>t.key===mode)?.desc}
      </p>

      {/* Inputs */}
      <div style={inputGrid}>
        {mode==="bond"?(
          <NumInput label="Predetermined Due Amount" value={dueAmount} onChange={setDueAmount} suffix="₹"/>
        ):(
          <NumInput label="Loan Amount" value={principal} onChange={setPrincipal} suffix="₹"/>
        )}
        <label style={{display:"block"}}>
          <span style={{display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8}}>Loan Term</span>
          <span style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <span style={{display:"flex",position:"relative",alignItems:"center"}}>
              <input className="field-input" type="text" inputMode="numeric" value={termYears}
                onChange={e=>setTermYears(e.currentTarget.value)}
                onBlur={e=>{const n=parseInt(e.currentTarget.value);if(Number.isFinite(n))setTermYears(String(Math.max(0,n)));}}
                style={{paddingRight:52}}/>
              <span aria-hidden style={{position:"absolute",right:10,fontSize:12,color:"var(--muted)",pointerEvents:"none"}}>years</span>
            </span>
            <span style={{display:"flex",position:"relative",alignItems:"center"}}>
              <input className="field-input" type="text" inputMode="numeric" value={termMonths}
                onChange={e=>setTermMonths(e.currentTarget.value)}
                onBlur={e=>{const n=parseInt(e.currentTarget.value);if(Number.isFinite(n))setTermMonths(String(Math.max(0,Math.min(11,n))));}}
                style={{paddingRight:56}}/>
              <span aria-hidden style={{position:"absolute",right:10,fontSize:12,color:"var(--muted)",pointerEvents:"none"}}>months</span>
            </span>
          </span>
        </label>
        <NumInput label="Interest Rate" value={rate} onChange={setRate} suffix="%"/>
        <SelectInput label="Compound" value={compound} onChange={v=>setCompound(v as CompoundKey)} options={COMP_LABELS}/>
        {mode==="amortized"&&(
          <SelectInput label="Pay Back" value={payFreq} onChange={v=>setPayFreq(v as PayFreqKey)} options={PAY_LABELS}/>
        )}
      </div>

      {/* Results */}
      {result&&(
        <div style={{marginTop:32,background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
          <div className="eyebrow" style={{marginBottom:16}}>Results</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:24,alignItems:"start",flexWrap:"wrap"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,190px),1fr))",gap:20}}>
              {result.type==="amortized"&&<>
                <div>
                  <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Payment {PAY_NOUN[payFreq]?`Every ${PAY_NOUN[payFreq]}`:""}</div>
                  <div className="result-value">{money(result.payment)}</div>
                </div>
                <div>
                  <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Total of {result.n} Payments</div>
                  <div className="result-value">{money(result.totalPayment)}</div>
                </div>
                <div>
                  <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Total Interest</div>
                  <div className="result-value">{money(result.totalInterest)}</div>
                </div>
              </>}
              {result.type==="deferred"&&<>
                <div>
                  <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Amount Due at Loan Maturity</div>
                  <div className="result-value">{money(result.maturity)}</div>
                </div>
                <div>
                  <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Total Interest</div>
                  <div className="result-value">{money(result.totalInterest)}</div>
                </div>
              </>}
              {result.type==="bond"&&<>
                <div>
                  <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Amount Received When the Loan Starts</div>
                  <div className="result-value">{money(result.pv)}</div>
                </div>
                <div>
                  <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Total Interest</div>
                  <div className="result-value">{money(result.totalInterest)}</div>
                </div>
              </>}
            </div>
            {/* Pie chart */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,minWidth:160}}>
              <SvgPie principal={piePrincipal} interest={pieInterest}/>
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
            <button type="button" style={tableBtnStyle}
              onClick={()=>setShowTable(s=>!s)}>
              {showTable?"Hide":"View"} {result.type==="amortized"?"Amortization":"Schedule"} Table
            </button>
          </div>
        </div>
      )}

      {/* Amortized table */}
      {showTable&&result?.type==="amortized"&&(
        <div style={{marginTop:18,overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{background:"var(--wash)",borderBottom:"2px solid var(--line)"}}>
                <th style={{...thStyle,textAlign:"left"}}>Year</th>
                <th style={thStyle}>Payment</th>
                <th style={thStyle}>Principal</th>
                <th style={thStyle}>Interest</th>
                <th style={thStyle}>Balance</th>
                <th style={{padding:"10px 14px",width:36}}/>
              </tr>
            </thead>
            <tbody>
              {yearlySummary.map(ys=>(
                <>
                  <tr key={`y${ys.year}`} onClick={()=>toggleYear(ys.year)}
                    style={{borderBottom:"1px solid var(--line)",cursor:"pointer",background:expandedYears.has(ys.year)?"#f0f7f3":"white"}}>
                    <td style={{padding:"10px 14px",fontWeight:750}}>Year {ys.year}</td>
                    <td style={tdStyle}>{money(ys.payment)}</td>
                    <td style={{...tdStyle,color:"#176b4d"}}>{money(ys.principal)}</td>
                    <td style={{...tdStyle,color:"#8a5a3a"}}>{money(ys.interest)}</td>
                    <td style={tdStyle}>{money(ys.balance)}</td>
                    <td style={{padding:"10px 14px",textAlign:"center",color:"var(--muted)",fontSize:11}}>{expandedYears.has(ys.year)?"▲":"▼"}</td>
                  </tr>
                  {expandedYears.has(ys.year)&&ys.rows.map(row=>(
                    <tr key={`p${row.period}`} style={{borderBottom:"1px solid #f0f5f2",background:"#f9fcfa"}}>
                      <td style={{padding:"7px 14px 7px 28px",color:"var(--muted)"}}>Period {row.period}</td>
                      <td style={tdStyle}>{money(row.payment)}</td>
                      <td style={{...tdStyle,color:"#176b4d"}}>{money(row.principal)}</td>
                      <td style={{...tdStyle,color:"#8a5a3a"}}>{money(row.interest)}</td>
                      <td style={tdStyle}>{money(row.balance)}</td>
                      <td/>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Deferred / Bond schedule table */}
      {showTable&&result&&result.type!=="amortized"&&(
        <div style={{marginTop:18,overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{background:"var(--wash)",borderBottom:"2px solid var(--line)"}}>
                <th style={{...thStyle,textAlign:"left"}}>Year</th>
                <th style={thStyle}>Balance</th>
                <th style={thStyle}>Interest Accrued</th>
              </tr>
            </thead>
            <tbody>
              {result.schedule.map(row=>(
                <tr key={row.year} style={{borderBottom:"1px solid var(--line)"}}>
                  <td style={{padding:"10px 14px",fontWeight:650}}>Year {row.year}</td>
                  <td style={tdStyle}>{money(row.balance)}</td>
                  <td style={{...tdStyle,color:"#8a5a3a"}}>{money(row.interestAccrued)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{fontSize:12,lineHeight:1.6,color:"var(--muted)",marginTop:20}}>
        Results are estimates. Check important decisions using a qualified financial professional.
      </p>
    </section>
  );
}
