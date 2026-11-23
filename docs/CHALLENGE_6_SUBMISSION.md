# Challenge 6 submission notes

## Deliverable links

- GitHub repository: https://github.com/illmaahh/AirAware-Web
- Working branch: `challenge-6-urban-air-quality`
- Deployment URL: add after deploying this branch
- Demo video: add after recording
- LinkedIn showcase: add after publishing

## Demo recording outline (2–3 minutes)

1. Introduce AirAware and the urban air-quality problem.
2. Search a city and explain that readings are modelled Open-Meteo data.
3. Show AQI, pollutant values, the 24-hour chart and the activity guidance.
4. Configure a commute and compare transport modes.
5. Change the alternative commute and reduction goal.
6. Generate an AI action plan; explain the Gemini integration and local fallback.
7. Close with the data limitations and next steps.

## Gen AI declaration

Google Gemini (through the Google Gen AI SDK) is used for contextual action-plan generation. The server sends a bounded set of user-selected city, air-quality and commute fields. The application uses deterministic calculations for transport estimates and a local rule-based fallback when Gemini is unavailable. Gemini does not generate or alter the underlying air-quality readings.

## Final checks

- [ ] Run `npm run lint`, `npm run test` and `npm run build`.
- [ ] Deploy this branch and test the deployed build.
- [ ] Confirm the repository is public and contains no secrets.
- [ ] Check the repository size is below 10 MB.
- [ ] Test the demo video and LinkedIn links in a signed-out browser.
- [ ] Submit before 29 November 2026, 11:59 PM IST.

Do not claim user-testing counts, measured impact, accuracy scores or deployment success unless those have actually been verified.
