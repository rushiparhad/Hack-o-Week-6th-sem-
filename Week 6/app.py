from pathlib import Path

import joblib
import pandas as pd
import plotly.express as px
import streamlit as st

from train_model import train_pipeline

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "sports_energy_hourly.csv"
MODEL_PATH = BASE_DIR / "sports_lstm_model.keras"
META_PATH = BASE_DIR / "sports_lstm_bundle.pkl"
PRED_PATH = BASE_DIR / "post_event_predictions.csv"


@st.cache_resource
def load_or_train_assets() -> dict:
    if not (MODEL_PATH.exists() and META_PATH.exists() and DATA_PATH.exists() and PRED_PATH.exists()):
        train_pipeline(
            data_path=DATA_PATH,
            model_path=MODEL_PATH,
            meta_path=META_PATH,
        )

    try:
        from tensorflow.keras.models import load_model
    except Exception as exc:
        raise ImportError(
            "TensorFlow is required to run this dashboard. Install requirements first."
        ) from exc

    meta = joblib.load(META_PATH)
    model = load_model(MODEL_PATH)
    hourly_df = pd.read_csv(DATA_PATH)
    pred_df = pd.read_csv(PRED_PATH)

    return {
        "meta": meta,
        "model": model,
        "hourly_df": hourly_df,
        "pred_df": pred_df,
    }


def main() -> None:
    st.set_page_config(page_title="Sports Facility Night Usage", layout="wide")

    st.title("Sports Facility Night Usage")
    st.caption(
        "Simple LSTM model trained on hourly usage patterns to predict post-event electricity demand."
    )

    assets = load_or_train_assets()
    metrics = assets["meta"]["metrics"]
    pred_df = assets["pred_df"].copy()

    with st.sidebar:
        st.header("Dashboard Filters")
        all_day_types = sorted(pred_df["day_type"].dropna().unique().tolist())
        default_types = [d for d in all_day_types if "Event" in d or "Tournament" in d] or all_day_types

        selected_day_types = st.multiselect(
            "Day Type",
            options=all_day_types,
            default=default_types,
        )

    filtered = pred_df[pred_df["day_type"].isin(selected_day_types)].copy()
    if filtered.empty:
        st.warning("No rows match the selected day type filter.")
        return

    filtered["timestamp"] = pd.to_datetime(filtered["timestamp"])
    filtered["error_kwh"] = (filtered["predicted_kwh"] - filtered["actual_kwh"]).abs()

    metric_cols = st.columns(4)
    metric_cols[0].metric("Model MAE", f"{metrics['mae']:.2f} kWh")
    metric_cols[1].metric("Model RMSE", f"{metrics['rmse']:.2f} kWh")
    metric_cols[2].metric("Model R2", f"{metrics['r2']:.2f}")
    metric_cols[3].metric("Filtered Samples", f"{len(filtered)}")

    st.subheader("Post-Event Hourly Prediction (Actual vs LSTM)")
    selected_dates = sorted(filtered["date"].unique().tolist())
    selected_date = st.selectbox("Date", options=selected_dates, index=max(0, len(selected_dates) - 1))

    day_slice = filtered[filtered["date"] == selected_date].sort_values("timestamp")
    line_df = day_slice.melt(
        id_vars=["timestamp", "hour", "day_type"],
        value_vars=["actual_kwh", "predicted_kwh"],
        var_name="series",
        value_name="electricity_kwh",
    )

    fig_line = px.line(
        line_df,
        x="timestamp",
        y="electricity_kwh",
        color="series",
        markers=True,
        title=f"Post-Event Usage on {selected_date}",
        labels={"timestamp": "Time", "electricity_kwh": "Electricity (kWh)", "series": "Series"},
    )
    st.plotly_chart(fig_line, use_container_width=True)

    st.subheader("Average Post-Event Usage by Hour")
    avg_df = (
        filtered.groupby(["day_type", "hour"], as_index=False)[["actual_kwh", "predicted_kwh"]]
        .mean()
        .round(2)
    )
    avg_long = avg_df.melt(
        id_vars=["day_type", "hour"],
        value_vars=["actual_kwh", "predicted_kwh"],
        var_name="series",
        value_name="avg_kwh",
    )

    fig_avg = px.bar(
        avg_long,
        x="hour",
        y="avg_kwh",
        color="series",
        barmode="group",
        facet_col="day_type",
        title="Day-Type Filtered Average Usage",
        labels={"hour": "Hour", "avg_kwh": "Average kWh", "series": "Series"},
    )
    st.plotly_chart(fig_avg, use_container_width=True)

    st.subheader("Detailed Predictions")
    display_df = filtered.sort_values("timestamp").copy()
    display_df["timestamp"] = display_df["timestamp"].dt.strftime("%Y-%m-%d %H:%M")
    st.dataframe(
        display_df[["timestamp", "day_type", "hour", "actual_kwh", "predicted_kwh", "error_kwh"]],
        use_container_width=True,
    )


if __name__ == "__main__":
    main()
