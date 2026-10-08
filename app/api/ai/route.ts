import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

function fallback(body: any) {
  const aqi = Number(body?.airQuality?.us_aqi);
  const mode = body?.commute?.mode || "your current mode";
  const co2 = Number(body?.commute?.monthlyCo2Kg || 0);
  const city = body?.city || "your city";

  const steps: string[] = [];

  if (Number.isFinite(aqi) && aqi >= 151) {
    steps.push("The displayed modelled AQI is in a poorer range. Check official local guidance before longer outdoor activity and re-check conditions before your commute.");
  } else if (Number.isFinite(aqi) && aqi > 100) {
    steps.push("The displayed modelled AQI is elevated. Use the hourly trend as one signal when planning outdoor travel.");
  } else {
    steps.push("Use the hourly model trend to compare commute windows and avoid relying on a single snapshot.");
  }

  if (["Petrol car", "Diesel car", "Petrol motorcycle"].includes(mode)) {
    steps.push("For suitable routes, compare metro/rail, bus, walking or cycling, and consider ride-sharing where practical.");
  } else {
    steps.push("Continue using shared/public/active travel where it fits your route and compare alternatives before changing your routine.");
  }

  steps.push(`Your current commute estimate is ${co2.toFixed(1)} kg CO₂/month. Treat this as your baseline, not a certified emissions inventory.`);
  steps.push(`Set one small next action for ${city}, then compare the next month's estimate with this baseline.`);

  return {
    provider: "AirAware local recommendation engine",
    title: "Your personalized commute plan",
    steps,
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(fallback(body));
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
You are the sustainability recommendation layer inside AirAware, a student climate-tech product focused on air quality and transport.

User context:
${JSON.stringify(body, null, 2)}

Write a concise 4-part action plan:
1. What stands out
2. What the user can change
3. Lower-emission alternatives
4. One practical next step

Rules:
- Air quality is modelled data, not an official CPCB station reading.
- Do not diagnose illness or give medical treatment.
- Do not invent statistics or precise savings.
- Clearly call emissions values estimates.
- Keep recommendations feasible for a student/young adult.
- Avoid generic filler.
`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
      contents: prompt,
    });

    return NextResponse.json({
      provider: "Google Gemini",
      title: "Your personalized commute plan",
      text: response.text,
    });
  } catch {
    return NextResponse.json(fallback(body));
  }
}
