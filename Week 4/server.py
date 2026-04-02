from fastapi import FastAPI, WebSocket
import joblib
import numpy as np
import asyncio
import random
import pandas as pd

app = FastAPI()

model = joblib.load("lunch_demand_model.pkl")


# Historical stats (example values – replace with real ones)
historical_mean = 200
historical_std = 50

def detect_surge(prediction):
    threshold = historical_mean + 1.5 * historical_std
    return prediction > threshold

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    while True:
        # Simulated live weather data for features: T, rh, wv
        T = random.uniform(0.2, 0.8)  # Temperature
        rh = random.uniform(0.3, 0.9) # Relative Humidity
        wv = random.uniform(0.1, 1.6) # Windspeed (range from your data)

        day_of_week = random.randint(0, 6)
        month = random.randint(1, 12)
        is_weekend = 1 if day_of_week in [5,6] else 0

        X_live = np.array([[T, rh, wv, day_of_week, month, is_weekend]])
        prediction = model.predict(X_live)[0]

        await websocket.send_json({
            "T": T,
            "rh": rh,
            "wv": wv,
            "predicted_demand": float(prediction)
        })

        await asyncio.sleep(2)
        print("Sending prediction:", prediction)
