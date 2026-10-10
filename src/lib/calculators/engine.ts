import type {CalculatorDefinition,CalculatorKind} from "@/lib/calculators/catalog";
export type Inputs=Record<string,number>;export type CalculationResult={label:string;value:string;detail?:string};
const n=(x:number,d=2)=>Number.isFinite(x)?new Intl.NumberFormat("en-IN",{maximumFractionDigits:d}).format(x):"Not available";const money=(x:number)=>"₹"+n(x);const pct=(x:number)=>n(x)+"%";const g=(i:Inputs,k:string)=>Number.isFinite(i[k])?i[k]:0;const pow=(r:number,y:number)=>Math.pow(1+r/100,y);
const emi=(p:number,r:number,y:number)=>{const m=y*12,rate=r/1200;return m<=0?0:rate===0?p/m:p*rate*Math.pow(1+rate,m)/(Math.pow(1+rate,m)-1)};
const gcd=(a:number,b:number):number=>b===0?Math.abs(a):gcd(b,a%b);const fact=(x:number)=>{if(x<0||x>170||!Number.isInteger(x))return NaN;let z=1;for(let j=2;j<=x;j++)z*=j;return z};const R=(...x:CalculationResult[])=>x;
export function calculate(kind:CalculatorKind,i:Inputs):CalculationResult[]{const a=g(i,"a"),b=g(i,"b"),c=g(i,"c"),d=g(i,"d"),p=g(i,"principal"),r=g(i,"rate"),y=Math.max(0,g(i,"years));switch(kind){
case"emi":{const m=emi(p,r,y),total=m*y*12;return R({label:"Monthly payment",value:money(m)},{label:"Total interest",value:money(total-p)},{label:"Total repayment",value:money(total)})}
case"interest":{const v=p*r*y/100;return R({label:"Interest",value:money(v)},{label:"Final amount",value:money(p+v)})}
case"compound":{const v=p*pow(r,y);return R({label:"Future value",value:money(v)},{label:"Growth",value:money(v-p)},{label:"Note",value:"Compounds annually"})}
case"sip":{const m=g(i,"monthly"),count=y*12,rate=r/1200,v=rate===0?m*count:m*((Math.pow(1+rate,count)-1)/rate)*(1+rate);return R({label:"Estimated value",value:money(v)},{label:"Invested amount",value:money(m*count)},{label:"Estimated gain",value:money(v-m*count)})}
case"gst":{const tax=g(i,"amount")*r/100;return R({label:"GST amount",value:money(tax)},{label:"Total with GST",value:money(g(i,"amount")+tax)})}
case"discount":{const saved=g(i,"amount")*r/100;return R({label:"You save",value:money(saved)},{label:"Sale price",value:money(g(i,"amount")-saved)})}
case"tax":{let left=Math.max(0,g(i,"income")),tax=0;for(const [band,rate] of [[300000,0],[300000,.05],[300000,.1],[300000,.15],[Infinity,.2]] as const){const amt=Math.min(left,band);tax+=amt*rate;left-=amt}return R({label:"Illustrative tax estimate",value:money(tax),detail:"Simplified illustration only, not official tax advice."},{label:"After estimate",value:money(g(i,"income")-tax)})}
case"salary":{const cur=g(i,"amount"),inc=cur*r/100;return R({label:"Revised amount",value:money(cur+inc)},{label:"Increase",value:money(inc)},{label:"Hike",value:pct(r)})}
case"cagr":{const end=g(i,"final");return R({label:"CAGR",value:p>0&&y>0&&end>=0?pct((Math.pow(end/p,1/y)-1)*100):"Enter positive start value and years"})}
case"roi":case"margin":{const end=g(i,"final"),gain=end-p;return R({label:kind==="roi"?"Return":"Profit",value:money(gain)},{label:kind==="roi"?"ROI":"Profit margin",value:pct((kind==="roi"?gain/Math.max(1,p):gain/Math.max(1,end))*100)})}
case"change":return R({label:"Change",value:n(g(i,"final")-p)},{label:"Percentage change",value:p===0?"Undefined":pct((g(i,"final")-p)/Math.abs(p)*100)});
case"eligibility":{const monthly=Math.max(0,g(i,"income")-g(i,"obligations"))*.4,months=y*12,rate=r/1200,v=rate===0?monthly*months:monthly*(1-Math.pow(1+rate,-months))/rate;return R({label:"Estimated eligible loan",value:money(v)},{label:"Affordable monthly payment",value:money(monthly)},{label:"Assumption",value:"40% of post-obligation income"})}
case"inflation":{const v=p*pow(r,y);return R({label:"Future equivalent cost",value:money(v)},{label:"Difference",value:money(v-p)})}
case"currency":return R({label:"Converted amount",value:n(g(i,"amount")*r),detail:"Uses the exchange rate supplied; not live FX."});
case"gratuity":return R({label:"Estimated gratuity",value:money(g(i,"income")*15/26*g(i,"years")),detail:"Illustrative formula; rules and eligibility vary."});
case"hra":{const basic=g(i,"income"),rent=g(i,"rent"),hra=g(i,"hra");return R({label:"Estimated exemption",value:money(Math.max(0,Math.min(hra,rent-basic*.1,basic*.5))),detail:"Tax regime and city rules may change the result."})}
case"takehome":return R({label:"Estimated take-home",value:money(g(i,"income")-g(i,"obligations"))},{label:"Deductions",value:money(g(i,"obligations"))});
case"breakeven":{const margin=g(i,"price")-g(i,"variable");return R({label:"Break-even units",value:margin>0?n(Math.ceil(g(i,"fixed")/margin),0):"Not possible; contribution must be positive"},{label:"Contribution per unit",value:money(margin)})}
case"goal":{const gap=Math.max(0,g(i,"final")-p),months=y*12;return R({label:"Monthly savings needed",value:months>0?money(gap/months):"Enter positive timeline"},{label:"Remaining goal",value:money(gap)})}
case"dti":return R({label:"Debt-to-income ratio",value:g(i,"income")>0?pct(g(i,"obligations")/g(i,"income")*100):"Enter income above zero"});
case"tip":{const tip=g(i,"amount")*r/100,total=g(i,"amount")+tip,people=Math.max(1,g(i,"people"));return R({label:"Tip",value:money(tip)},{label:"Total bill",value:money(total)},{label:"Per person",value:money(total/people)})}
case"bmi":{const h=g(i,"height")/100,v=h>0?g(i,"weight")/(h*h):NaN;return R({label:"BMI",value:n(v),detail:v<18.5?"Below common adult reference":v<25?"Within common adult reference":v<30?"Above common adult reference":"High adult BMI range"})}
case"bmr":case"tdee":{const v=10*g(i,"weight")+6.25*g(i,"height")-5*g(i,"age")+g(i,"sex");return R({label:kind==="bmr"?"Estimated BMR":"Estimated TDEE",value:n(kind==="tdee"?v*g(i,"activity"):v,0)+" kcal/day",detail:"Population estimate only."})}
case"calories":return R({label:"Daily calorie target",value:n(Math.max(0,g(i,"income")-r),0)+" kcal/day",detail:"Seek professional guidance for nutrition or medical needs."});
case"idealweight":{const h=g(i,"height")/100;return R({label:"BMI-based reference range",value:n(18.5*h*h)+"–"+n(24.9*h*h)+" kg",detail:"Not an individual health assessment."})}
case"pace":{const sec=g(i,"hours")*3600+g(i,"minutes")*60+g(i,"seconds"),dist=g(i,"distance");return R({label:"Pace per kilometre",value:dist>0?Math.floor(sec/dist/60)+":"+String(Math.round(sec/dist)%60).padStart(2,"0")+" min/km":"Enter positive distance"},{label:"Average speed",value:sec>0?n(dist/(sec/3600))+" km/h":"Enter duration"})}
case"onerm":return R({label:"Estimated 1RM (Epley)",value:n(g(i,"weight")*(1+g(i,"reps")/30))+" kg",detail:"Estimate only; not a maximum-lift recommendation."});
case"water":return R({label:"General daily estimate",value:n(g(i,"weight")*35)+" ml/day",detail:"Needs vary with activity, weather and health."});
case"macro":{const cal=g(i,"income");return R({label:"Protein",value:n(cal*g(i,"protein")/400)+" g/day"},{label:"Carbohydrates",value:n(cal*g(i,"carbs")/400)+" g/day"},{label:"Fat",value:n(cal*g(i,"fat")/900)+" g/day"},{label:"Shares total",value:pct(g(i,"protein")+g(i,"carbs")+g(i,"fat"))})}
case"heartrate":{const max=208-.7*g(i,"age");return R({label:"Estimated max heart rate",value:n(max,0)+" bpm"},{label:"Moderate zone (50–70%)",value:n(max*.5,0)+"–"+n(max*.7,0)+" bpm"},{label:"Vigorous zone (70–85%)",value:n(max*.7,0)+"–"+n(max*.85,0)+" bpm"})}
case"waistheight":return R({label:"Waist-to-height ratio",value:g(i,"height")>0?n(g(i,"waist")/g(i,"height"),3):"Enter height"});
case"leanmass":return R({label:"Estimated lean body mass",value:n(.407*g(i,"weight")+.267*g(i,"height")-19.2)+" kg",detail:"Population estimate only."});
case"percentage":return R({label:"Percentage of number",value:n(g(i,"amount")*r/100)},{label:"Entered rate",value:pct(r)});
case"average":{const xs=[a,b,c,d];return R({label:"Mean",value:n(xs.reduce((x,z)=>x+z,0)/xs.length)})}
case"ratio":{const div=gcd(a,b)||1;return R({label:"Simplified ratio",value:a%1===0&&b%1===0?(a/div)+" : "+(b/div):n(a/b,3)+" : 1"},{label:"First ÷ second",value:b!==0?n(a/b):"Undefined"})}
case"area":return R({label:"Rectangle area",value:n(a*b)+" square units"},{label:"Triangle area",value:n(a*b/2)+" square units"});
case"volume":return R({label:"Rectangular prism volume",value:n(a*b*c)+" cubic units"});
case"pythagorean":return R({label:"Hypotenuse",value:n(Math.sqrt(a*a+b*b))});
case"statistics":{const xs=[a,b,c,d].sort((x,y)=>x-y),mean=xs.reduce((x,z)=>x+z,0)/4;return R({label:"Mean",value:n(mean)},{label:"Median",value:n((xs[1]+xs[2])/2)},{label:"Population standard deviation",value:n(Math.sqrt(xs.reduce((sum,x)=>sum+(x-mean)**2,0)/4))})}
case"probability":return R({label:"Probability",value:b>0?pct(a/b*100):"Total outcomes must be positive"});
case"permutation":case"combination":{const nn=Math.round(a),rr=Math.round(b);if(rr>nn||rr<0)return R({label:"Result",value:"Require 0 ≤ r ≤ n"});const v=kind==="permutation"?fact(nn)/fact(nn-rr):fact(nn)/(fact(rr)*fact(nn-rr));return R({label:kind==="permutation"?"Permutations":"Combinations",value:n(v,0)})}
case"gcd":{const v=gcd(Math.round(a),Math.round(b));return R({label:"GCD",value:n(v,0)},{label:"LCM",value:v?n(Math.abs(a*b)/v,0):"0"})}
case"quadratic":{if(a===0)return R({label:"Error",value:"Coefficient a cannot be zero"});const disc=b*b-4*a*c;return disc>=0?R({label:"Root 1",value:n((-b+Math.sqrt(disc))/(2*a))},{label:"Root 2",value:n((-b-Math.sqrt(disc))/(2*a))}):R({label:"Complex roots",value:n(-b/(2*a))+" ± "+n(Math.sqrt(-disc)/(2*Math.abs(a)))+"i"})}
case"speed":{const h=g(i,"hours");return R({label:"Average speed",value:h>0?n(g(i,"distance")/h)+" km/h":"Time must be positive"})}
case"age":return R({label:"Approximate age",value:Math.max(0,new Date().getFullYear()-g(i,"years"))+" years",detail:"Use a full birth date for exact age."});
case"datediff":return R({label:"Selected date",value:new Date(Date.now()+g(i,"dateOffset")*86400000).toLocaleDateString("en-IN")},{label:"Days from today",value:n(g(i,"dateOffset"),0)});
case"duration":{const mins=(g(i,"endHour")*60+g(i,"endMinute"))-(g(i,"hours")*60+g(i,"minutes"));return R({label:"Duration",value:Math.floor(Math.abs(mins)/60)+" h "+Math.abs(mins)%60+" min"},{label:"Total minutes",value:n(Math.abs(mins),0)})}
case"convert":{const amount=g(i,"amount");return R({label:"Centimetres / minutes",value:n(amount*100)},{label:"Feet / decimal conversion",value:n(amount*3.28084),detail:"Starter converter interprets input as metres; unit-specific conversion is planned."})}
case"temperature":{const t=g(i,"amount");return R({label:"Fahrenheit",value:n(t*9/5+32)+" °F"},{label:"Kelvin",value:n(t+273.15)+" K"})}
case"fuel":{const litres=g(i,"fuel")>0?g(i,"distance")/g(i,"fuel"):0;return R({label:"Fuel needed",value:n(litres)+" litres"},{label:"Trip cost",value:money(litres*r)})}
case"electricity":{const kwh=g(i,"power")/1000*g(i,"hours")*30;return R({label:"Monthly energy",value:n(kwh)+" kWh"},{label:"Monthly cost",value:money(kwh*r)})}
case"paint":{const l=g(i,"area")*g(i,"coats")/Math.max(.01,g(i,"coverage"));return R({label:"Paint needed",value:n(l)+" litres"},{label:"Suggested purchase",value:Math.ceil(l)+" litres"})}
case"tile":{const count=Math.ceil(g(i,"area")/Math.max(.0001,g(i,"tile")));return R({label:"Tiles including 10% spare",value:n(Math.ceil(count*1.1),0)},{label:"Base count",value:n(count,0)})}
case"concrete":{const v=g(i,"a")*g(i,"b")*g(i,"c");return R({label:"Concrete volume",value:n(v)+" m³"},{label:"With 10% allowance",value:n(v*1.1)+" m³"})}
default:return R({label:"Result",value:"Calculator formula not available."})}}
export function calculateDefinition(definition:CalculatorDefinition,input:Inputs){return calculate(definition.kind,input)}
