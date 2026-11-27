import { NextRequest,NextResponse } from "next/server";
export const runtime="nodejs";export const revalidate=600;
const GEO_URL="https://geocoding-api.open-meteo.com/v1/search",AQ_URL="https://air-quality-api.open-meteo.com/v1/air-quality";
export async function GET(request:NextRequest){
 const city=request.nextUrl.searchParams.get("city")?.trim();
 if(!city)return NextResponse.json({error:"Enter a city name."},{status:400});
 if(city.length>100||!/^[\p{L}\p{M}\s.'-]+$/u.test(city))return NextResponse.json({error:"Enter a valid city name (up to 100 characters)."},{status:400});
 try{
  const geoResponse=await fetch(`${GEO_URL}?${new URLSearchParams({name:city,count:"1",language:"en",format:"json"})}`,{next:{revalidate:3600},signal:AbortSignal.timeout(8000)});
  if(!geoResponse.ok)throw new Error("Geocoding unavailable");
  const geo=await geoResponse.json(),place=geo.results?.[0];
  if(!place||typeof place.latitude!=="number"||typeof place.longitude!=="number")return NextResponse.json({error:"City not found. Try a larger nearby city."},{status:404});
  const params=new URLSearchParams({latitude:String(place.latitude),longitude:String(place.longitude),current:"us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone",hourly:"us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone",forecast_hours:"24",timezone:"auto"});
  const aqResponse=await fetch(`${AQ_URL}?${params}`,{next:{revalidate:600},signal:AbortSignal.timeout(10000)});
  if(!aqResponse.ok)throw new Error("Air quality unavailable");
  const payload=await aqResponse.json();
  return NextResponse.json({source:"Open-Meteo Air Quality API",sourceType:"modelled",location:{name:String(place.name??city),country:String(place.country??""),latitude:place.latitude,longitude:place.longitude,timezone:String(place.timezone??"")},retrievedAt:new Date().toISOString(),current:payload.current??{},currentUnits:payload.current_units??{},hourly:payload.hourly??{}},{headers:{"Cache-Control":"public, s-maxage=600, stale-while-revalidate=300"}});
 }catch(error){
  const message=error instanceof Error&&error.name==="TimeoutError"?"The air-quality service took too long to respond. Please try again.":"Air-quality data is temporarily unavailable. Please try again.";
  return NextResponse.json({error:message},{status:502});
 }
}