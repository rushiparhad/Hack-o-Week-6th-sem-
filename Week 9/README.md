# Hostel Laundry Peak Prediction 🧺📈

> Smart forecasting for hostel laundry rush hours so students can avoid queues and plan better. ⏰

---

## ✨ Project Overview

Laundry rooms in hostels usually get overcrowded at a few specific times of day.
This Week 9 project focuses on predicting those **peak usage windows** using machine learning.

### 🎯 Goal

Predict upcoming laundry demand and identify the busiest time slots in advance.

### 🧠 Core Idea

Given historical laundry records (`timestamp`, `loadCount`), the model:

- forecasts future demand
- highlights peak windows (top-load intervals)
- returns structured output for dashboards or APIs

---

## 🏗️ Current Folder Structure

```text
Week 9/
├── package.json
├── package-lock.json
├── README.md
└── python-ml/
		├── forecast_service.py
		└── requirements.txt
```

---

## 🛠️ Tech Stack

- **Python** for model execution
- **Prophet** for time-series forecasting
- **Pandas** for data shaping and preprocessing
- **Node.js tooling** (workspace-level scripts and orchestration)

---

## 🔍 What The Forecast Service Does

File: `python-ml/forecast_service.py`

### ✅ Input (JSON via stdin)

- `records`: historical usage rows
- `horizon`: forecast horizon (default `48` hours)
- `loadFactor`: scenario multiplier (default `1.0`)

### ✅ Output (JSON via stdout)

- `forecast`: predicted points with confidence bounds
- `peakWindows`: highest predicted load windows

### 📌 Forecast fields

- `timestamp`
- `yhat`
- `yhatLower`
- `yhatUpper`

---

## 🚀 Quick Start (Week 9)

### 1. Install dependencies

```bash
npm install
python -m pip install -r python-ml/requirements.txt
```

### 2. Run the forecast service manually

Example (PowerShell):

```powershell
$payload = @'
{
	"records": [
		{"timestamp": "2026-03-20T08:00:00Z", "loadCount": 12},
		{"timestamp": "2026-03-20T09:00:00Z", "loadCount": 18},
		{"timestamp": "2026-03-20T10:00:00Z", "loadCount": 10}
	],
	"horizon": 24,
	"loadFactor": 1.0
}
'@

$payload | python python-ml/forecast_service.py
```

---

## 📊 Why This Matters

- 🧍‍♂️ Reduces waiting time for students
- ⚡ Improves machine utilization
- 🧺 Supports better laundry scheduling
- 🧭 Enables data-driven hostel operations

---

## 🧪 Dependencies (Python)

From `python-ml/requirements.txt`:

- `pandas==2.2.3`
- `prophet==1.1.6`

---

## 🗺️ Future Enhancements

- Integrate model output into a live dashboard UI
- Add hostel/block-level filtering
- Add anomaly detection for unusual spikes
- Provide recommendation: "Best time to do laundry" 💡

---

## 👨‍💻 Week 9 Focus

This week is focused on **building and validating the ML forecasting core**.
UI/API integration can be layered on top in later iterations.

---

## 🙌 Final Note

Small prediction improvements can create a big student experience impact.

**Less waiting. Better planning. Smarter hostels.** 🏠✨
