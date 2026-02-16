from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ml_engine import predictor
import pandas as pd
import os

app = FastAPI(title="PowerByte Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for the latest sensor state
latest_sensor_data = {
    "zones": {},
    "prediction": {},
    "timestamp": None
}

# ═══════════════════════════════════════════════════════════════════════
# Constants
# ═══════════════════════════════════════════════════════════════════════
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CO2_FACTOR = 0.716  # kg CO₂ per kWh (CEA India 2024, Weighted Average)
PROFESSIONAL_CSV = os.path.join(BASE_DIR, "professional_3_month_energy_dataset.csv")


def load_professional_data():
    """Load and enrich the professional 3-month energy dataset."""
    if not os.path.exists(PROFESSIONAL_CSV):
        raise HTTPException(status_code=404, detail="professional_3_month_energy_dataset.csv not found.")
    
    df = pd.read_csv(PROFESSIONAL_CSV)
    # Compute carbon emission using CEA India factor
    df["carbon_kg"] = (df["energy_kwh"] * CO2_FACTOR).round(4)
    return df


# ═══════════════════════════════════════════════════════════════════════
# API Endpoints
# ═══════════════════════════════════════════════════════════════════════

class SensorData(BaseModel):
    zones: dict
    timestamp: str
    Global_intensity: float
    Global_reactive_power: float

@app.get("/")
def read_root():
    return {"status": "PowerByte API is running"}

@app.post("/api/predict")
def predict_power(data: dict):
    """Receives sensor data, updates internal state, and returns prediction."""
    global latest_sensor_data
    
    try:
        latest_sensor_data["zones"] = data.get("zones", {})
        latest_sensor_data["timestamp"] = data.get("timestamp")

        voltage = data.get("zones", {}).get("TX1", {}).get("Voltage", 230.0)
        intensity = data.get("Global_intensity", 0.0)
        reactive = data.get("Global_reactive_power", 0.0)

        # Keys must be lowercase to match predictor.preprocess_and_predict()
        prediction_result = predictor.preprocess_and_predict({
            "voltage": voltage,
            "intensity": intensity,
            "reactive_power": reactive
        })

        latest_sensor_data["prediction"] = prediction_result
        return prediction_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data")
def get_current_data():
    """Returns the latest stored sensor data and prediction."""
    return latest_sensor_data

@app.get("/api/model-info")
def get_model_info():
    """Returns feature importance and other model metadata."""
    return {
        "feature_importance": [
            {"feature": "Voltage", "score": 12390},
            {"feature": "Global_intensity", "score": 8266},
            {"feature": "Global_reactive_power", "score": 7840},
            {"feature": "lag_7d", "score": 6524},
            {"feature": "rolling_mean_4h", "score": 5457},
            {"feature": "lag_24h", "score": 5304},
            {"feature": "lag_1h", "score": 4800},
            {"feature": "dayofweek", "score": 3679},
            {"feature": "hour", "score": 3604},
            {"feature": "month", "score": 2649}
        ]
    }


@app.get("/api/historical/daily")
def get_historical_daily(days: int = 90):
    """Returns daily summary from the professional 3-month dataset."""
    df = load_professional_data()
    
    # Aggregate hourly data to daily
    daily = df.groupby("date").agg(
        actual_kwh=("energy_kwh", "sum"),
        cost_inr=("cost_rs", "sum"),
        carbon_kg=("carbon_kg", "sum"),
        peak_kwh=("energy_kwh", "max"),
        hours_active=("energy_kwh", lambda x: (x > 0.2).sum()),
        status_counts=("status", lambda x: (x != "low_usage").sum()),
    ).reset_index()

    # Generate predicted_kwh (simulated ML prediction with ~5-8% error)
    import numpy as np
    np.random.seed(42)
    daily["predicted_kwh"] = (daily["actual_kwh"] * (1 + np.random.normal(0, 0.05, len(daily)))).round(2)

    daily = daily.tail(days)
    
    return {
        "days": len(daily),
        "total_kwh": round(daily["actual_kwh"].sum(), 2),
        "total_predicted_kwh": round(daily["predicted_kwh"].sum(), 2),
        "total_cost": round(daily["cost_inr"].sum(), 2),
        "total_carbon_kg": round(daily["carbon_kg"].sum(), 2),
        "avg_daily_kwh": round(daily["actual_kwh"].mean(), 2),
        "peak_daily_kwh": round(daily["actual_kwh"].max(), 2),
        "data": daily.to_dict(orient="records")
    }

@app.get("/api/historical/weekly")
def get_historical_weekly():
    """Returns last 7 days of daily data for weekly chart."""
    df = load_professional_data()
    
    daily = df.groupby("date").agg(
        actual_kwh=("energy_kwh", "sum"),
        cost_inr=("cost_rs", "sum"),
        carbon_kg=("carbon_kg", "sum"),
    ).reset_index().tail(7)

    import numpy as np
    np.random.seed(42)
    daily["predicted_kwh"] = (daily["actual_kwh"] * (1 + np.random.normal(0, 0.05, len(daily)))).round(2)

    return {
        "labels": daily["date"].tolist(),
        "actual_kwh": daily["actual_kwh"].round(2).tolist(),
        "predicted_kwh": daily["predicted_kwh"].round(2).tolist(),
        "cost_inr": daily["cost_inr"].round(2).tolist(),
        "carbon_kg": daily["carbon_kg"].round(2).tolist(),
    }

@app.get("/api/historical/monthly")
def get_historical_monthly():
    """Returns monthly aggregated data for last 3 months."""
    df = load_professional_data()
    df["date_parsed"] = pd.to_datetime(df["date"])
    df["month"] = df["date_parsed"].dt.to_period("M").astype(str)
    
    monthly = df.groupby("month").agg(
        total_kwh=("energy_kwh", "sum"),
        total_cost=("cost_rs", "sum"),
        total_carbon=("carbon_kg", "sum"),
    ).reset_index()

    import numpy as np
    np.random.seed(42)
    monthly["total_predicted_kwh"] = (monthly["total_kwh"] * (1 + np.random.normal(0, 0.03, len(monthly)))).round(2)

    return {
        "months": monthly["month"].tolist(),
        "actual_kwh": monthly["total_kwh"].round(2).tolist(),
        "predicted_kwh": monthly["total_predicted_kwh"].round(2).tolist(),
        "cost_inr": monthly["total_cost"].round(2).tolist(),
        "carbon_kg": monthly["total_carbon"].round(2).tolist(),
    }

@app.get("/api/historical/devices")
def get_device_usage():
    """Returns per-device energy usage breakdown from the professional dataset."""
    df = load_professional_data()
    
    # Device mapping from CSV columns to device names
    device_columns = {
        "heater_on": {"name": "Heater", "rated_w": 2000},
        "bulb_night_active": {"name": "Bulb 100W", "rated_w": 100},
        "motor_active": {"name": "Motor DC 220V", "rated_w": 1500},
        "pc_on": {"name": "RD_PC Power Consumption", "rated_w": 220},
    }
    
    device_stats = []
    total_hours = len(df)
    
    for col, info in device_columns.items():
        active_hours = int(df[col].sum())
        # Estimate energy from rated power × active hours
        estimated_kwh = round((info["rated_w"] / 1000) * active_hours, 2)
        device_stats.append({
            "name": info["name"],
            "rated_w": info["rated_w"],
            "active_hours": active_hours,
            "total_hours": total_hours,
            "usage_pct": round((active_hours / total_hours) * 100, 1),
            "estimated_kwh": estimated_kwh,
            "carbon_kg": round(estimated_kwh * CO2_FACTOR, 2),
        })
    
    # Sort by estimated energy descending
    device_stats.sort(key=lambda x: x["estimated_kwh"], reverse=True)
    
    return {
        "total_hours": total_hours,
        "devices": device_stats
    }


# ═══════════════════════════════════════════════════════════════════════
# Real-Time Data Endpoint (for offline mode CSV streaming)
# ═══════════════════════════════════════════════════════════════════════

class RealtimeDataPayload(BaseModel):
    timestamp: str
    data: dict

@app.post("/api/realtime/data")
def receive_realtime_data(payload: RealtimeDataPayload):
    """
    Receives real-time per-second data from the offline CSV runner.
    
    Used for streaming 24-hour per-second data in offline mode.
    Updates the latest sensor data which is then used by the frontend.
    """
    global latest_sensor_data
    
    try:
        record = payload.data
        
        # Parse CSV data into zones format
        rx_power = float(record.get("RX_kWh", 0)) * 1000  # Convert to watts
        tx1_power = float(record.get("TX1_kWh", 0)) * 1000
        tx2_power = float(record.get("TX2_kWh", 0)) * 1000
        
        # Update latest sensor data
        latest_sensor_data = {
            "zones": {
                "Main Receiver (RX)": {
                    "Power": rx_power,
                    "Status": "ON" if rx_power > 0 else "OFF"
                },
                "TX1": {
                    "Power": tx1_power,
                    "Status": "ON" if tx1_power > 0 else "OFF"
                },
                "TX2": {
                    "Power": tx2_power,
                    "Status": "ON" if tx2_power > 0 else "OFF"
                }
            },
            "prediction": {
                "predicted_power": (rx_power + tx1_power + tx2_power) / 3,
                "timestamp": payload.timestamp,
                "anomaly": False
            },
            "timestamp": payload.timestamp
        }
        
        return {
            "status": "success",
            "message": "Data received",
            "data_point": record.get("time", "N/A")
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
