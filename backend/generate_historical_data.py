import pandas as pd
import random
import math
from datetime import datetime, timedelta
import os

EQUIPMENT_LIST = [
    {"name": "Heater", "wattage": 2000, "current": 9.09},
    {"name": "Bulb 100W", "wattage": 100, "current": 0.45},
    {"name": "Bulb 60W", "wattage": 60, "current": 0.27},
    {"name": "Motor DC 220V", "wattage": 1500, "current": 6.82},
    {"name": "Motor AC Induction 2HP", "wattage": 1492, "current": 6.78},
    {"name": "RD_PC Power Consumption", "wattage": 220, "current": 1.00},
]

VOLTAGE_NOMINAL = 220  # Volts

# ═══════════════════════════════════════════════════════════════════════
# CO₂ EMISSION FACTOR — CEA India Grid (Official Source)
# ═══════════════════════════════════════════════════════════════════════
# Source: Central Electricity Authority (CEA), Government of India
#         "CO₂ Baseline Database for the Indian Power Sector"
#         Version 20.0, December 2024 (Financial Year 2023-24)
#
# Weighted Average Emission Factor: 0.716 kg CO₂ / kWh
# Combined Margin (CM):            0.757 kg CO₂ / kWh
#
# We use the Weighted Average (0.716) as it represents the actual
# grid mix including renewables. The CM (0.757) is used for CDM/VCS
# project-level emission reductions.
#
# Unit conversion reference:
#   1 kg CO₂  = 0.001 tonnes CO₂ (tCO₂)
#   1 Gt CO₂  = 1,000,000,000 tonnes CO₂ = 10¹² kg CO₂
#   India total grid emissions: ~1.1 Gt CO₂/year (2023)
#   A household using 300 kWh/month ≈ 214.8 kg CO₂/month
# ═══════════════════════════════════════════════════════════════════════
CO2_EMISSION_FACTOR = 0.716  # kg CO₂ per kWh (CEA India 2024)
ELECTRICITY_RATE_INR = 7.0   # ₹ per kWh (average Indian household tariff)


def get_time_of_day_factor(hour):
    """Simulate realistic daily usage patterns (peak hours cost more power)."""
    if 0 <= hour < 6:
        return random.uniform(0.15, 0.30)   # Night — minimal usage
    elif 6 <= hour < 9:
        return random.uniform(0.50, 0.70)   # Morning ramp-up
    elif 9 <= hour < 12:
        return random.uniform(0.60, 0.85)   # Late morning — moderate
    elif 12 <= hour < 14:
        return random.uniform(0.40, 0.60)   # Lunch dip
    elif 14 <= hour < 18:
        return random.uniform(0.65, 0.90)   # Afternoon peak
    elif 18 <= hour < 21:
        return random.uniform(0.75, 0.95)   # Evening peak (highest)
    else:
        return random.uniform(0.30, 0.50)   # Late night wind-down


def get_seasonal_factor(date):
    """Add a seasonal trend — higher usage in winter months."""
    month = date.month
    if month in [12, 1, 2]:   # Winter
        return random.uniform(1.10, 1.30)
    elif month in [6, 7, 8]:  # Summer (AC / cooling)
        return random.uniform(1.05, 1.20)
    else:                     # Spring / Autumn
        return random.uniform(0.85, 1.00)


