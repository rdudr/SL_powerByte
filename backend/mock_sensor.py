import time
import random
import requests
import sys
import datetime

# Configuration
API_URL = "http://localhost:8000/api/predict"
SEND_INTERVAL = 2  # Seconds

# Device definitions matching Account page exactly
# TX1 devices
TX1_DEVICES = {
    "Heater": 2000,
    "Bulb 100W": 100,
    "Bulb 60W": 60,
}

# TX2 devices
TX2_DEVICES = {
    "Motor DC 220V": 1500,
    "Motor AC Induction 2HP": 1492,
    "RD_PC Power Consumption": 220,
}

ALL_DEVICES = {**TX1_DEVICES, **TX2_DEVICES}
base_voltage = 230.0

def generate_device_data():
    """Generates realistic sensor data for all devices."""
    global base_voltage

    # Voltage drift (Brownian Motion around 230V)
    drift = random.uniform(-0.5, 0.5)
    base_voltage += drift
    if base_voltage > 240: base_voltage -= 1.0
    if base_voltage < 220: base_voltage += 1.0

    tx1_devices = {}
    tx2_devices = {}
    tx1_current = 0
    tx2_current = 0

    for device_name, rated_power in TX1_DEVICES.items():
        # Fluctuate power realistically (+/- 2%)
        power = rated_power * random.uniform(0.98, 1.02)
        current = power / base_voltage
        tx1_current += current

        tx1_devices[device_name] = {
            "Internal_Voltage": round(base_voltage, 1),
            "Current": round(current, 2),
            "ActivePower": round(power, 2),
            "Status": "ON",
            "Temperature": round(random.uniform(30, 40), 1)
        }

    for device_name, rated_power in TX2_DEVICES.items():
        power = rated_power * random.uniform(0.98, 1.02)
        current = power / base_voltage
        tx2_current += current

        tx2_devices[device_name] = {
            "Internal_Voltage": round(base_voltage, 1),
            "Current": round(current, 2),
            "ActivePower": round(power, 2),
            "Status": "ON",
            "Temperature": round(random.uniform(30, 40), 1)
        }

    total_current = tx1_current + tx2_current

    return {
        "TX1": {
            "Voltage": round(base_voltage, 1),
            "Total_Current": round(tx1_current, 2),
            "Devices": tx1_devices
        },
        "TX2": {
            "Voltage": round(base_voltage, 1),
            "Total_Current": round(tx2_current, 2),
            "Devices": tx2_devices
        },
        "total_current": total_current
    }

def main():
    print(f"--- PowerByte Mock Sensor Started ---")
    print(f"Target API: {API_URL}")
    print(f"Devices: {list(ALL_DEVICES.keys())}")
    print("Press Ctrl+C to stop.\n")

    try:
        while True:
            result = generate_device_data()

            global_intensity = result["total_current"]
            global_reactive = random.uniform(0.1, 0.5) * global_intensity

            payload = {
                "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Global_intensity": round(global_intensity, 2),
                "Global_reactive_power": round(global_reactive, 2),
                "zones": {
                    "TX1": result["TX1"],
                    "TX2": result["TX2"],
                }
            }

            try:
                response = requests.post(API_URL, json=payload)

                if response.status_code == 200:
                    res = response.json()
                    print(f"[SENT] Total I: {payload['Global_intensity']}A | Pred: {res.get('predicted_power', 0):.2f}W")
                else:
                    print(f"[ERROR] {response.status_code}: {response.text}")

            except requests.exceptions.ConnectionError:
                print(f"[CONN ERROR] Server not reachable at {API_URL}")
            except Exception as e:
                print(f"[ERROR] {e}")

            time.sleep(SEND_INTERVAL)

    except KeyboardInterrupt:
        print("\nStopped.")
        sys.exit(0)

if __name__ == "__main__":
    main()
