# Sports Facility Night Usage (Week 6)

This project predicts **post-event nighttime electricity usage** in a sports facility using a **simple LSTM (RNN)** trained on hourly energy patterns.

## What this includes

- Synthetic hourly sports-facility electricity dataset generation
- LSTM model training for post-event hours (`22:00` to `02:00`)
- Streamlit dashboard with interactive **day type filters**
- Model evaluation metrics: MAE, RMSE, R2

## Project files

- `train_model.py` - Generates data and trains LSTM model
- `app.py` - Interactive Streamlit dashboard
- `requirements.txt` - Python dependencies

## Setup

```bash
cd Week6
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Train model

```bash
python train_model.py
```

This creates:

- `sports_energy_hourly.csv`
- `sports_lstm_model.keras`
- `sports_lstm_bundle.pkl`
- `post_event_predictions.csv`

## Run dashboard

```bash
streamlit run app.py
```

Use the sidebar to filter by day type (`Weekday Event`, `Weekend Event`, `Tournament`, etc.) and inspect predicted vs actual nighttime loads.

## Notes

- If model/data files do not exist, the dashboard auto-trains them on startup.
- TensorFlow is required because the model uses an LSTM layer.
