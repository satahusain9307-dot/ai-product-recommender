# SmartPick AI — Product Recommendation Assessment

A small React product recommendation system built for the AI Engineer assessment.

## What it demonstrates

- React frontend with a responsive product catalog.
- Natural-language preference input.
- AI-powered recommendation endpoint.
- Product filtering based on AI-returned product IDs.
- Server-side OpenAI API key handling (the key is never exposed to the browser).
- A deterministic fallback recommender when `OPENAI_API_KEY` is not configured.
- Vercel-ready deployment using a Node.js Function in `/api`.

## Run locally

Requirements: Node.js 18+.

```bash
npm install
cp .env.example .env
# Put your real OPENAI_API_KEY in .env
npm run dev
```

Open the local URL printed by Vite.

The app also works without an API key: the `/api/recommend` endpoint falls back to simple budget/category/tag matching so the UI can be tested.

## Deploy to Vercel

1. Push this folder to GitHub.
2. Import the repository into Vercel.
3. Add `OPENAI_API_KEY` under Project Settings → Environment Variables.
4. Optionally set `OPENAI_MODEL` (default: `gpt-5` in this assessment build).
5. Deploy.

Vercel automatically builds the Vite frontend and deploys `/api/recommend.js` as a server-side function.

## Architecture

```text
React UI
   |
   | POST /api/recommend
   v
Vercel Node.js Function
   |
   | OpenAI Responses API
   v
AI returns product IDs + reasons
   |
   v
React filters the local catalog and displays recommendations
```

## Security

Do not put `OPENAI_API_KEY` in `src/` or any `VITE_*` variable. The browser calls `/api/recommend`, and only the server-side function reads the secret.

## Assessment checklist

- [x] React frontend
- [x] Product list
- [x] User preference input
- [x] External AI API integration
- [x] Recommendations from the supplied product list
- [x] Filtering based on AI output
- [x] Clean component/state flow
- [x] Responsive UI
- [x] Secure server-side API key handling
- [x] Vercel deployment configuration
