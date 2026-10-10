"use client";
import {useState} from "react";
import type {CalculatorDefinition} from "@/lib/calculators/catalog";
import {IN,US,type Currency} from "@/lib/calculators/engine";
import CalculatorWorkbench from "@/components/CalculatorWorkbench";
import LoanCalculator from "@/components/LoanCalculator";
import AgeCalculator from "@/components/AgeCalculator";
import BmiCalculator from "@/components/BmiCalculator";
import BmrCalculator from "@/components/BmrCalculator";
import CalorieCalculator from "@/components/CalorieCalculator";
import PercentageCalculator from "@/components/PercentageCalculator";
import DateDiffCalculator from "@/components/DateDiffCalculator";
import RoiCalculator from "@/components/RoiCalculator";
import SimpleInterestCalculator from "@/components/SimpleInterestCalculator";
import DiscountCalculator from "@/components/DiscountCalculator";
import MarginCalculator from "@/components/MarginCalculator";
import IdealWeightCalculator from "@/components/IdealWeightCalculator";
import OneRepMaxCalculator from "@/components/OneRepMaxCalculator";
import RunningPaceCalculator from "@/components/RunningPaceCalculator";
import SleepCalculator from "@/components/SleepCalculator";
import SpeedCalculator from "@/components/SpeedCalculator";
import PythagoreanCalculator from "@/components/PythagoreanCalculator";
import StandardDeviationCalculator from "@/components/StandardDeviationCalculator";
import IncomeTaxCalculator from "@/components/IncomeTaxCalculator";

// Custom components that handle currency themselves via prop
type CustomProps={calculator:CalculatorDefinition;currency:Currency};
type CustomComp=React.ComponentType<CustomProps>;

const CUSTOM:Partial<Record<string,CustomComp>>={
  "loan-calculator":LoanCalculator as CustomComp,
  "age-calculator":AgeCalculator as CustomComp,
  "bmi-calculator":BmiCalculator as CustomComp,
  "bmr-calculator":BmrCalculator as CustomComp,
  "tdee-calculator":BmrCalculator as CustomComp,
  "calorie-deficit-calculator":CalorieCalculator as CustomComp,
  "percentage-calculator":PercentageCalculator as CustomComp,
  "date-difference-calculator":DateDiffCalculator as CustomComp,
  "days-between-dates-calculator":DateDiffCalculator as CustomComp,
  "roi-calculator":RoiCalculator as CustomComp,
  "simple-interest-calculator":SimpleInterestCalculator as CustomComp,
  "discount-calculator":DiscountCalculator as CustomComp,
  "profit-margin-calculator":MarginCalculator as CustomComp,
  "ideal-weight-calculator":IdealWeightCalculator as CustomComp,
  "one-rep-max-calculator":OneRepMaxCalculator as CustomComp,
  "running-pace-calculator":RunningPaceCalculator as CustomComp,
  "sleep-calculator":SleepCalculator as CustomComp,
  "speed-distance-time-calculator":SpeedCalculator as CustomComp,
  "pythagorean-theorem-calculator":PythagoreanCalculator as CustomComp,
  "standard-deviation-calculator":StandardDeviationCalculator as CustomComp,
  "mean-median-mode-calculator":StandardDeviationCalculator as CustomComp,
  "income-tax-calculator":IncomeTaxCalculator as CustomComp,
};

// India-only slugs — no country switcher shown
const INDIA_ONLY=new Set([
  "ppf-calculator","sip-calculator","gst-calculator",
  "gratuity-calculator","hra-exemption-calculator","income-tax-calculator",
]);

export default function CalculatorShell({calculator}:{calculator:CalculatorDefinition}){
  const [country,setCountry]=useState<"india"|"usa">("usa");
  const currency:Currency=country==="usa"?US:IN;
  const Custom=CUSTOM[calculator.slug];
  const showSwitcher=!INDIA_ONLY.has(calculator.slug);

  return(
    <>
      {showSwitcher&&(
        <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:20,background:"var(--wash)",borderRadius:12,padding:4,width:"fit-content",border:"1px solid var(--line)"}}>
          {(["india","usa"] as const).map(c=>(
            <button key={c} type="button" onClick={()=>setCountry(c)}
              style={{padding:"9px 24px",borderRadius:9,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,
                background:country===c?"white":"transparent",
                color:country===c?"var(--ink)":"var(--muted)",
                boxShadow:country===c?"0 1px 4px rgba(0,0,0,.12)":"none",
                transition:"all .15s"}}>
              {c==="india"?"🇮🇳  India":"🇺🇸  USA"}
            </button>
          ))}
        </div>
      )}
      {Custom
        ?<Custom calculator={calculator} currency={currency}/>
        :<CalculatorWorkbench calculator={calculator} currency={currency}/>
      }
    </>
  );
}
