# 📚⚡ Library Energy During Exams Dashboard (Week 3)

An **ultra-enhanced Streamlit dashboard** that analyzes **library energy usage patterns** during **normal days vs exam/event periods**, integrates an **exam calendar**, and generates **semester-end energy forecasts** using **Exponential Smoothing**.  
It includes **interactive charts, KPI metrics, data validation, backtesting accuracy, gauge meter visualization, and export options**.

---

## 📌 Table of Contents
- [Project Overview](#-project-overview)
- [Why This Project?](#-why-this-project)
- [Problem Statement](#-problem-statement)
- [Solution Approach](#-solution-approach)
- [Features](#-features)
- [Dashboard Pages](#-dashboard-pages)
- [Dataset Formats](#-dataset-formats)
- [Tech Stack](#-tech-stack)
- [How Forecasting Works](#-how-forecasting-works)
- [How to Run (Commands)](#-how-to-run-commands)
- [Project Structure](#-project-structure)
- [How to Use the Dashboard](#-how-to-use-the-dashboard)
- [Exports & Reports](#-exports--reports)
- [Troubleshooting](#-troubleshooting)
- [GitHub Push Commands](#-github-push-commands)
- [Future Enhancements](#-future-enhancements)
- [Author](#-author)

---

## 🚀 Project Overview

This project provides an **interactive visualization + forecasting system** for **library energy consumption**.

It helps understand:
- How energy usage changes during exam periods
- Whether exam days cause measurable spikes
- What the expected energy load is for upcoming semester-end days
- How to monitor and plan electricity usage efficiently

---

## 🎯 Why This Project?

During exams, the library experiences:
- Higher student footfall
- Longer study hours
- Increased lighting usage
- Higher fan/AC usage
- Increased charging + computer lab usage

This leads to:
- Higher electricity bills
- Potential overload risks
- Need for better energy scheduling

This dashboard helps in:
✅ Monitoring energy usage  
✅ Comparing exam days vs normal days  
✅ Forecasting future energy demand  
✅ Supporting energy optimization decisions  

---

## 🧩 Problem Statement

**Aggregate historical library energy usage and combine it with an event calendar (exam schedule).  
Build a forecasting model using Exponential Smoothing to predict semester-end energy usage.  
Display results and key metrics in a Streamlit dashboard with an interactive gauge.**

---

## 🧠 Solution Approach

### Step-by-step workflow:
1. Load historical energy usage data (`energy_usage.csv`)
2. Load exam/event calendar (`exam_calendar.csv`)
3. Clean and validate data
4. Merge energy data with exam calendar
5. Mark exam days and exam-window periods
6. Compute KPIs and comparisons (exam vs normal)
7. Aggregate daily/weekly/monthly usage trends
8. Train Exponential Smoothing model
9. Forecast energy usage for future days
10. Visualize results in Streamlit dashboard
11. Export reports (filtered data, KPI summary, forecast report)

---

## ✨ Features

### 📊 Data Analytics
- Total energy consumption (selected range)
- Average daily energy usage
- Peak energy usage day detection
- Top 5 highest energy usage days
- Rolling average trend line (7-day smoothing)

### 📅 Exam/Event Calendar Integration
- Marks exam days automatically
- Adds event names to energy timeline
- Shows exam/event calendar table
- Exam-window analysis (± 3 days around exam)

### 📈 Visualization
- Interactive line chart (energy trend)
- Exam-day markers highlight spikes
- Aggregation bar chart (weekly/monthly totals)
- Distribution comparison using box plot (exam vs normal)

### 🔮 Forecasting
- Exponential Smoothing model (trend-based)
- Forecast horizon selection (3–60 days)
- Backtesting window selection
- Forecast accuracy metric: **MAPE**
- Forecast table view

### 🧭 Gauge Meter
- Semester-end predicted total energy load displayed as gauge
- Status indicator: **LOW / MEDIUM / HIGH**
- Dynamic thresholds based on historical average usage

### 📤 Export & Reporting
- Download filtered dataset as CSV
- Download forecast report as CSV
- Download KPI summary report as CSV

---

## 📄 Dataset Formats

### ✅ `energy_usage.csv`
Required columns:
- `date` → `YYYY-MM-DD`
- `energy_kwh` → numeric

Example:
```csv
date,energy_kwh
2025-10-01,120
2025-10-02,130
