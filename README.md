# Aperitivo Roulette 🍸

A mobile-first web app for Milan locals who can't decide where to go for aperitivo tonight.

**Live app:** [aperitivo-roulette.vercel.app](https://aperitivo-roulette.vercel.app)

## What it does

Pick a vibe (or don't), hit Spin, and let the app pick your bar. No accounts, no endless scrolling, no decision fatigue.

The app detects your location and pulls live bars within 1.5km from Google Places. If location is unavailable or the API fails, it falls back to a curated list of 40 Milan aperitivo spots.

## How it works

- On load, the app requests your location via the browser geolocation API
- If granted, it calls a serverless function that queries the Google Places API for bars nearby
- Vibe tags are inferred from place names, types, ratings, and review counts
- If location is denied or the API fails, the app silently falls back to the static dataset
- Vibe filters work on both live and curated data

## Stack

- React + Vite
- Tailwind CSS
- Google Places API (New) via Vercel Serverless Functions
- Static fallback dataset of 40 curated Milan aperitivo spots
- Deployed on Vercel

## What's next

- [ ] Improve vibe inference accuracy with more signals
- [ ] Add photos from Google Places
- [ ] Sort results by distance
- [ ] Add a ranking algorithm based on vibe match quality
- [ ] Expand to other Italian cities

## Running locally

git clone https://github.com/donatoba/aperitivo-roulette.git
cd aperitivo-roulette
npm install
npm run dev

Add a .env file with:
GOOGLE_PLACES_API_KEY=your_key_here
