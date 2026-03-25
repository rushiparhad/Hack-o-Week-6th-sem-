import argparse
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def generate_sports_energy_data(
    start_date: str = "2025-01-01",
    num_days: int = 210,
    random_state: int = 42,
) -> pd.DataFrame:
    """Generate synthetic hourly electricity data for a sports facility."""
    rng = np.random.default_rng(random_state)

    timestamps = pd.date_range(start=start_date, periods=num_days * 24, freq="h")
    df = pd.DataFrame({"timestamp": timestamps})
    df["date"] = df["timestamp"].dt.date.astype(str)
    df["hour"] = df["timestamp"].dt.hour
    df["day_of_week"] = df["timestamp"].dt.dayofweek
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)

    def sample_day_type(is_weekend: int) -> str:
        roll = rng.random()
        if is_weekend:
            if roll < 0.44:
                return "Weekend Event"
            if roll < 0.88:
                return "Weekend Non-Event"
            return "Tournament"
        if roll < 0.25:
            return "Weekday Event"
        if roll < 0.97:
            return "Weekday Non-Event"
        return "Tournament"

    day_df = df[["date", "is_weekend"]].drop_duplicates().copy()
    day_df["day_type"] = day_df["is_weekend"].apply(sample_day_type)

    attendance_map = {
        "Weekday Non-Event": (120, 360),
        "Weekday Event": (700, 2100),
        "Weekend Non-Event": (200, 520),
        "Weekend Event": (900, 2900),
        "Tournament": (2300, 5200),
    }

    event_end_map = {
        "Weekday Non-Event": (19, 20),
        "Weekday Event": (21, 22),
        "Weekend Non-Event": (20, 21),
        "Weekend Event": (22, 23),
        "Tournament": (22, 23),
    }

    attendance = []
    event_end_hour = []
    for day_type in day_df["day_type"]:
        lo, hi = attendance_map[day_type]
        attendance.append(int(rng.integers(lo, hi + 1)))
        end_lo, end_hi = event_end_map[day_type]
        event_end_hour.append(int(rng.integers(end_lo, end_hi + 1)))

    day_df["attendance"] = attendance
    day_df["event_end_hour"] = event_end_hour
    day_df["is_event_day"] = day_df["day_type"].str.contains("Event|Tournament").astype(int)

    df = df.merge(day_df, on=["date", "is_weekend"], how="left")

    temp_cycle = 27 + 6 * np.sin((df["hour"] - 8) * 2 * np.pi / 24)
    temp_noise = rng.normal(0, 1.2, len(df))
    temperature_c = temp_cycle + temp_noise

    base_load = 110 + 8 * df["is_weekend"] + 0.9 * (temperature_c - 24)

    daytime_activity = np.where((df["hour"] >= 9) & (df["hour"] <= 18), 1.0, 0.35)
    event_boost = df["is_event_day"] * daytime_activity * (df["attendance"] / 1700) * 42

    # Post-event cleanup and cooling tail (main target behavior for prediction)
    hours_after_end = df["hour"] - df["event_end_hour"]
    tail_same_day = np.where((hours_after_end >= 0) & (hours_after_end <= 3), np.exp(-hours_after_end / 1.9), 0)

    # Midnight continuation for late-ending events.
    midnight_after_end = (df["hour"] + 24) - df["event_end_hour"]
    tail_next_day = np.where(
        (df["hour"] <= 2) & (midnight_after_end >= 1) & (midnight_after_end <= 5),
        np.exp(-(midnight_after_end - 1) / 1.8),
        0,
    )

    post_event_tail = (tail_same_day + tail_next_day) * df["is_event_day"] * (df["attendance"] / 1600) * 55

    noise = rng.normal(0, 5.0, len(df))
    electricity_kwh = base_load + event_boost + post_event_tail + noise

    df["temperature_c"] = np.round(temperature_c, 2)
    df["electricity_kwh"] = np.clip(np.round(electricity_kwh, 2), 70, None)

    return df[[
        "timestamp",
        "date",
        "hour",
        "day_of_week",
        "day_type",
        "is_weekend",
        "is_event_day",
        "attendance",
        "event_end_hour",
        "temperature_c",
        "electricity_kwh",
    ]]


def add_time_features(df: pd.DataFrame) -> pd.DataFrame:
    data = df.copy()
    data["hour_sin"] = np.sin(2 * np.pi * data["hour"] / 24)
    data["hour_cos"] = np.cos(2 * np.pi * data["hour"] / 24)
    data["attendance_scaled"] = data["attendance"] / data["attendance"].max()
    data["kwh_lag1"] = data["electricity_kwh"].shift(1).bfill()
    data["kwh_lag2"] = data["electricity_kwh"].shift(2).bfill()
    return data


