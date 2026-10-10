"use client";
import {useMemo,useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";
import {IN,US,type Currency} from "@/lib/calculators/engine";

const TERM_OPTIONS:{value:number;label:string}[]=[
  {value:24,label:"24 months (2 yr)"},
  {value:36,label:"36 months (3 yr)"},
  {value:48,label:"48 months (4 yr)"},
  {value:60,label:"60 months (5 yr)"},
  {value:72,label:"72 months (6 yr)"},
  {value:84,label:"84 months (7 yr)"},
];

function makeFmt(currency:Currency){
  const nf=new Intl.NumberFormat(currency.locale,{maximumFractionDigits:2});
  return (x:number)=>Number.isFinite(x)?`${currency.sym}${nf.format(x)}`:"—";
}

function fmtPct(x:number){
  return Number.isFinite(x)?`${x.toLocaleString("en",{maximumFractionDigits:2})}%`:"—";
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

function NumInput({label,value,onChange,prefixSym,suffix,step,min}:{
  label:string;value:string;onChange:(v:string)=>void;
  prefixSym?:string;suffix?:string;step?:string;min?:string;
}){
  return(
    <label style={{display:"block"}}>
      <span style={{display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8}}>{label}</span>
      <span style={{display:"flex",position:"relative",alignItems:"center"}}>
        {prefixSym&&<span aria-hidden style={{position:"absolute",left:12,fontSize:13,color:"var(--muted)",pointerEvents:"none",zIndex:1}}>{prefixSym}</span>}
        <input
          className="field-input"
          type="number"
          value={value}
          step={step??"any"}
          min={min??"0"}
          onChange={e=>onChange(e.currentTarget.value)}
          style={{paddingLeft:prefixSym?28:13,paddingRight:suffix?`${Math.max(suffix.length*7+16,40)}px`:"13px"}}
        />
        {suffix&&<span aria-hidden style={{position:"absolute",right:12,fontSize:12,color:"var(--muted)",pointerEvents:"none"}}>{suffix}</span>}
      </span>
    </label>
  );
}

type AmortRow={period:number;payment:number;principal:number;interest:number;balance:number};

function amortize(principal:number,ratePerMonth:number,termMonths:number,payment:number):AmortRow[]{
  const rows:AmortRow[]=[];
  let balance=principal;
  for(let i=1;i<=termMonths&&balance>0.005;i++){
    const interest=balance*ratePerMonth;
    const prin=Math.min(payment-interest,balance);
    balance=Math.max(0,balance-prin);
    rows.push({period:i,payment:prin+interest,principal:prin,interest,balance});
  }
  return rows;
}

type YearlySummary={year:number;payment:number;principal:number;interest:number;balance:number;rows:AmortRow[]};

function groupByYear(rows:AmortRow[]):YearlySummary[]{
  const map=new Map<number,AmortRow[]>();
  for(const r of rows){
    const yr=Math.ceil(r.period/12);
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

const thStyle:React.CSSProperties={padding:"10px 14px",textAlign:"right",fontWeight:750,color:"var(--muted)",whiteSpace:"nowrap"};
const tdStyle:React.CSSProperties={padding:"10px 14px",textAlign:"right"};
const tableBtnStyle:React.CSSProperties={
  background:"none",border:"1px solid var(--line)",borderRadius:10,
  padding:"9px 16px",cursor:"pointer",fontWeight:700,fontSize:13,color:"var(--accent)"
};

const isUS=(c:Currency)=>c.locale==="en-US";

export default function AutoLoanCalculator({calculator,currency=IN}:{calculator:CalculatorDefinition;currency?:Currency}){
  const money=makeFmt(currency);
  const us=isUS(currency);

  // Common inputs
  const [vehiclePrice,setVehiclePrice]=useState(us?"35000":"1500000");
  const [downPayment,setDownPayment]=useState(us?"5000":"200000");
  const [tradeIn,setTradeIn]=useState("0");
  const [termMonths,setTermMonths]=useState(60);
  const [annualRate,setAnnualRate]=useState(us?"6.5":"9.0");

  // US-only
  const [salesTaxRate,setSalesTaxRate]=useState("8.0");
  const [otherFees,setOtherFees]=useState("500");

  // India on-road toggle
  const [useOnRoad,setUseOnRoad]=useState(false);
  const [rto,setRto]=useState("45000");
  const [insurance,setInsurance]=useState("30000");

  // Table state
  const [showTable,setShowTable]=useState(false);
  const [expandedYears,setExpandedYears]=useState<Set<number>>(new Set());

  const toggleYear=(yr:number)=>{
    setExpandedYears(prev=>{const n=new Set(prev);n.has(yr)?n.delete(yr):n.add(yr);return n;});
  };

  const result=useMemo(()=>{
    const price=parseFloat(vehiclePrice)||0;
    const down=parseFloat(downPayment)||0;
    const trade=parseFloat(tradeIn)||0;
    const rate=(parseFloat(annualRate)||0)/100/12;
    const n=termMonths;

    let loanAmount=price-down-trade;

    if(us){
      const tax=(parseFloat(salesTaxRate)||0)/100;
      const fees=parseFloat(otherFees)||0;
      loanAmount=price*(1+tax)-down-trade+fees;
    } else if(useOnRoad){
      const rtoAmt=parseFloat(rto)||0;
      const insAmt=parseFloat(insurance)||0;
      loanAmount=price+rtoAmt+insAmt-down-trade;
    }

    if(loanAmount<=0||n<=0)return null;

    const payment=rate===0
      ?loanAmount/n
      :loanAmount*rate*Math.pow(1+rate,n)/(Math.pow(1+rate,n)-1);
    const totalPayment=payment*n;
    const totalInterest=totalPayment-loanAmount;
    const rows=amortize(loanAmount,rate,n,payment);

    return{loanAmount,payment,totalPayment,totalInterest,rows};
  },[vehiclePrice,downPayment,tradeIn,termMonths,annualRate,salesTaxRate,otherFees,useOnRoad,rto,insurance,us]);

  const yearlySummary=useMemo(()=>result?groupByYear(result.rows):[],[result]);

  return(
    <section className="surface" style={{padding:28}} aria-label="Auto loan calculator">

      {/* Inputs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))",gap:18,marginBottom:24}}>
        <NumInput label={us?"Vehicle Price":"Ex-Showroom Price"} value={vehiclePrice} onChange={setVehiclePrice} prefixSym={currency.sym}/>
        <NumInput label="Down Payment" value={downPayment} onChange={setDownPayment} prefixSym={currency.sym}/>
        <NumInput label="Trade-In Value" value={tradeIn} onChange={setTradeIn} prefixSym={currency.sym}/>
        <label style={{display:"block"}}>
          <span style={{display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8}}>Loan Term</span>
          <select
            value={termMonths}
            onChange={e=>setTermMonths(+e.currentTarget.value)}
            style={{display:"block",width:"100%",border:"1px solid #cbd8cf",borderRadius:10,padding:"12px 13px",background:"#fff",color:"var(--ink)",outline:"none",fontSize:"inherit",cursor:"pointer"}}
          >
            {TERM_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <NumInput label="Annual Interest Rate" value={annualRate} onChange={setAnnualRate} suffix="%" step="0.1"/>

        {/* US-only fields */}
        {us&&<>
          <NumInput label="Sales Tax Rate" value={salesTaxRate} onChange={setSalesTaxRate} suffix="%"/>
          <NumInput label="Title / Registration Fees" value={otherFees} onChange={setOtherFees} prefixSym={currency.sym}/>
        </>}
      </div>

      {/* India on-road toggle */}
      {!us&&(
        <div style={{marginBottom:24}}>
          <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",userSelect:"none"}}>
            <span style={{
              display:"inline-block",width:42,height:24,borderRadius:12,
              background:useOnRoad?"var(--accent)":"#cbd8cf",
              position:"relative",transition:"background .2s",flexShrink:0
            }}>
              <span style={{
                display:"block",width:18,height:18,borderRadius:9,background:"white",
                position:"absolute",top:3,left:useOnRoad?21:3,transition:"left .2s",
                boxShadow:"0 1px 3px rgba(0,0,0,.2)"
              }}/>
              <input type="checkbox" checked={useOnRoad} onChange={e=>setUseOnRoad(e.currentTarget.checked)}
                style={{position:"absolute",opacity:0,width:0,height:0}}/>
            </span>
            <span style={{fontWeight:650,fontSize:".9rem",color:"#465a50"}}>
              Add on-road charges (RTO + Insurance)
            </span>
          </label>
          {useOnRoad&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))",gap:18,marginTop:16}}>
              <NumInput label="RTO / Registration" value={rto} onChange={setRto} prefixSym={currency.sym}/>
              <NumInput label="Insurance (first year)" value={insurance} onChange={setInsurance} prefixSym={currency.sym}/>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {result&&(
        <div style={{background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
          <div className="eyebrow" style={{marginBottom:16}}>Results</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:24,alignItems:"start"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,160px),1fr))",gap:18}}>
              <div>
                <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Monthly Payment</div>
                <div className="result-value">{money(result.payment)}</div>
              </div>
              <div>
                <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Total Interest</div>
                <div className="result-value">{money(result.totalInterest)}</div>
              </div>
              <div>
                <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Total Cost ({termMonths} payments)</div>
                <div className="result-value">{money(result.totalPayment)}</div>
              </div>
              <div>
                <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Amount Financed</div>
                <div className="result-value">{money(result.loanAmount)}</div>
              </div>
              <div>
                <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Interest Rate (APR)</div>
                <div className="result-value">{fmtPct(parseFloat(annualRate)||0)}</div>
              </div>
            </div>

            {/* Pie chart */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,minWidth:160}}>
              <SvgPie principal={result.loanAmount} interest={result.totalInterest}/>
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

          <div style={{marginTop:20}}>
            <button type="button" style={tableBtnStyle} onClick={()=>setShowTable(s=>!s)}>
              {showTable?"Hide":"View"} Amortization Table
            </button>
          </div>
        </div>
      )}

      {/* Amortization table */}
      {showTable&&result&&(
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
                      <td style={{padding:"7px 14px 7px 28px",color:"var(--muted)"}}>Month {row.period}</td>
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

      <p style={{fontSize:12,lineHeight:1.6,color:"var(--muted)",marginTop:20}}>
        Results are estimates. Actual loan terms may vary. Check important decisions using a qualified financial professional.
      </p>
    </section>
  );
}
