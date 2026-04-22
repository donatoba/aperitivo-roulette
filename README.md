# Aperitivo Roulette 🍸

A mobile-first web app for Milan locals who can't decide where to go for aperitivo tonight.

**Live app:** [aperitivo-roulette.vercel.app](https://aperitivo-roulette.vercel.app)

## What it does

Pick a vibe (or don't), hit Spin, and let the app pick your bar. No accounts, no endless scrolling, no decision fatigue.

The app detects your location and pulls live bars within 1.5km from Google Places. Hit "Convince me" on any result and an AI tells you what makes that bar special tonight — while keeping you entertained with a joke while it thinks.

## How it works

- On load, the app requests your location via the browser geolocation API
- If granted, it calls a serverless function that queries the Google Places API for bars nearby
- Vibe tags are inferred from place names, types, ratings, and review counts
- If location is denied or the API fails, the app silently falls back to a curated list of 40 Milan spots
- "Convince me" calls a second serverless function that queries the Gemini AI API to research what the bar is genuinely known for
- Results are cached in memory so repeat spins are instant

## Stack

- React + Vite
- Tailwind CSS
- Google Places API (New) for live bar data
- Gemini 2.5 Flash for AI-powered bar stories
- Vercel Serverless Functions (secrets never exposed to the client)
- Static fallback dataset of 40 curated Milan aperitivo spots
- Deployed on Vercel

## What's next

- [ ] Add photos from Google Places
- [ ] Sort results by distance
- [ ] Share a spin via URL
- [ ] Add "open now" filter
- [ ] Expand to other Italian cities

## Running locally

git clone https://github.com/donatoba/aperitivo-roulette.git
cd aperitivo-roulette
npm install
npm run dev

Create a .env file with:
GOOGLE_PLACES_API_KEY=your_google_key
GEMINI_API_KEY=your_gemini_key
