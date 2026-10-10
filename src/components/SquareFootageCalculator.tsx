"use client";
import {useState,useMemo} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";
import {IN,US,type Currency} from "@/lib/calculators/engine";

type Shape="rectangle"|"square"|"triangle"|"circle"|"trapezoid"|"ellipse";
type UnitMode="feet"|"metres";

interface Room {
  id:number;
  name:string;
  shape:Shape;
  // dimension values (in whatever unit the user picked)
  a:number; // length / side / base / radius / a-axis
  b:number; // width / height / radius2 / b-axis (not used for square/circle)
  c:number; // only trapezoid second base
}

function calcAreaFt2(room:Room,unit:UnitMode):number{
  const toFt=(v:number)=>unit==="metres"?v*3.28084:v;
  const a=toFt(room.a);
  const b=toFt(room.b);
  const c=toFt(room.c);
  switch(room.shape){
    case"rectangle": return a*b;
    case"square":    return a*a;
    case"triangle":  return 0.5*a*b;
    case"circle":    return Math.PI*a*a;
    case"trapezoid": return 0.5*(a+c)*b;
    case"ellipse":   return Math.PI*a*b;
  }
}

// Conversion constants
const FT2_TO_ACRE   = 1/43560;
const FT2_TO_SQM    = 0.092903;
const FT2_TO_SQYD   = 1/9;          // 1 sq yd = 9 sq ft
const FT2_TO_CENT   = 1/435.6;      // 1 cent = 435.6 sq ft
const FT2_TO_GROUND = 1/2400;       // 1 ground ≈ 2400 sq ft (Tamil Nadu)
const FT2_TO_GAJ    = FT2_TO_SQYD; // gaj = sq yard in north India

let _nextId=1;
function newRoom():Room{
  return{id:_nextId++,name:"Room "+_nextId,shape:"rectangle",a:10,b:12,c:0};
}

const SHAPES:Array<{value:Shape;label:string}> = [
  {value:"rectangle",label:"Rectangle"},
  {value:"square",   label:"Square"},
  {value:"triangle", label:"Triangle (right)"},
  {value:"circle",   label:"Circle"},
  {value:"trapezoid",label:"Trapezoid"},
  {value:"ellipse",  label:"Ellipse"},
];

function DimLabel({children}:{children:React.ReactNode}){
  return <span style={{display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8}}>{children}</span>;
}

function NumInput({value,onChange,min=0,step="any"}:{value:number;onChange:(v:number)=>void;min?:number;step?:string}){
  return(
    <input className="field-input" type="number" min={min} step={step}
      value={value} onChange={e=>onChange(+e.target.value)}
      style={{width:"100%"}}/>
  );
}

function ShapeInputs({room,unit,onChange}:{room:Room;unit:UnitMode;onChange:(r:Partial<Room>)=>void}){
  const u=unit==="metres"?"m":"ft";
  switch(room.shape){
    case"rectangle":
      return(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <label style={{display:"block"}}>
            <DimLabel>Length ({u})</DimLabel>
            <NumInput value={room.a} onChange={v=>onChange({a:v})}/>
          </label>
          <label style={{display:"block"}}>
            <DimLabel>Width ({u})</DimLabel>
            <NumInput value={room.b} onChange={v=>onChange({b:v})}/>
          </label>
        </div>
      );
    case"square":
      return(
        <label style={{display:"block"}}>
          <DimLabel>Side ({u})</DimLabel>
          <NumInput value={room.a} onChange={v=>onChange({a:v})}/>
        </label>
      );
    case"triangle":
      return(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <label style={{display:"block"}}>
            <DimLabel>Base ({u})</DimLabel>
            <NumInput value={room.a} onChange={v=>onChange({a:v})}/>
          </label>
          <label style={{display:"block"}}>
            <DimLabel>Height ({u})</DimLabel>
            <NumInput value={room.b} onChange={v=>onChange({b:v})}/>
          </label>
        </div>
      );
    case"circle":
      return(
        <label style={{display:"block"}}>
          <DimLabel>Radius ({u})</DimLabel>
          <NumInput value={room.a} onChange={v=>onChange({a:v})}/>
        </label>
      );
    case"trapezoid":
      return(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <label style={{display:"block"}}>
            <DimLabel>Base 1 ({u})</DimLabel>
            <NumInput value={room.a} onChange={v=>onChange({a:v})}/>
          </label>
          <label style={{display:"block"}}>
            <DimLabel>Base 2 ({u})</DimLabel>
            <NumInput value={room.c} onChange={v=>onChange({c:v})}/>
          </label>
          <label style={{display:"block"}}>
            <DimLabel>Height ({u})</DimLabel>
            <NumInput value={room.b} onChange={v=>onChange({b:v})}/>
          </label>
        </div>
      );
    case"ellipse":
      return(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <label style={{display:"block"}}>
            <DimLabel>Semi-axis A ({u})</DimLabel>
            <NumInput value={room.a} onChange={v=>onChange({a:v})}/>
          </label>
          <label style={{display:"block"}}>
            <DimLabel>Semi-axis B ({u})</DimLabel>
            <NumInput value={room.b} onChange={v=>onChange({b:v})}/>
          </label>
        </div>
      );
  }
}

