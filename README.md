# 🌏 Karnataka Pollution Dashboard

An interactive **React + TypeScript environmental monitoring dashboard** that visualizes **air and water pollution data across Karnataka** using geospatial mapping, real datasets, and an AI-powered chatbot assistant.

🚀 Built for **Advaya Hackathon 2026**

---

## 🧠 Problem

Environmental pollution data in Karnataka is scattered across multiple sources and is difficult for citizens, researchers, and policymakers to explore or analyze efficiently.

Users often struggle to:

* Understand pollution trends across cities
* Identify environmental hotspots
* Access datasets in a usable format

---

## 💡 Solution

The **Karnataka Pollution Dashboard** consolidates multiple pollution datasets into a single interactive platform that enables:

* Geospatial pollution visualization
* Intelligent data exploration
* Natural language queries via chatbot
* Exportable environmental datasets

The system combines **local datasets, live AQI data, and AI-powered intent analysis** to make environmental information accessible and actionable.

---

## 🎥 Demo

### Dashboard Overview

https://res.cloudinary.com/dfqeubc07/image/upload/v1775095049/WhatsApp_Image_2026-04-02_at_7.11.37_AM_iks7re.jpg


### Pollution Map Visualization

https://res.cloudinary.com/dfqeubc07/image/upload/v1775095049/WhatsApp_Image_2026-04-02_at_7.12.23_AM_de5oi8.jpg

### Chatbot Interaction

https://res.cloudinary.com/dfqeubc07/image/upload/v1775095050/WhatsApp_Image_2026-04-02_at_7.12.45_AM_emmfwh.jpg

🎥 Demo Video: 

*(https://drive.google.com/file/d/1ba0gXpL66qGW0DO2qnFh7tJ2iyl3_Eoi/view?usp=sharing)*

## ✨ Features

### 🗺️ Interactive Map

* Karnataka map with hover tooltips and detail popups
* Pollution point highlighting
* Automatic zoom based on chatbot results or city selection

### 🔎 Data Exploration

* Category, city, date-range, and keyword filtering
* Map highlights for top pollution measurements
* Data table with pagination and page-size control
* Export filtered records to **CSV and Excel**

### 🤖 AI Chatbot

* ChatGPT-style streaming responses
* Auto-scrolling chat history
* Intent parsing using **Groq LLM**
* Automatic fallback to **local Ollama model**

### 🎨 User Experience

* Light/Dark mode toggle
* Responsive UI
* Optimized tooltips for readability

---

## 📊 Data Sources

The application combines multiple data sources:

* Local **CSV datasets** (AQI + lake water quality)
* **Supplemental curated environmental records**
* **Live AQI data** from Open-Meteo API

---

## 📂 Data Location

Local static datasets are served from:

public/data
public/geo

Important:

* CSV files are fetched from **/data/** at runtime
* Karnataka boundary GeoJSON is loaded from **/geo/karnataka.geojson**

---

## ⚙️ Tech Stack

### Frontend

* React 19
* TypeScript
* Vite

### Mapping & Visualization

* React Leaflet
* Leaflet

### Data Processing

* Papa Parse
* Axios
* date-fns

### Data Export

* xlsx

---

## 🚀 Getting Started

### Install dependencies

```
npm install
```

### Run development server

```
npm run dev
```

### Build production version

```
npm run build
```

### Preview production build

```
npm run preview
```

---

## 🔐 Optional AI Configuration

For faster chatbot intent parsing, configure **Groq API**.

Create a `.env` file in the project root:

```
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_GROQ_MODEL=llama-3.1-8b-instant
```

If Groq is unavailable, the chatbot automatically falls back to **local Ollama**.

---

## 🤖 Ollama Setup (Fallback AI)

Install Ollama:

https://ollama.com

Pull the model used by this dashboard:

```
ollama pull deepseek-r1:1.5b
```

Ensure Ollama runs locally at:

```
http://localhost:11434
```

---

## 📁 Project Structure

```
src/
 ├── components     UI components (map, filters, table, stats)
 ├── services       Data loading and API integration
 ├── config         Dataset descriptors and location configs
 ├── types          Shared TypeScript interfaces
 └── utils          Parsing, date helpers, export utilities

public/
 ├── data           Pollution datasets (CSV)
 └── geo            Karnataka boundary GeoJSON
```

---

## 📚 Data Glossary

**BOD (Biological Oxygen Demand)**

The amount of dissolved oxygen microorganisms require to break down organic matter in water.

Measured as **BOD5 (mg/L)**.

Higher BOD values typically indicate **greater organic pollution levels in water bodies**.

---

## 🛠 Troubleshooting

If datasets do not load:

* Verify filenames in `src/config/datasets.ts`
* Ensure files exist inside `public/data`

If the map boundary does not appear:

* Confirm `public/geo/karnataka.geojson` exists

If live AQI fails:

* The dashboard continues working with **local datasets**

If the chatbot does not respond:

* Verify **Groq API key**
* Or ensure **Ollama is running at http://localhost:11434**

---

## 🌱 Future Improvements

* Add **time-series pollution trend analysis**
* Support **more Karnataka districts**
* Integrate **government pollution APIs**
* Add **predictive pollution modeling**

---



## Contributors

This project was developed as part of **Advaya Hackathon 2026**.


* **@AmulyaKR13**
* **@Nishantrde** – Nishant Garg
* **@princerajpurohit9036-ship-it** – Prince Rajpurohit
* **@Subhrajit428**


---

## 📜 License

MIT License

Created for **Advaya Hackathon 2026**.
