import json
import sys
from typing import Any, Dict, List
from pathlib import Path

import pandas as pd
from prophet import Prophet


def ensure_prophet_cmdstan_layout() -> None:
    """Prophet wheels on Windows can miss cmdstan makefile; patch it for backend validation."""
    prophet_root = Path(__file__).resolve().parents[1] / ".venv" / "Lib" / "site-packages" / "prophet" / "stan_model"
    if not prophet_root.exists():
        return

    cmdstan_dirs = sorted(prophet_root.glob("cmdstan-*"))
    if not cmdstan_dirs:
        return

    makefile = cmdstan_dirs[0] / "makefile"
    if not makefile.exists():
        makefile.write_text("all:\n", encoding="utf-8")


def build_dataframe(records: List[Dict[str, Any]]) -> pd.DataFrame:
    rows = []
    for row in records:
        rows.append({
            "ds": row["timestamp"],
            "y": float(row["loadCount"]),
        })

    df = pd.DataFrame(rows)
    if df.empty:
        return df

    # Prophet requires timezone-naive datetimes.
    df["ds"] = pd.to_datetime(df["ds"], utc=True).dt.tz_localize(None)

    df = df.sort_values("ds")
    df = (
        df.groupby("ds", as_index=False)["y"]
        .mean()
        .sort_values("ds")
    )

    return df


def run_forecast(payload: Dict[str, Any]) -> Dict[str, Any]:
    records = payload.get("records", [])
    horizon = int(payload.get("horizon", 48))
    load_factor = float(payload.get("loadFactor", 1.0))

    df = build_dataframe(records)
    if df.empty:
        return {"forecast": [], "peakWindows": []}

    ensure_prophet_cmdstan_layout()

    model = Prophet(
        daily_seasonality=True,
        weekly_seasonality=True,
        yearly_seasonality=False,
        changepoint_prior_scale=0.2,
    )
    model.fit(df)

    future = model.make_future_dataframe(periods=horizon, freq="h")
    forecast = model.predict(future)

    out = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].copy()
    out["yhat"] = (out["yhat"] * load_factor).clip(lower=0)
    out["yhat_lower"] = (out["yhat_lower"] * load_factor).clip(lower=0)
    out["yhat_upper"] = (out["yhat_upper"] * load_factor).clip(lower=0)

    baseline = out["yhat"].quantile(0.85)
    peaks = out[out["yhat"] >= baseline].head(8)

    return {
        "forecast": [
            {
                "timestamp": row.ds.isoformat(),
                "yhat": round(float(row.yhat), 2),
                "yhatLower": round(float(row.yhat_lower), 2),
                "yhatUpper": round(float(row.yhat_upper), 2),
            }
            for row in out.itertuples(index=False)
        ],
        "peakWindows": [
            {
                "timestamp": row.ds.isoformat(),
                "predictedLoad": round(float(row.yhat), 2),
            }
            for row in peaks.itertuples(index=False)
        ],
    }


def main() -> None:
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw or "{}")
        output = run_forecast(payload)
        sys.stdout.write(json.dumps(output))
    except Exception as exc:  # pragma: no cover
        sys.stderr.write(str(exc))
        sys.exit(1)


if __name__ == "__main__":
    main()
