# AirAware — Urban Air Quality Assistant

**Challenge 6 | Urban Air Quality Assistant**

AirAware brings city-level air-quality information, commute-emissions estimates and AI-assisted action planning into one responsive web application. It helps people understand a modelled air-quality snapshot, compare travel choices and decide on a practical next step.

## Product experience

### 1. Air Lens
- Search for a city using Open-Meteo Geocoding.
- View modelled US AQI, PM2.5, PM10, nitrogen dioxide and ozone.
- Explore the next 24 hours of modelled pollutant data.
- See the source, modelled-data disclosure and retrieval context.
- Get plain-language outdoor activity guidance based on the displayed US AQI band.

### 2. Commute Lab
- Configure a weekly commute and choose from seven transport modes.
- Estimate monthly distance, monthly CO₂ and annual tonnes of CO₂.
- Compare modes using the same commute assumptions.
- Inspect the lowest-estimated-emissions alternative.

### 3. Action Engine
- Compare the current commute with an alternative.
- Set a personal reduction goal and see the scenario result.
- Generate a four-part recommendation using Google Gemini.
- Continue using the local recommendation engine when Gemini is not configured or unavailable.

### 4. Trust & Method
- See data-source and estimation disclosures.
- Understand the assumptions behind the transport calculations.
- Distinguish modelled air-quality data from official monitoring-station readings.
- Understand that AI output is an aid to decision-making, not a medical or emergency service.

## How it works

1. The user enters a city.
2. The server resolves the city through Open-Meteo Geocoding.
3. The server requests current and hourly air-quality variables from Open-Meteo.
4. The browser calculates commute estimates locally using the published assumptions in `lib/transport.ts`.
5. The user can send the selected context to the server-side Gemini endpoint for a concise action plan. If no API key is present, a deterministic local fallback is returned.

## Technology

- Next.js App Router, React and TypeScript
- Framer Motion
- React Three Fiber / Three.js
- Recharts and Lucide
- Open-Meteo Geocoding and Air Quality APIs
- Google Gemini via the official `@google/genai` SDK
- Vitest

## Run locally

Requirements: Node.js 20.9+ and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

The app works without Gemini credentials. To enable Gemini, set `GEMINI_API_KEY` in `.env.local`. Optionally set `GEMINI_MODEL` to a model available to your API key.

Never commit `.env.local`, API keys or other credentials.

## Quality checks

```bash
npm run lint
npm run test
npm run build
```

## Deployment

Deploy as a Next.js project on Vercel or another compatible Node.js host. Add `GEMINI_API_KEY` and optionally `GEMINI_MODEL` as server-side environment variables in the deployment dashboard, then redeploy.

See [Vercel deployment notes](docs/DEPLOY_VERCEL.md).

## Project structure

```text
app/
  api/
    ai/route.ts
    air-quality/route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  AirAwareApp.tsx
  AtmosphereScene.tsx
  SceneLoader.tsx
docs/
  DEPLOY_VERCEL.md
  METHODOLOGY.md
  PROJECT_STORY.md
lib/
  aq.ts
  exposure.ts
  transport.ts
tests/
```

## Data, assumptions and limitations

- Open-Meteo air-quality values are model outputs. They are not presented as CPCB station measurements or a substitute for official local advisories.
- City geocoding returns a matching place, which may not represent the user's exact neighbourhood or street.
- Transport factors and defaults are educational estimates. Real emissions vary by vehicle, occupancy, energy mix, route and operating conditions.
- The commute comparison is only as accurate as the values entered by the user and the assumptions in the code.
- Gemini responses may vary. A local fallback keeps the core action-planning experience available without an API key.
- Outdoor activity guidance is general public information, not medical advice. Follow local public-health and emergency instructions.

## Challenge submission checklist

- [ ] Confirm the public repository is accessible and remains below the 10 MB submission limit.
- [ ] Deploy the latest branch and test the live URL on desktop and mobile.
- [ ] Record a short demo showing city search, pollutant readings, activity guidance, commute comparison and AI recommendations.
- [ ] Upload the demo as an unlisted YouTube video or an accessible Drive link.
- [ ] Add the deployed URL, demo URL, Gen AI service/usage description and LinkedIn showcase URL to the challenge submission form.
- [ ] Verify every link and repository permission before submitting.

**Submission window:** 16–29 November 2026.  
**Deadline:** 29 November 2026, 11:59 PM IST.  
**Attempts:** Maximum 3.

## Gen AI usage

Google Gemini is used as the optional recommendation and explanation layer. It receives a bounded summary of the selected city, available air-quality values, commute estimate and mode comparison. The application also has a deterministic local fallback. Gemini is not used to fabricate air-quality readings or calculate the core commute-emissions estimates.