function fmtArea(x:number,d=2){
  if(!Number.isFinite(x)||x<0) return "—";
  return x.toLocaleString("en",{maximumFractionDigits:d});
}

export default function SquareFootageCalculator({
  calculator,
  currency=US,
}:{
  calculator:CalculatorDefinition;
  currency?:Currency;
}){
  const isIndia=currency===IN||currency.sym==="₹";
  const [unit,setUnit]=useState<UnitMode>("feet");
  const [rooms,setRooms]=useState<Room[]>([newRoom()]);
  const [pricePerSqFt,setPricePerSqFt]=useState<number>(0);

  const fmt=(x:number)=>Number.isFinite(x)?`${currency.sym}${x.toLocaleString(currency.locale,{maximumFractionDigits:2})}`:"—";

  function updateRoom(id:number,patch:Partial<Room>){
    setRooms(prev=>prev.map(r=>r.id===id?{...r,...patch}:r));
  }
  function addRoom(){
    setRooms(prev=>[...prev,newRoom()]);
  }
  function removeRoom(id:number){
    setRooms(prev=>prev.length>1?prev.filter(r=>r.id!==id):prev);
  }

  const roomAreas=useMemo(()=>
    rooms.map(r=>({id:r.id,sqft:calcAreaFt2(r,unit)})),
    [rooms,unit]
  );

  const totalSqFt=useMemo(()=>
    roomAreas.reduce((s,r)=>s+r.sqft,0),
    [roomAreas]
  );

  const totalSqM    = totalSqFt*FT2_TO_SQM;
  const totalAcre   = totalSqFt*FT2_TO_ACRE;
  const totalSqYd   = totalSqFt*FT2_TO_SQYD;
  const totalCent   = totalSqFt*FT2_TO_CENT;
  const totalGround = totalSqFt*FT2_TO_GROUND;

  const propValue = pricePerSqFt>0 ? totalSqFt*pricePerSqFt : 0;

  const accent="var(--accent)";

  return(
    <div style={{maxWidth:760,margin:"0 auto",display:"flex",flexDirection:"column",gap:24}}>

      {/* Unit mode toggle — India only */}
      {isIndia&&(
        <div style={{display:"flex",alignItems:"center",gap:0,background:"var(--wash)",borderRadius:12,padding:4,width:"fit-content",border:"1px solid var(--line)"}}>
          {(["feet","metres"] as const).map(u=>(
            <button key={u} type="button" onClick={()=>setUnit(u)}
              style={{padding:"8px 20px",borderRadius:9,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,
                background:unit===u?"white":"transparent",
                color:unit===u?"var(--ink)":"var(--muted)",
                boxShadow:unit===u?"0 1px 4px rgba(0,0,0,.12)":"none",
                transition:"all .15s"}}>
              {u==="feet"?"Feet":"Metres"}
            </button>
          ))}
        </div>
      )}

      {/* Room cards */}
      {rooms.map((room,idx)=>{
        const roomSqFt=roomAreas.find(r=>r.id===room.id)?.sqft??0;
        return(
          <div key={room.id} className="surface" style={{padding:20,borderRadius:14}}>
            {/* Header row */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,gap:8}}>
              <input
                className="field-input"
                type="text"
                value={room.name}
                onChange={e=>updateRoom(room.id,{name:e.target.value})}
                style={{fontWeight:700,fontSize:15,width:"auto",flexGrow:1,maxWidth:200}}
              />
              <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
                <span style={{fontSize:13,color:"var(--muted)",fontWeight:600}}>
                  {fmtArea(roomSqFt)} sq {unit==="metres"&&!isIndia?"m":"ft"}
                  {isIndia&&unit==="metres"?` / ${fmtArea(roomSqFt)} sq ft`:""}
                </span>
                {rooms.length>1&&(
                  <button type="button" onClick={()=>removeRoom(room.id)}
                    style={{background:"none",border:"1px solid var(--line)",borderRadius:7,
                      padding:"4px 10px",fontSize:13,color:"var(--muted)",cursor:"pointer"}}>
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Shape selector */}
            <div style={{marginBottom:14}}>
              <DimLabel>Shape</DimLabel>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {SHAPES.map(s=>(
                  <button key={s.value} type="button"
                    onClick={()=>updateRoom(room.id,{shape:s.value})}
                    style={{padding:"6px 14px",borderRadius:8,border:"1px solid",cursor:"pointer",fontSize:13,fontWeight:650,
                      borderColor:room.shape===s.value?accent:"var(--line)",
                      background:room.shape===s.value?"var(--accent)":"transparent",
                      color:room.shape===s.value?"white":"var(--ink)",
                      transition:"all .12s"}}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimension inputs */}
            <ShapeInputs room={room} unit={unit} onChange={p=>updateRoom(room.id,p)}/>

            {/* Per-room result */}
            {roomSqFt>0&&(
              <div style={{marginTop:14,padding:"10px 14px",background:"var(--wash)",borderRadius:10,
                border:"1px solid #dcebe1",fontSize:13,color:"var(--muted)",fontWeight:600}}>
                Area: <span style={{color:"var(--ink)",fontWeight:700}}>{fmtArea(roomSqFt,2)} sq ft</span>
                {isIndia&&<span style={{marginLeft:14}}>= <span style={{color:"var(--ink)",fontWeight:700}}>{fmtArea(roomSqFt*FT2_TO_SQM,2)} sq m</span></span>}
                {isIndia&&<span style={{marginLeft:14}}>= <span style={{color:"var(--ink)",fontWeight:700}}>{fmtArea(roomSqFt*FT2_TO_SQYD,2)} sq yd</span></span>}
              </div>
            )}
          </div>
        );
      })}

      {/* Add room button */}
      <button type="button" onClick={addRoom}
        style={{alignSelf:"flex-start",padding:"10px 22px",borderRadius:10,border:"2px dashed var(--line)",
          background:"transparent",cursor:"pointer",fontWeight:700,fontSize:14,color:"var(--muted)",
          transition:"border-color .15s,color .15s"}}
        onMouseOver={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=accent;(e.currentTarget as HTMLButtonElement).style.color=accent;}}
        onMouseOut={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor="var(--line)";(e.currentTarget as HTMLButtonElement).style.color="var(--muted)";}}>
        + Add Room / Area
      </button>

      {/* Price per unit */}
      <div className="surface" style={{padding:20,borderRadius:14}}>
        <div className="eyebrow" style={{marginBottom:14}}>Property Value (optional)</div>
        <label style={{display:"block",maxWidth:280}}>
          <span style={{display:"block",color:"#465a50",fontSize:".85rem",fontWeight:650,marginBottom:8}}>
            Price per sq ft ({currency.sym})
          </span>
          <span style={{display:"flex",position:"relative",alignItems:"center"}}>
            <span aria-hidden style={{position:"absolute",left:12,fontSize:13,color:"var(--muted)",pointerEvents:"none",zIndex:1}}>{currency.sym}</span>
            <input className="field-input" type="number" min={0} step="any"
              value={pricePerSqFt||""} onChange={e=>setPricePerSqFt(+e.target.value)}
              placeholder="0" style={{paddingLeft:28}}/>
          </span>
        </label>
      </div>

      {/* Results */}
      {totalSqFt>0&&(
        <div style={{background:"var(--wash)",border:"1px solid #dcebe1",borderRadius:14,padding:22}}>
          <div className="eyebrow" style={{marginBottom:16}}>Total Area — {rooms.length} {rooms.length===1?"room":"rooms"}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,150px),1fr))",gap:18}}>

            <div>
              <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Square Feet</div>
              <div className="result-value">{fmtArea(totalSqFt,2)}</div>
              <div style={{fontSize:12,color:"var(--muted)",marginTop:3}}>sq ft</div>
            </div>

            {isIndia&&(
              <div>
                <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Square Metres</div>
                <div className="result-value">{fmtArea(totalSqM,2)}</div>
                <div style={{fontSize:12,color:"var(--muted)",marginTop:3}}>sq m</div>
              </div>
            )}

            {!isIndia&&(
              <div>
                <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Square Metres</div>
                <div className="result-value">{fmtArea(totalSqM,2)}</div>
                <div style={{fontSize:12,color:"var(--muted)",marginTop:3}}>sq m</div>
              </div>
            )}

            <div>
              <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Acres</div>
              <div className="result-value">{fmtArea(totalAcre,4)}</div>
              <div style={{fontSize:12,color:"var(--muted)",marginTop:3}}>acres</div>
            </div>

            <div>
              <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Square Yards</div>
              <div className="result-value">{fmtArea(totalSqYd,2)}</div>
              <div style={{fontSize:12,color:"var(--muted)",marginTop:3}}>sq yd {isIndia?"/ gaj":""}</div>
            </div>

            {isIndia&&(
              <div>
                <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Cents</div>
                <div className="result-value">{fmtArea(totalCent,4)}</div>
                <div style={{fontSize:12,color:"var(--muted)",marginTop:3}}>cents</div>
              </div>
            )}

            {isIndia&&(
              <div>
                <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Grounds</div>
                <div className="result-value">{fmtArea(totalGround,4)}</div>
                <div style={{fontSize:12,color:"var(--muted)",marginTop:3}}>grounds</div>
              </div>
            )}

            {pricePerSqFt>0&&(
              <div style={{gridColumn:"1/-1",paddingTop:14,borderTop:"1px solid #dcebe1",marginTop:4}}>
                <div style={{fontSize:13,color:"var(--muted)",fontWeight:650,marginBottom:6}}>Total Property Value</div>
                <div className="result-value" style={{color:accent}}>{fmt(propValue)}</div>
                <div style={{fontSize:12,color:"var(--muted)",marginTop:3}}>
                  {fmt(pricePerSqFt)} × {fmtArea(totalSqFt,2)} sq ft
                </div>
              </div>
            )}
          </div>

          {/* Unit conversion reference table */}
          <div style={{marginTop:22,paddingTop:18,borderTop:"1px solid #dcebe1"}}>
            <div style={{fontSize:13,color:"var(--muted)",fontWeight:700,marginBottom:10}}>Unit Conversion Reference</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))",gap:8,fontSize:13}}>
              {[
                {label:"Square Feet",val:fmtArea(totalSqFt,2),unit:"sq ft"},
                {label:"Square Metres",val:fmtArea(totalSqM,2),unit:"sq m"},
                {label:"Square Yards / Gaj",val:fmtArea(totalSqYd,2),unit:"sq yd"},
                {label:"Acres",val:fmtArea(totalAcre,5),unit:"acres"},
                ...(isIndia?[
                  {label:"Cents",val:fmtArea(totalCent,4),unit:"cents"},
                  {label:"Grounds",val:fmtArea(totalGround,4),unit:"grounds"},
                ]:[]),
              ].map(row=>(
                <div key={row.label} style={{display:"flex",justifyContent:"space-between",
                  padding:"7px 12px",background:"white",borderRadius:8,border:"1px solid var(--line)"}}>
                  <span style={{color:"var(--muted)",fontWeight:600}}>{row.label}</span>
                  <span style={{fontWeight:700,color:"var(--ink)"}}>{row.val} <span style={{fontWeight:500,color:"var(--muted)"}}>{row.unit}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
