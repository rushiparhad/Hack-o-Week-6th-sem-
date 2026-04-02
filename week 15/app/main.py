from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse

from app.model import load_model, predict_irregularities, train_model
from app.schemas import PredictRequest, TrainRequest

app = FastAPI(
    title="Heart Rate Irregularity API",
    version="1.0.0",
    description="Train and serve an Isolation Forest model to flag heart-rate irregularities.",
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/", response_class=HTMLResponse)
def website() -> str:
    return """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Heart Rate Irregularity Checker</title>
  <style>
    :root {
      --bg: #f7f4ef;
      --card: #ffffff;
      --ink: #1f2937;
      --muted: #6b7280;
      --accent: #0f766e;
      --accent-2: #115e59;
      --danger: #b91c1c;
      --line: #e5e7eb;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Avenir Next", "Segoe UI", sans-serif;
      color: var(--ink);
      background:
        radial-gradient(circle at top left, #dff4ef 0%, transparent 45%),
        radial-gradient(circle at bottom right, #fde8d8 0%, transparent 40%),
        var(--bg);
      min-height: 100vh;
      padding: 24px;
    }
    .wrap {
      max-width: 900px;
      margin: 0 auto;
      display: grid;
      gap: 16px;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
    }
    h1 { margin: 0 0 8px; font-size: 1.6rem; }
    p { margin: 0; color: var(--muted); }
    label { display: block; margin: 10px 0 6px; font-weight: 600; }
    textarea, input {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 10px;
      font-size: 0.95rem;
    }
    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .btns { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
    button {
      border: 0;
      border-radius: 10px;
      background: var(--accent);
      color: #fff;
      padding: 10px 14px;
      font-weight: 700;
      cursor: pointer;
    }
    button.secondary { background: var(--accent-2); }
    #status { font-weight: 700; margin-top: 10px; }
    .ok { color: var(--accent); }
    .err { color: var(--danger); }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td {
      border-bottom: 1px solid var(--line);
      padding: 8px;
      text-align: left;
      font-size: 0.92rem;
    }
    .pill {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 0.78rem;
    }
    .normal { background: #dcfce7; color: #166534; }
    .irregular { background: #fee2e2; color: #991b1b; }
    @media (max-width: 720px) { .row { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>Heart Rate Irregularity Checker</h1>
      <p>Train an Isolation Forest model, then test incoming heart-rate values (bpm).</p>
    </div>

    <div class="card">
      <div class="row">
        <div>
          <label for="trainData">Training Heart Rates (comma-separated)</label>
          <textarea id="trainData" rows="5">72,75,78,80,76,74,73,77,79,81,70,71,69,82,83,85,88,90,65,67,68,66,64,63,62,61,59,58,57,56,55,54,92,94,96,98,100,102,45,44,43,160,162</textarea>
        </div>
        <div>
          <label for="predictData">Values To Check (comma-separated)</label>
          <textarea id="predictData" rows="5">68,72,45,90,160</textarea>
          <label for="contamination">Contamination</label>
          <input id="contamination" type="number" step="0.01" min="0.01" max="0.49" value="0.10" />
        </div>
      </div>

      <div class="btns">
        <button onclick="trainModel()">Train Model</button>
        <button class="secondary" onclick="predict()">Predict Irregularities</button>
      </div>
      <div id="status"></div>
      <div id="result"></div>
    </div>
  </div>

  <script>
    function parseCsvNumbers(text) {
      return text
        .split(",")
        .map(v => v.trim())
        .filter(Boolean)
        .map(Number)
        .filter(v => !Number.isNaN(v));
    }

    function setStatus(message, ok=true) {
      const el = document.getElementById("status");
      el.textContent = message;
      el.className = ok ? "ok" : "err";
    }

    async function trainModel() {
      const heartRates = parseCsvNumbers(document.getElementById("trainData").value);
      const contamination = Number(document.getElementById("contamination").value);
      const res = await fetch("/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heart_rates: heartRates, contamination })
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("Training failed: " + (data.detail || "Unknown error"), false);
        return;
      }
      setStatus(`Model trained on ${data.samples} samples.`, true);
    }

    async function predict() {
      const heartRates = parseCsvNumbers(document.getElementById("predictData").value);
      const res = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heart_rates: heartRates })
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("Prediction failed: " + (data.detail || "Unknown error"), false);
        return;
      }
      setStatus(`Scored ${data.total} values. Flagged ${data.flagged} irregular.`, true);
      const rows = data.results.map(r => `
        <tr>
          <td>${r.heart_rate}</td>
          <td><span class="pill ${r.is_irregular ? "irregular" : "normal"}">${r.is_irregular ? "Irregular" : "Normal"}</span></td>
          <td>${r.anomaly_score.toFixed(5)}</td>
        </tr>
      `).join("");
      document.getElementById("result").innerHTML = `
        <table>
          <thead><tr><th>Heart Rate</th><th>Status</th><th>Anomaly Score</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    }
  </script>
</body>
</html>
"""


@app.post("/train")
def train(req: TrainRequest) -> dict:
    try:
        summary = train_model(req.heart_rates, req.contamination)
        return {
            "message": "Model trained successfully.",
            "samples": summary.samples,
            "contamination": summary.contamination,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@app.post("/predict")
def predict(req: PredictRequest) -> dict:
    try:
        results = predict_irregularities(req.heart_rates)
        flagged = sum(1 for row in results if row["is_irregular"])
        return {"total": len(results), "flagged": flagged, "results": results}
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail="Train the model first via POST /train.") from e
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@app.get("/model/status")
def model_status() -> dict:
    try:
        load_model()
        return {"trained": True}
    except FileNotFoundError:
        return {"trained": False}
