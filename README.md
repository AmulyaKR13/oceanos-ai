# GreenPulse

GreenPulse is an **AI-powered environmental monitoring dashboard** that visualizes pollution data and environmental risks using **interactive geospatial maps and intelligent data analysis**.

The platform helps users explore **pollution hotspots, environmental risk zones, and ecosystem health** through a visual dashboard and an AI-powered assistant.

🚀 Built for **Advaya Hackathon 2026**

---

# Problem Statement

The marine and environmental ecosystem is facing major threats such as pollution, biodiversity loss, and unsustainable resource use.

Environmental data exists across many sources, but it is:

* Scattered across multiple databases
* Difficult to analyze and visualize
* Hard for policymakers and researchers to interpret quickly

Because of this lack of visibility, environmental damage is often detected **too late**.

Regions with high pollution risk or ecosystem decline often go unnoticed because there is **no unified platform that aggregates and visualizes environmental data in one place**. 

---

# Proposed Solution

**GreenPulse** solves this problem by providing a **unified environmental monitoring dashboard**.

The platform collects environmental datasets and transforms them into **interactive visual insights**.

Key capabilities:

* Interactive environmental map visualization
* Identification of pollution hotspots
* AI-powered chatbot for data exploration
* Filtering and analysis of environmental datasets
* Exportable environmental records

Instead of showing raw datasets, the system **analyzes and visualizes environmental conditions**, allowing users to understand:

* Pollution levels
* Ecosystem health
* Human activities affecting the environment

This converts complex environmental datasets into **clear, actionable insights for decision-making**. 

---

# Features

## Interactive Environmental Map

* Karnataka map with hover tooltips and detailed information popups
* Pollution hotspot highlighting
* Automatic map zoom based on chatbot results or selected city

## Data Exploration

* Category, city, date-range, and keyword filtering
* Map highlights for top pollution measurements
* Data table with pagination and page-size control
* Export filtered records to **CSV and Excel**

## AI Chatbot

* ChatGPT-style streaming responses
* Natural language queries for pollution data
* Intent parsing using **Groq LLM**
* Automatic fallback to **local Ollama model**

## User Experience

* Light / Dark mode toggle
* Responsive UI
* Optimized tooltip readability

---

# Screenshots / Demo

Dashboard Overview
https://res.cloudinary.com/dfqeubc07/image/upload/v1775095049/WhatsApp_Image_2026-04-02_at_7.11.37_AM_iks7re.jpg

Pollution Map Visualization
https://res.cloudinary.com/dfqeubc07/image/upload/v1775095049/WhatsApp_Image_2026-04-02_at_7.12.23_AM_de5oi8.jpg

Chatbot Interaction
https://res.cloudinary.com/dfqeubc07/image/upload/v1775095050/WhatsApp_Image_2026-04-02_at_7.12.45_AM_emmfwh.jpg

Demo Video
https://drive.google.com/file/d/1ba0gXpL66qGW0DO2qnFh7tJ2iyl3_Eoi/view?usp=sharing

---

# Data Sources

The application combines multiple datasets:

* Local CSV datasets (AQI + lake water quality)
* Supplemental curated environmental records
* Live AQI data from **Open-Meteo API**

Local data is served from:

```
public/data
public/geo
```

Important:

* CSV datasets are fetched from `/data/` at runtime
* Karnataka boundary GeoJSON is loaded from `/geo/karnataka.geojson`

---

# Tech Stack Used

Frontend

* React 19
* TypeScript
* Vite

Mapping & Visualization

* React Leaflet
* Leaflet

Data Processing

* Papa Parse
* Axios
* date-fns

Data Export

* xlsx

AI Integration

* Groq LLM
* Ollama (fallback model)

---

# Installation / Run Instructions

Clone the repository

```
git clone https://github.com/<your-repo>/oceanos-ai.git
cd oceanos-ai
```

Install dependencies

```
npm install
```

Run development server

```
npm run dev
```

Build production version

```
npm run build
```

Preview production build

```
npm run preview
```

---

# Optional AI Configuration

Create a `.env` file in the project root:

```
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_GROQ_MODEL=llama-3.1-8b-instant
```

If Groq is unavailable, the chatbot automatically falls back to **local Ollama**.

---

# Team Members

This project was developed as part of **Advaya Hackathon 2026**.

* @AmulyaKR13
* @Nishantrde – Nishant Garg
* @princerajpurohit9036-ship-it – Prince Rajpurohit
* @Subhrajit428

---

# License

MIT License

Created for **Advaya Hackathon 2026**.
