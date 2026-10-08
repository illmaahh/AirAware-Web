# 🌍 AirAware — Smart Commute & Air Quality Advisor

## What is this?

AirAware is a Vercel-ready, climate-tech web application that connects:

**modelled air quality + personal commute emissions + AI-assisted action planning**

It was redesigned from the original student prototype to feel like a product rather than a generic AI dashboard.

## Why this version?

The product is optimized for:
- internship demonstration
- live deployment
- portfolio screenshots
- 60-second screen recording
- responsive mobile/desktop use
- transparent data and AI usage

## Key features

### Atmosphere Core
A custom Three.js / React Three Fiber interactive 3D scene introduces the product and visually shifts with the displayed AQI context.

### Air Lens
- City lookup
- modelled US AQI
- PM2.5
- PM10
- NO2
- O3
- 24-hour chart
- trend signal
- data-source disclosure

### Commute Lab
- seven transport modes
- adaptive inputs
- monthly distance
- estimated monthly/annual CO2
- route emissions matrix
- lowest-emission scenario

### Action Engine
- current vs. alternative commute
- estimated monthly difference
- goal slider
- Gemini-assisted recommendation
- local fallback when Gemini is unavailable

### Trust & Method
- source links
- methodology
- AI disclosure
- limitations
- explicit data/estimate labels

## Tech stack

- Next.js
- React
- TypeScript
- Framer Motion
- React Three Fiber / Three.js
- Recharts
- Lucide
- Vercel Route Handlers
- Open-Meteo Air Quality API
- Google Gemini API (optional)

## Run locally

```bash
npm install
npm run dev
```

Open:
http://localhost:3000

## Production test

```bash
npm run build
npm start
```

## Tests

```bash
npm run test
```

## Environment

Optional:

```text
GEMINI_API_KEY=
GEMINI_MODEL=
```

Never commit real credentials.

## Vercel deployment

See:
`docs/DEPLOY_VERCEL.md`

## Data trust

AirAware uses Open-Meteo's modelled air-quality values and explicitly labels them as such. It does not claim to be an official CPCB station-monitoring application.

Transport values are estimates using transparent assumptions. They are not certified emissions accounting.

## Internship alignment

Designed around:

**Problem → Research → AI Solution → Prototype → Testing → Impact → Next Steps**

## Important before submission

Do not invent:
- user testing counts
- ratings
- impact numbers
- AI accuracy
- deployment claims

Run real tests, record actual feedback, then use those results in the final portfolio.
