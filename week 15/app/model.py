from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest


MODEL_PATH = Path("data/isolation_forest_heart_rate.joblib")


@dataclass
class TrainSummary:
    samples: int
    contamination: float


def _to_feature_array(heart_rates: list[float]) -> np.ndarray:
    values = np.asarray(heart_rates, dtype=float)
    if values.ndim != 1:
        raise ValueError("Heart rate input must be a flat list of numbers.")
    if values.size < 10:
        raise ValueError("At least 10 samples are required to train a stable model.")
    if np.any(values <= 0):
        raise ValueError("Heart rate values must be positive numbers.")
    return values.reshape(-1, 1)


def train_model(heart_rates: list[float], contamination: float = 0.05) -> TrainSummary:
    if contamination <= 0 or contamination >= 0.5:
        raise ValueError("contamination must be > 0 and < 0.5")

    x = _to_feature_array(heart_rates)
    model = IsolationForest(
        n_estimators=200,
        contamination=contamination,
        random_state=42,
    )
    model.fit(x)
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    return TrainSummary(samples=len(heart_rates), contamination=contamination)


def load_model() -> IsolationForest:
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Model is not trained yet.")
    model = joblib.load(MODEL_PATH)
    if not isinstance(model, IsolationForest):
        raise TypeError("Saved model is not an IsolationForest instance.")
    return model


def predict_irregularities(heart_rates: list[float]) -> list[dict]:
    if not heart_rates:
        raise ValueError("heart_rates must contain at least one value.")
    if any(v <= 0 for v in heart_rates):
        raise ValueError("Heart rate values must be positive numbers.")

    x = np.asarray(heart_rates, dtype=float).reshape(-1, 1)
    model = load_model()
    pred = model.predict(x)  # 1 normal, -1 anomaly
    scores = model.decision_function(x)  # lower means more anomalous

    results = []
    for hr, label, score in zip(heart_rates, pred, scores):
        results.append(
            {
                "heart_rate": float(hr),
                "is_irregular": bool(label == -1),
                "anomaly_score": float(score),
            }
        )
    return results
