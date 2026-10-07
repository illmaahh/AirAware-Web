# Deploy AirAware on Vercel

## 1. Push the project to GitHub

Create a repository named `AirAware` (or `AirAware-web`) and upload the contents of this folder.

Do **not** upload `.env` or any real API key.

## 2. Import into Vercel

1. Go to https://vercel.com/new
2. Continue with GitHub.
3. Import your `AirAware` repository.
4. Vercel should detect **Next.js** automatically.
5. Keep the default build settings.
6. Deploy.

## 3. Add Gemini (optional)

Open:

Project → Settings → Environment Variables

Add:

Name:
`GEMINI_API_KEY`

Value:
your Gemini API key

Optionally add:
`GEMINI_MODEL`

Then redeploy.

The app works without the key because `/api/ai` falls back to the local recommendation engine.

## 4. What to test after deployment

- Home page loads.
- Search `Delhi` on Air Lens.
- AQI/pollutant cards populate.
- 24-hour chart renders.
- Commute calculations update when inputs change.
- Transport comparison renders.
- Scenario simulator updates.
- AI Advisor returns Gemini output when configured, otherwise local fallback.
- Mobile layout works.

## 5. Custom domain

Vercel Project → Settings → Domains.

Suggested:
`airaware.yourdomain.com`

Or keep the free Vercel domain for the internship demonstration.
