# 🌦 Weather-Driven Lunch Demand Forecasting

A real-time machine learning system that predicts lunch-hour demand using weather data and visualizes live predictions via WebSocket streaming.

---

## 🚀 Project Overview

This project predicts lunch-hour demand based on weather conditions such as temperature, humidity, and wind speed using Linear Regression.

The system includes:

- 📊 Machine Learning Model (Scikit-learn)
- ⚡ FastAPI Backend with WebSocket Streaming
- 📈 Real-Time Chart Dashboard (Chart.js)
- 🚨 Surge Detection Logic

---

## 🧠 Problem Statement

Predict lunch-hour demand surges using weather data and display real-time predictions on a live dashboard.

---

## 🏗 Architecture

Weather Data (Simulated / API)
        ↓
Linear Regression Model
        ↓
FastAPI WebSocket Server
        ↓
Live Chart.js Dashboard

---

## 📂 Project Structure

```
project/
│
├── train_model.py           # Model training pipeline
├── server.py                # FastAPI WebSocket server
├── index.html               # Real-time dashboard
├── requirements.txt         # Project dependencies
├── README.md                # Project documentation
└── .gitignore
```

---

## 📊 Features Used

- Temperature
- Humidity
- Wind Speed
- Day of Week
- Month
- Weekend Indicator

Target Variable:
- Lunch-hour demand (filtered between 11AM–2PM)

---

## ⚙️ Installation

### 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
cd <repo-name>
```

### 2️⃣ Create Virtual Environment

```bash
python -m venv venv
```

Activate:

**Windows**
```bash
venv\Scripts\activate
```

**Mac/Linux**
```bash
source venv/bin/activate
```

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 🏋️ Train the Model

```bash
python train_model.py
```

This will generate:

```
lunch_demand_model.pkl
```

---

## ▶️ Run the Server

```bash
uvicorn server:app --reload
```

Open in browser:

```
http://127.0.0.1:8000
```

---

## 📈 Live Dashboard

- Displays real-time demand predictions
- Updates every 2 seconds
- Detects surge conditions using statistical threshold

---

## 🚨 Surge Detection Logic

A surge is detected if:

```
prediction > mean + 1.5 × standard_deviation
```

This helps identify unusually high demand periods.

---

## 🛠 Technologies Used

- Python
- Scikit-learn
- FastAPI
- Uvicorn
- WebSockets
- Chart.js
- Pandas / NumPy

---

## 📌 Future Improvements

- Replace Linear Regression with Random Forest / XGBoost
- Integrate real weather API (OpenWeather / NOAA)
- Deploy to cloud (AWS / Render / Azure)
- Add LSTM time-series modeling
- Improve anomaly detection

---

## 📄 License

This project is for educational and demonstration purposes.

---