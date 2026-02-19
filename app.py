import os
import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from statsmodels.tsa.holtwinters import ExponentialSmoothing

# -----------------------------
# PAGE SETTINGS
# -----------------------------
st.set_page_config(page_title="Library Energy During Exams", layout="wide")

st.title("📚⚡ Library Energy During Exams Dashboard")
st.write("Historical energy usage + exam calendar + semester-end forecast using Exponential Smoothing + gauge view.")

# -----------------------------
# LOAD DATA (ABSOLUTE PATH FIX)
# -----------------------------
@st.cache_data
def load_data():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    energy_path = os.path.join(BASE_DIR, "energy_usage.csv")
    exam_path = os.path.join(BASE_DIR, "exam_calendar.csv")

    # Read CSV files
    energy = pd.read_csv(energy_path)
    exams = pd.read_csv(exam_path)

    # Convert date columns
    energy["date"] = pd.to_datetime(energy["date"])
    exams["date"] = pd.to_datetime(exams["date"])

    # Sort energy data
    energy = energy.sort_values("date")

    return energy, exams


energy_df, exam_df = load_data()

# -----------------------------
# MERGE EXAM CALENDAR WITH ENERGY DATA
# -----------------------------
energy_df["is_exam_day"] = energy_df["date"].isin(exam_df["date"]).astype(int)

# Add event name for exam days
energy_df = energy_df.merge(exam_df, on="date", how="left")
energy_df["event_name"] = energy_df["event_name"].fillna("Normal Day")

# -----------------------------
# SIDEBAR FILTERS
# -----------------------------
st.sidebar.header("📌 Filters")

min_date = energy_df["date"].min()
max_date = energy_df["date"].max()

start_date = st.sidebar.date_input("Start Date", min_date.date())
end_date = st.sidebar.date_input("End Date", max_date.date())

start_date = pd.to_datetime(start_date)
end_date = pd.to_datetime(end_date)

filtered_df = energy_df[(energy_df["date"] >= start_date) & (energy_df["date"] <= end_date)].copy()

# -----------------------------
# DATA PREVIEW
# -----------------------------
with st.expander("📄 View Dataset (Filtered)"):
    st.dataframe(filtered_df, use_container_width=True)

# -----------------------------
# METRICS
# -----------------------------
total_energy = filtered_df["energy_kwh"].sum()
avg_energy = filtered_df["energy_kwh"].mean()
exam_days_count = int(filtered_df["is_exam_day"].sum())

col1, col2, col3 = st.columns(3)
col1.metric("🔋 Total Energy (kWh)", f"{total_energy:.2f}")
col2.metric("📊 Average Daily Energy (kWh)", f"{avg_energy:.2f}")
col3.metric("📝 Exam Days in Range", exam_days_count)

# -----------------------------
# ENERGY TREND LINE CHART
# -----------------------------
st.subheader("📈 Energy Usage Trend (Exam Days Highlighted)")

fig_trend = go.Figure()

normal_days = filtered_df[filtered_df["is_exam_day"] == 0]
exam_days = filtered_df[filtered_df["is_exam_day"] == 1]

fig_trend.add_trace(go.Scatter(
    x=normal_days["date"],
    y=normal_days["energy_kwh"],
    mode="lines+markers",
    name="Normal Days"
))

fig_trend.add_trace(go.Scatter(
    x=exam_days["date"],
    y=exam_days["energy_kwh"],
    mode="markers",
    marker=dict(size=12),
    name="Exam Days"
))

fig_trend.update_layout(
    xaxis_title="Date",
    yaxis_title="Energy (kWh)",
    height=420
)

st.plotly_chart(fig_trend, use_container_width=True)

# -----------------------------
# EXAM vs NORMAL COMPARISON
# -----------------------------
st.subheader("📌 Exam Day vs Normal Day Energy Comparison")

exam_avg = filtered_df[filtered_df["is_exam_day"] == 1]["energy_kwh"].mean()
normal_avg = filtered_df[filtered_df["is_exam_day"] == 0]["energy_kwh"].mean()

colA, colB = st.columns(2)

if np.isnan(exam_avg):
    colA.metric("📝 Avg Energy on Exam Days", "No exam days")
else:
    colA.metric("📝 Avg Energy on Exam Days", f"{exam_avg:.2f} kWh")

if np.isnan(normal_avg):
    colB.metric("📅 Avg Energy on Normal Days", "No normal days")
else:
    colB.metric("📅 Avg Energy on Normal Days", f"{normal_avg:.2f} kWh")

# -----------------------------
# FORECASTING USING EXPONENTIAL SMOOTHING
# -----------------------------
st.subheader("🔮 Semester-End Forecast (Exponential Smoothing)")

forecast_days = st.slider("Select Forecast Days", min_value=3, max_value=30, value=7)

# Prepare time series
ts = energy_df.set_index("date")["energy_kwh"].asfreq("D")

# Fill missing days (if any)
ts = ts.ffill()

# Train model
model = ExponentialSmoothing(ts, trend="add", seasonal=None)
fit = model.fit()

# Forecast
forecast = fit.forecast(forecast_days)

forecast_df = pd.DataFrame({
    "date": forecast.index,
    "forecast_energy_kwh": forecast.values
})

# Forecast plot
fig_forecast = go.Figure()

fig_forecast.add_trace(go.Scatter(
    x=ts.index,
    y=ts.values,
    mode="lines",
    name="Actual Energy"
))

fig_forecast.add_trace(go.Scatter(
    x=forecast_df["date"],
    y=forecast_df["forecast_energy_kwh"],
    mode="lines+markers",
    name="Forecast Energy"
))

fig_forecast.update_layout(
    xaxis_title="Date",
    yaxis_title="Energy (kWh)",
    height=420
)

st.plotly_chart(fig_forecast, use_container_width=True)

# -----------------------------
# GAUGE FOR SEMESTER-END FORECAST
# -----------------------------
st.subheader("⏳ Forecast Gauge (Semester-End Load)")

semester_end_energy = float(forecast_df["forecast_energy_kwh"].sum())

# Gauge max range (dynamic)
max_gauge = max(float(energy_df["energy_kwh"].max()) * forecast_days, semester_end_energy * 1.2)

fig_gauge = go.Figure(go.Indicator(
    mode="gauge+number",
    value=semester_end_energy,
    title={"text": f"Predicted Total Energy for Next {forecast_days} Days (kWh)"},
    gauge={
        "axis": {"range": [0, max_gauge]},
        "steps": [
            {"range": [0, max_gauge * 0.4], "color": "lightgreen"},
            {"range": [max_gauge * 0.4, max_gauge * 0.75], "color": "khaki"},
            {"range": [max_gauge * 0.75, max_gauge], "color": "lightcoral"}
        ],
        "threshold": {
            "line": {"color": "red", "width": 4},
            "thickness": 0.75,
            "value": semester_end_energy
        }
    }
))

st.plotly_chart(fig_gauge, use_container_width=True)

# -----------------------------
# EXAM CALENDAR TABLE
# -----------------------------
st.subheader("📅 Exam / Event Calendar")
st.dataframe(exam_df.sort_values("date"), use_container_width=True)

st.success("✅ Dashboard Loaded Successfully!")