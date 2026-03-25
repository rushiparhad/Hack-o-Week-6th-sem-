# HVAC Optimization in Labs (Week 5)

This project forecasts HVAC cooling needs for campus lab zones using a **Decision Tree** trained on occupancy and temperature-driven data.

## What this includes

- Synthetic HVAC dataset generation (`hvac_data.csv`)
- Decision Tree training pipeline (`train_model.py`)
- Interactive Streamlit dashboard with:
  - Zone-wise hourly **heatmap** of predicted cooling load
  - Top demand slots table
  - Model performance metrics (MAE, RMSE, R²)

## Project files

- `train_model.py` - Generates data and trains the model
- `app.py` - Streamlit dashboard for heatmap-driven zone predictions
- `requirements.txt` - Dependencies

## Setup

```bash
cd Week5
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Train model

```bash
python train_model.py
```

This creates:

- `hvac_data.csv`
- `hvac_model.pkl`

## Run dashboard

```bash
streamlit run app.py
```

Open the local URL shown by Streamlit (usually `http://localhost:8501`).

## Notes

- If `hvac_model.pkl` does not exist, the dashboard auto-trains the model on startup.
- Inputs in the sidebar adjust occupancy, ambient temperature, humidity, and day type.
