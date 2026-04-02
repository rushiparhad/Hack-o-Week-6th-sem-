# Heart Rate Irregularity Detection API

This project trains a simple **Isolation Forest** model on heart-rate values and exposes predictions over REST.

## Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Run API

```bash
uvicorn app.main:app --reload --port 8000
```

Open docs at: `http://127.0.0.1:8000/docs`

## Train Model

```bash
curl -X POST "http://127.0.0.1:8000/train" \
  -H "Content-Type: application/json" \
  -d '{
    "heart_rates": [72, 75, 78, 80, 76, 74, 73, 77, 79, 81, 70, 71, 69, 82, 83, 85, 88, 90],
    "contamination": 0.1
  }'
```

## Predict Irregularities

```bash
curl -X POST "http://127.0.0.1:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "heart_rates": [68, 72, 45, 90, 160]
  }'
```

Response entries include:
- `heart_rate`
- `is_irregular` (`true` for anomalies)
- `anomaly_score` (lower values are more anomalous)
