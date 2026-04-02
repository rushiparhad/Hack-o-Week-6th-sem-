import argparse
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeRegressor


def generate_synthetic_hvac_data(
    rows_per_zone: int = 350,
    random_state: int = 42,
) -> pd.DataFrame:
    """Create realistic synthetic data for HVAC cooling-load forecasting."""
    rng = np.random.default_rng(random_state)

    zones = ["Lab-A", "Lab-B", "Lab-C", "Lab-D", "Lab-E", "Lab-F"]
    zone_area = {
        "Lab-A": 95,
        "Lab-B": 110,
        "Lab-C": 88,
        "Lab-D": 130,
        "Lab-E": 104,
        "Lab-F": 120,
    }

    records = []
    for zone in zones:
        for _ in range(rows_per_zone):
            hour = int(rng.integers(8, 21))
            day_of_week = int(rng.integers(0, 7))
            is_weekend = int(day_of_week >= 5)

            occupancy = int(rng.integers(8, 58))
            temp_c = float(rng.uniform(19.0, 36.0))
            humidity = float(rng.uniform(30.0, 74.0))

            work_hour_bonus = 1.15 if 10 <= hour <= 17 else 0.90
            weekday_bonus = 1.10 if not is_weekend else 0.86
            zone_scale = zone_area[zone] / 100

            # Synthetic cooling load in kWh.
            base_load = (
                3.2
                + (temp_c - 20.0) * 0.55
                + occupancy * 0.12
                + humidity * 0.05
                + zone_scale * 1.9
            )
            cooling_need_kwh = base_load * work_hour_bonus * weekday_bonus
            cooling_need_kwh += rng.normal(0, 1.8)
            cooling_need_kwh = max(cooling_need_kwh, 1.8)

            records.append(
                {
                    "zone": zone,
                    "zone_area_m2": zone_area[zone],
                    "hour": hour,
                    "day_of_week": day_of_week,
                    "is_weekend": is_weekend,
                    "occupancy": occupancy,
                    "temperature_c": round(temp_c, 2),
                    "humidity_pct": round(humidity, 2),
                    "cooling_need_kwh": round(cooling_need_kwh, 2),
                }
            )

    return pd.DataFrame(records)


def train_pipeline(data_path: Path, model_path: Path, random_state: int = 42) -> dict:
    data_path.parent.mkdir(parents=True, exist_ok=True)
    model_path.parent.mkdir(parents=True, exist_ok=True)

    df = generate_synthetic_hvac_data(random_state=random_state)
    df.to_csv(data_path, index=False)

    feature_cols = [
        "occupancy",
        "temperature_c",
        "humidity_pct",
        "hour",
        "is_weekend",
        "zone_area_m2",
    ]
    target_col = "cooling_need_kwh"

    X = df[feature_cols]
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=random_state,
    )

    model = DecisionTreeRegressor(max_depth=6, random_state=random_state)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    metrics = {
        "mae": float(mean_absolute_error(y_test, y_pred)),
        "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
        "r2": float(r2_score(y_test, y_pred)),
    }

    bundle = {
        "model": model,
        "feature_cols": feature_cols,
        "zones": sorted(df["zone"].unique().tolist()),
        "zone_area_map": (
            df.groupby("zone")["zone_area_m2"].first().sort_index().to_dict()
        ),
        "metrics": metrics,
    }

    joblib.dump(bundle, model_path)
    return metrics


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Train a Decision Tree model for HVAC cooling-need prediction."
    )
    parser.add_argument(
        "--data-path",
        type=Path,
        default=Path("hvac_data.csv"),
        help="Path to save generated training data.",
    )
    parser.add_argument(
        "--model-path",
        type=Path,
        default=Path("hvac_model.pkl"),
        help="Path to save the trained model bundle.",
    )
    args = parser.parse_args()

    metrics = train_pipeline(data_path=args.data_path, model_path=args.model_path)
    print("Training complete")
    print(f"MAE:  {metrics['mae']:.3f}")
    print(f"RMSE: {metrics['rmse']:.3f}")
    print(f"R2:   {metrics['r2']:.3f}")


if __name__ == "__main__":
    main()