def generate_historical_csv():
    end_date = datetime.now().replace(minute=0, second=0, microsecond=0)
    start_date = end_date - timedelta(days=90)

    current_time = start_date
    data_rows = []

    total_installed_power = sum(eq["wattage"] for eq in EQUIPMENT_LIST)  # Watts
    total_installed_current = sum(eq["current"] for eq in EQUIPMENT_LIST)

    print("🌱 Generating 3 months of hourly historical data...")
    print(f"   Total installed capacity: {total_installed_power}W")
    print(f"   Date range: {start_date.strftime('%Y-%m-%d')} → {end_date.strftime('%Y-%m-%d')}")

    while current_time <= end_date:
        hour = current_time.hour
        tod_factor = get_time_of_day_factor(hour)
        seasonal = get_seasonal_factor(current_time)

        # --- ACTUAL POWER (simulated ground truth) ---
        # Each equipment has a probability of being ON based on time-of-day
        actual_power_w = 0.0
        actual_current_a = 0.0
        for eq in EQUIPMENT_LIST:
            # Each device has its own random chance of being active
            if random.random() < tod_factor:
                # Device is ON — add its power with slight noise
                noise = random.uniform(0.92, 1.08)
                actual_power_w += eq["wattage"] * noise
                actual_current_a += eq["current"] * noise

        actual_power_w *= seasonal

        # Voltage fluctuation (±5%)
        voltage = VOLTAGE_NOMINAL * random.uniform(0.95, 1.05)

        # --- PREDICTED POWER (ML model simulation) ---
        # The prediction should be close to actual but not perfect
        prediction_error = random.gauss(0, 0.08)  # ~8% std dev
        predicted_power_w = actual_power_w * (1 + prediction_error)

        # Ensure non-negative
        actual_power_w = max(0, actual_power_w)
        predicted_power_w = max(0, predicted_power_w)

        # --- ANOMALY FLAG ---
        # Flag if actual power is significantly higher than expected
        expected_avg = total_installed_power * tod_factor * seasonal
        is_anomaly = actual_power_w > expected_avg * 1.4

        # --- kWh conversion (for 1 hour interval) ---
        actual_kwh = actual_power_w / 1000.0
        predicted_kwh = predicted_power_w / 1000.0

        # --- Cost ---
        cost_inr = actual_kwh * ELECTRICITY_RATE_INR

        # --- Carbon Emission (CEA India Grid Factor: 0.716 kg CO₂/kWh) ---
        carbon_kg = actual_kwh * CO2_EMISSION_FACTOR

        row = {
            "timestamp": current_time.isoformat(),
            "date": current_time.strftime("%Y-%m-%d"),
            "hour": hour,
            "actual_power_w": round(actual_power_w, 2),
            "predicted_power_w": round(predicted_power_w, 2),
            "actual_kwh": round(actual_kwh, 4),
            "predicted_kwh": round(predicted_kwh, 4),
            "voltage": round(voltage, 2),
            "current_a": round(actual_current_a, 3),
            "cost_inr": round(cost_inr, 2),
            "carbon_kg": round(carbon_kg, 4),
            "anomaly": is_anomaly,
            "status": "anomaly" if is_anomaly else "normal",
        }

        data_rows.append(row)
        current_time += timedelta(hours=1)

    # --- Build DataFrame ---
    df = pd.DataFrame(data_rows)

    # --- Save full hourly data ---
    csv_path = os.path.join(os.path.dirname(__file__), "historical_data.csv")
    df.to_csv(csv_path, index=False)
    print(f"\n✅ Hourly data saved to: {os.path.abspath(csv_path)}")
    print(f"   Total records: {len(df)}")

    # --- Also generate a daily summary ---
    daily = df.groupby("date").agg(
        actual_kwh=("actual_kwh", "sum"),
        predicted_kwh=("predicted_kwh", "sum"),
        avg_power_w=("actual_power_w", "mean"),
        peak_power_w=("actual_power_w", "max"),
        cost_inr=("cost_inr", "sum"),
        carbon_kg=("carbon_kg", "sum"),
        anomaly_count=("anomaly", "sum"),
    ).reset_index()

    daily["status"] = daily["anomaly_count"].apply(lambda x: "high_usage" if x > 3 else "normal")

    daily_csv_path = os.path.join(os.path.dirname(__file__), "historical_daily_summary.csv")
    daily.to_csv(daily_csv_path, index=False)
    print(f"✅ Daily summary saved to: {os.path.abspath(daily_csv_path)}")
    print(f"   Total days: {len(daily)}")

    # --- Quick stats ---
    print(f"\n📊 Quick Stats:")
    print(f"   Total Energy Consumed:  {daily['actual_kwh'].sum():.1f} kWh")
    print(f"   Total Predicted Energy: {daily['predicted_kwh'].sum():.1f} kWh")
    print(f"   Total Cost:             ₹{daily['cost_inr'].sum():,.0f}")
    print(f"   Total Carbon:           {daily['carbon_kg'].sum():.1f} kg CO₂")
    print(f"   Anomaly Days:           {(daily['anomaly_count'] > 0).sum()}")
    print(f"   Prediction MAPE:        {abs(daily['actual_kwh'] - daily['predicted_kwh']).mean() / daily['actual_kwh'].mean() * 100:.2f}%")


if __name__ == "__main__":
    generate_historical_csv()
