import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { MODES, type TransportMode } from "@/lib/transport";
export const runtime = "nodejs";
type Context={city:string;airQuality:Record<string,number>;commute:{mode:TransportMode;monthlyKm:number;monthlyCo2Kg:number;annualCo2Tonnes:number};comparison:Array<{mode:TransportMode;monthlyCo2Kg:number}>};
const record=(v:unknown):v is Record<string,any>=>typeof v==="object"&&v!==null&&!Array.isArray(v);
const validNumber=(v:unknown,max=1_000_000):v is number=>typeof v==="number"&&Number.isFinite(v)&&v>=0&&v<=max;
function parseContext(v:unknown):Context|null {
 if(!record(v)||typeof v.city!=="string"||!v.city.trim()||v.city.length>100||!record(v.airQuality)||!record(v.commute)||!Array.isArray(v.comparison)) return null;
 const c=v.commute;
 if(typeof c.mode!=="string"||!MODES.includes(c.mode as TransportMode)||!validNumber(c.monthlyKm)||!validNumber(c.monthlyCo2Kg)||!validNumber(c.annualCo2Tonnes)) return null;
 const airQuality:Record<string,number>={};
 for(const key of ["us_aqi","pm2_5","pm10","nitrogen_dioxide","ozone"]){const n=v.airQuality[key];if(n!==undefined){if(!validNumber(n,100000))return null;airQuality[key]=n;}}
 const comparison=v.comparison.slice(0,MODES.length).map((x:unknown)=>record(x)&&typeof x.mode==="string"&&MODES.includes(x.mode as TransportMode)&&validNumber(x.monthlyCo2Kg)?{mode:x.mode as TransportMode,monthlyCo2Kg:x.monthlyCo2Kg}:null);
 if(comparison.some((x:any)=>x===null))return null;
 return {city:v.city.trim(),airQuality,commute:{mode:c.mode as TransportMode,monthlyKm:c.monthlyKm,monthlyCo2Kg:c.monthlyCo2Kg,annualCo2Tonnes:c.annualCo2Tonnes},comparison};
}
function fallback(c:Context){
 const aqi=c.airQuality.us_aqi, mode=c.commute.mode, co2=c.commute.monthlyCo2Kg;
 const steps=[aqi!==undefined&&aqi>=151?"The modelled AQI is elevated. Check official local guidance and re-check conditions before longer outdoor activity.":aqi!==undefined&&aqi>100?"The modelled AQI is above the moderate range. Compare the hourly trend before choosing an outdoor commute window.":"Compare the hourly model trend across the day instead of relying on a single snapshot."];
 steps.push(["Petrol car","Diesel car","Petrol motorcycle"].includes(mode)?"For suitable routes, compare public transport, walking, cycling or ride-sharing.":"Keep comparing practical shared and active travel options when planning your route.");
 steps.push(`Your commute estimate is ${co2.toFixed(1)} kg CO₂/month. This is an estimate, not a certified emissions inventory.`,`Choose one realistic next step for ${c.city}, then compare the estimate again next month.`);
 return {provider:"AirAware local recommendation engine",title:"Your personalized commute plan",steps};
}
export async function POST(request:NextRequest){
 const length=Number(request.headers.get("content-length")||0);
 if(length>12000)return NextResponse.json({error:"Request is too large."},{status:413});
 let raw:unknown;try{raw=await request.json();}catch{return NextResponse.json({error:"Send a valid JSON request."},{status:400});}
 const context=parseContext(raw);if(!context)return NextResponse.json({error:"Invalid recommendation context."},{status:400});
 if(!process.env.GEMINI_API_KEY)return NextResponse.json(fallback(context));
 try{
  const ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
  const prompt=`You are AirAware's sustainability recommendation assistant. Use only this validated context. Return a concise practical four-part plan: what stands out, what the user can change, lower-emission alternatives, and one next step. Air-quality data is modelled, not an official station reading. Do not diagnose illness, prescribe treatment, invent statistics or precise savings. Label emissions as estimates. Avoid generic filler.\n${JSON.stringify(context)}`;
  const response=await ai.models.generateContent({model:process.env.GEMINI_MODEL||"gemini-2.5-flash",contents:prompt});
  const text=response.text?.trim();return text?NextResponse.json({provider:"Google Gemini",title:"Your personalized commute plan",text}):NextResponse.json(fallback(context));
 }catch{return NextResponse.json(fallback(context));}
}