def create_post_event_sequences(
    df: pd.DataFrame,
    seq_len: int = 6,
) -> tuple[np.ndarray, np.ndarray, pd.DataFrame, dict]:
    """Build LSTM sequences targeting post-event hours."""
    post_event_hours = {22, 23, 0, 1, 2}

    feature_cols = [
        "electricity_kwh",
        "temperature_c",
        "hour_sin",
        "hour_cos",
        "is_weekend",
        "is_event_day",
        "attendance_scaled",
        "kwh_lag1",
        "kwh_lag2",
    ]

    means = df[feature_cols].mean()
    stds = df[feature_cols].std().replace(0, 1.0)
    df_scaled = df.copy()
    df_scaled[feature_cols] = (df_scaled[feature_cols] - means) / stds

    X_list = []
    y_list = []
    idx_list = []

    for i in range(seq_len, len(df_scaled)):
        current_hour = int(df_scaled.iloc[i]["hour"])
        if current_hour not in post_event_hours:
            continue

        history = df_scaled.iloc[i - seq_len : i]
        if len(history) != seq_len:
            continue

        X_list.append(history[feature_cols].to_numpy(dtype=np.float32))
        y_list.append(float(df.iloc[i]["electricity_kwh"]))
        idx_list.append(i)

    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list, dtype=np.float32)
    meta = df.iloc[idx_list].copy().reset_index(drop=True)

    scaler = {
        "means": means.to_dict(),
        "stds": stds.to_dict(),
        "feature_cols": feature_cols,
        "seq_len": seq_len,
        "post_event_hours": sorted(post_event_hours),
    }
    return X, y, meta, scaler


def build_lstm(input_shape: tuple[int, int]):
    try:
        from tensorflow.keras.layers import LSTM, Dense
        from tensorflow.keras.models import Sequential
    except Exception as exc:
        raise ImportError(
            "TensorFlow is required for LSTM training. Install with: pip install tensorflow"
        ) from exc

    model = Sequential(
        [
            LSTM(32, input_shape=input_shape),
            Dense(16, activation="relu"),
            Dense(1),
        ]
    )
    model.compile(optimizer="adam", loss="mse")
    return model


def train_pipeline(
    data_path: Path,
    model_path: Path,
    meta_path: Path,
    random_state: int = 42,
) -> dict:
    data_path.parent.mkdir(parents=True, exist_ok=True)
    model_path.parent.mkdir(parents=True, exist_ok=True)
    meta_path.parent.mkdir(parents=True, exist_ok=True)

    raw_df = generate_sports_energy_data(random_state=random_state)
    raw_df = add_time_features(raw_df)
    raw_df.to_csv(data_path, index=False)

    X, y, sample_meta, scaler = create_post_event_sequences(raw_df, seq_len=6)

    if len(X) < 100:
        raise ValueError("Not enough sequence samples generated for training.")

    split_idx = int(0.8 * len(X))
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    test_meta = sample_meta.iloc[split_idx:].reset_index(drop=True)

    model = build_lstm((X_train.shape[1], X_train.shape[2]))
    model.fit(
        X_train,
        y_train,
        validation_split=0.1,
        epochs=12,
        batch_size=32,
        verbose=0,
    )

    y_pred = model.predict(X_test, verbose=0).flatten()

    metrics = {
        "mae": float(mean_absolute_error(y_test, y_pred)),
        "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
        "r2": float(r2_score(y_test, y_pred)),
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
    }

    model.save(model_path)

    test_predictions = test_meta[["timestamp", "date", "day_type", "hour"]].copy()
    test_predictions["actual_kwh"] = np.round(y_test, 2)
    test_predictions["predicted_kwh"] = np.round(y_pred, 2)
    test_predictions.to_csv(data_path.with_name("post_event_predictions.csv"), index=False)

    metadata = {
        "metrics": metrics,
        "scaler": scaler,
        "feature_columns": scaler["feature_cols"],
        "model_path": str(model_path.name),
        "data_path": str(data_path.name),
        "predictions_path": "post_event_predictions.csv",
    }

    joblib.dump(metadata, meta_path)
    with open(meta_path.with_suffix(".json"), "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    return metrics


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Train a simple LSTM for sports facility post-event electricity prediction."
    )
    parser.add_argument(
        "--data-path",
        type=Path,
        default=Path("sports_energy_hourly.csv"),
        help="Path to save generated training data.",
    )
    parser.add_argument(
        "--model-path",
        type=Path,
        default=Path("sports_lstm_model.keras"),
        help="Path to save trained LSTM model.",
    )
    parser.add_argument(
        "--meta-path",
        type=Path,
        default=Path("sports_lstm_bundle.pkl"),
        help="Path to save metadata bundle.",
    )
    args = parser.parse_args()

    metrics = train_pipeline(
        data_path=args.data_path,
        model_path=args.model_path,
        meta_path=args.meta_path,
    )

    print("Training complete")
    print(f"MAE:  {metrics['mae']:.3f}")
    print(f"RMSE: {metrics['rmse']:.3f}")
    print(f"R2:   {metrics['r2']:.3f}")
    print(f"Train Samples: {metrics['train_samples']}")
    print(f"Test Samples:  {metrics['test_samples']}")


if __name__ == "__main__":
    main()
