# Karnataka Pollution Dashboard

An interactive React + TypeScript dashboard for exploring Karnataka pollution data across air and water sources.

The app combines:
- Local CSV datasets (AQI and lake water quality)
- Supplemental curated records
- Live online AQI data (Open-Meteo)
- Streaming intent chatbot, map view, filter panel, stats cards, and exportable table

## Features

- Interactive Karnataka map with hover tooltips and detail popups
- Category, city, date-range, and keyword filtering
- Map highlights section for top measurable points
- Chatbot responses stream in chunks (ChatGPT-style) with auto-scrolling chat history
- Automatic map zoom from chatbot intent/results and city filter selection
- Data table with pagination and page-size control
- Export filtered records to CSV and Excel
- Light/Dark mode toggle (sun/moon button)

## Data Location

Local static files used by the app are served from:

- public/data
- public/geo

Important:
- The app fetches CSV files from /data/... (public directory at runtime)
- Karnataka boundary GeoJSON is loaded from /geo/karnataka.geojson

## Tech Stack

- React 19
- TypeScript
- Vite
- React Leaflet + Leaflet
- Papa Parse
- Axios
- date-fns
- xlsx

## Getting Started

1. Install dependencies

```bash
npm install
```

Optional: configure Groq for faster chatbot intent parsing.

Create a `.env` file in project root (or copy `.env.example`) and set:

```bash
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_GROQ_MODEL=llama-3.1-8b-instant
```

If Groq is not configured or unavailable, chatbot falls back to local Ollama.

Optional: local Ollama setup for fallback chatbot intent parsing.

1. Install and run Ollama from https://ollama.com
2. Pull the model used by this dashboard:

```bash
ollama pull deepseek-r1:1.5b
```

3. Keep Ollama running locally on default endpoint:

```bash
http://localhost:11434
```

2. Run development server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

4. Preview production build

```bash
npm run preview
```

## Available Scripts

- npm run dev: Start Vite dev server
- npm run build: Type-check and build production bundle
- npm run lint: Run ESLint
- npm run preview: Serve the built app locally

## Project Structure (Key Paths)

- src/components: UI components (map, filters, table, stats)
- src/services: Data loading, parsing, and online fetch integration
- src/config: Dataset descriptors, location config, supplemental records
- src/types: Shared TypeScript interfaces
- src/utils: Parsing/date/export helpers
- public/data: CSV and related static dataset files
- public/geo: Karnataka geo boundary file

## Notes

- Tooltip readability is tuned for both light and dark themes.
- District filtering was removed from the filter panel by design.
- Pollution Type filtering was removed from the filter panel by design.
- Pollution type still exists in records and is displayed in the table for context.
- Chatbot intent engine uses Groq when `VITE_GROQ_API_KEY` is available, with Ollama fallback.
- Chatbot panel auto-scrolls as streamed chunks arrive.
- Map zoom priority is: chatbot highlighted results, chatbot detected city, then selected city filter.

## Data Glossary

- BOD (Biological Oxygen Demand): The amount of dissolved oxygen microorganisms need to break down organic matter in water (commonly measured as BOD5 in mg/L). Higher BOD typically indicates higher organic pollution load.

## Troubleshooting

- If local files do not load, verify the filenames in src/config/datasets.ts match files in public/data.
- If map boundary does not appear, verify public/geo/karnataka.geojson exists.
- If online AQI fails, the dashboard still works with local + supplemental datasets.
- If chatbot does not respond, verify Groq API key or ensure Ollama is running at http://localhost:11434 and model deepseek-r1:1.5b is installed.
