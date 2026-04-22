# Aperitivo Roulette 🍸

A mobile-first web app for Milan locals who can't decide where to go for aperitivo tonight.

**Live app:** [aperitivo-roulette.vercel.app](https://aperitivo-roulette.vercel.app)

## What it does

Pick a vibe (or don't), hit Spin, and let the app pick your bar. No accounts, no endless scrolling, no decision fatigue.

## Why I built it

I wanted to learn how to ship a real web app end to end — from local dev to production. This is v1 of a project I plan to keep iterating on.

## Stack

- React + Vite
- Tailwind CSS
- Static curated dataset of 40 Milan aperitivo spots
- Deployed on Vercel

## What's next

- [ ] Sort results by distance using browser geolocation
- [ ] Connect to Google Places API for live data
- [ ] Add a "copy address" button to share spots easily
- [ ] Build a ranking algorithm based on vibe match quality
- [ ] Add photos for each spot

## Running locally

git clone https://github.com/donatoba/aperitivo-roulette.git
cd aperitivo-roulette
npm install
npm run dev
