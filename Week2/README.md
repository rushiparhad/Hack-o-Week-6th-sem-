# 🏫📶⚡ Classroom Usage Forecasting (Week 2)

A **Week 2 project** that combines **Classroom Energy Usage** data with **Occupancy estimation using Wi-Fi connected devices** to generate an **Enhanced Next-Hour Energy Forecast**.  
This project is implemented in a **Jupyter Notebook** and focuses on **data merging, analysis, visualization, and forecasting** for smart campus/classroom monitoring.

---

## 📌 Project Title
**Classroom Usage Forecasting (Week 2)**  
**(Combined Energy Usage + Occupancy using Wi-Fi Devices + Next-Hour Forecasting)**

---

## 🚀 Project Overview

In educational institutes, classrooms consume electricity due to:
- Lighting
- Fans / AC
- Projectors
- Charging points
- Computers / smart boards

Even when occupancy is low, energy may still be consumed.  
During peak hours (classes, labs, exams), both **occupancy and energy usage increase**.

This project helps to:
✅ Understand classroom usage patterns  
✅ Estimate occupancy using Wi-Fi device count  
✅ Identify energy usage trends  
✅ Forecast **next-hour energy demand**  

---

## 🎯 Why This Project?

This project is useful because it helps institutions:
- Reduce unnecessary energy consumption
- Improve classroom scheduling
- Monitor peak usage hours
- Support **smart campus energy planning**
- Predict upcoming energy load for better resource management

---

## 🧩 Problem Statement

**Combine classroom energy usage data with occupancy information (Wi-Fi connected devices) and forecast the next-hour energy consumption to support intelligent classroom energy monitoring and optimization.**

---

## 🧠 Solution / Methodology (Step-by-Step)

### 1️⃣ Data Collection
- Historical classroom energy usage readings
- Wi-Fi device counts used as an occupancy indicator

### 2️⃣ Data Preprocessing
- Convert timestamps into proper datetime format
- Remove invalid / missing values
- Ensure consistent time intervals (hourly alignment)
- Sort data by time

### 3️⃣ Data Integration (Core Part)
- Merge energy usage + occupancy datasets using timestamp
- Create a combined dataset for analysis

### 4️⃣ Exploratory Data Analysis (EDA)
- Visualize energy usage trend over time
- Visualize occupancy (Wi-Fi devices) trend over time
- Compare energy vs occupancy relationship
- Identify peak classroom usage hours

### 5️⃣ Forecasting
- Generate an **Enhanced Next-Hour Energy Forecast**
- Use time-series based forecasting logic to estimate energy usage for the upcoming hour

### 6️⃣ Results & Insights
- Show combined plots
- Provide next-hour forecast output
- Provide interpretation for energy planning

---

## ✨ Key Features

✅ Combined Energy + Occupancy dataset creation  
✅ Occupancy estimation using Wi-Fi device count  
✅ Trend analysis and visualization  
✅ Next-hour energy forecasting  
✅ Notebook-based project (easy to run and understand)  
✅ Suitable for smart campus / classroom monitoring use cases  

---

## 📊 What This Project Outputs

This project generates:
- A combined dataset containing:
  - timestamp
  - energy usage (kWh)
  - Wi-Fi connected devices (occupancy proxy)
- Visualizations:
  - Energy usage trend chart
  - Occupancy trend chart
  - Combined energy + occupancy plot
- Forecast:
  - Predicted next-hour energy usage

---

## 🧑‍💻 Tech Stack Used

- **Python**
- **Jupyter Notebook**
- **Pandas** → data processing, merging
- **NumPy** → numeric calculations
- **Matplotlib / Plotting** → charts & trends
- **Forecasting approach** → time-series based next-hour prediction

---

## 📁 Files Included

- `Classroom_Usage_Forecasting(week 2).ipynb` → Main notebook (full implementation)
- `README.md` → Project documentation
- `requirements.txt` → Dependencies (optional but recommended)
- `dataset/` → (optional) store datasets here

---

## 🗂 Recommended Folder Structure

```bash
Classroom-Usage-Forecasting-Week2/
│── Classroom_Usage_Forecasting(week 2).ipynb
│── README.md
│── requirements.txt
│── dataset/                # optional (store CSV files here)
│── outputs/                # optional (store exported plots/results)
│── venv/                   # ignored in GitHub
