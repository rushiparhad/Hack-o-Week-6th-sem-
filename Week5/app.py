from pathlib import Path

import joblib
import pandas as pd
import plotly.express as px
import streamlit as st

from train_model import train_pipeline

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "hvac_model.pkl"
DATA_PATH = BASE_DIR / "hvac_data.csv"


@st.cache_resource
def load_or_train_model_bundle() -> dict:
    if not MODEL_PATH.exists():
        train_pipeline(data_path=DATA_PATH, model_path=MODEL_PATH)
    return joblib.load(MODEL_PATH)


def make_zone_hour_predictions(
    bundle: dict,
    occupancy: int,
    temperature_c: float,
    humidity_pct: float,
    day_type: str,
) -> pd.DataFrame:
    zones = bundle["zones"]
    zone_area_map = bundle["zone_area_map"]
    model = bundle["model"]

    is_weekend = 1 if day_type == "Weekend" else 0

    rows = []
    for zone in zones:
        for hour in range(8, 21):
            rows.append(
                {
                    "zone": zone,
                    "hour": hour,
                    "occupancy": occupancy,
                    "temperature_c": temperature_c,
                    "humidity_pct": humidity_pct,
                    "is_weekend": is_weekend,
                    "zone_area_m2": zone_area_map[zone],
                }
            )

    pred_df = pd.DataFrame(rows)
    feature_cols = bundle["feature_cols"]
    pred_df["predicted_cooling_kwh"] = model.predict(pred_df[feature_cols])

    return pred_df


def main() -> None:
    st.set_page_config(page_title="HVAC Optimization in Labs", layout="wide")

    st.title("HVAC Optimization in Labs")
    st.caption(
        "Decision Tree model using occupancy and temperature signals to forecast cooling load."
    )

    bundle = load_or_train_model_bundle()

    with st.sidebar:
        st.header("Input Controls")
        occupancy = st.slider("Expected Occupancy", min_value=5, max_value=65, value=34)
        temperature_c = st.slider(
            "Ambient Temperature (°C)",
            min_value=18.0,
            max_value=40.0,
            value=29.0,
            step=0.5,
        )
        humidity_pct = st.slider(
            "Humidity (%)", min_value=25.0, max_value=85.0, value=55.0, step=1.0
        )
        day_type = st.selectbox("Day Type", options=["Weekday", "Weekend"])

    pred_df = make_zone_hour_predictions(
        bundle=bundle,
        occupancy=occupancy,
        temperature_c=temperature_c,
        humidity_pct=humidity_pct,
        day_type=day_type,
    )

    heatmap_df = pred_df.pivot(
        index="zone", columns="hour", values="predicted_cooling_kwh"
    )

    fig = px.imshow(
        heatmap_df,
        text_auto=".1f",
        aspect="auto",
        color_continuous_scale="YlOrRd",
        labels={"x": "Hour of Day", "y": "Lab Zone", "color": "Cooling kWh"},
        title="Zone-wise Cooling Forecast Heatmap",
    )

    metrics_col1, metrics_col2, metrics_col3 = st.columns(3)
    metrics = bundle["metrics"]
    metrics_col1.metric("Model MAE", f"{metrics['mae']:.2f}")
    metrics_col2.metric("Model RMSE", f"{metrics['rmse']:.2f}")
    metrics_col3.metric("Model R²", f"{metrics['r2']:.2f}")

    st.plotly_chart(fig, use_container_width=True)

    st.subheader("Top Predicted Cooling Loads")
    top_rows = pred_df.sort_values("predicted_cooling_kwh", ascending=False).head(12)
    top_rows = top_rows[["zone", "hour", "predicted_cooling_kwh"]]
    top_rows["hour"] = top_rows["hour"].astype(str) + ":00"
    st.dataframe(top_rows, use_container_width=True)


if __name__ == "__main__":
    main()
