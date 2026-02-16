#!/usr/bin/env python3
"""
Generate 24-hour per-second CSV data with individual equipment details
Creates: 24hr_per_second_offline_mode_with_equipment.csv
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Set random seed for reproducibility
np.random.seed(42)

# Configuration
TOTAL_SECONDS = 24 * 60 * 60  # 86,400 seconds

# Equipment specifications (in kWh equivalent)
EQUIPMENT = {
    'Heater': {'rated': 2.0, 'on_hours': (6, 22)},
    'Bulb_100W': {'rated': 0.1, 'on_hours': (18, 6)},  # 18:00 to 06:00 next day
    'Bulb_60W': {'rated': 0.06, 'on_hours': (19, 7)},  # 19:00 to 07:00 next day
    'Motor_DC_220V': {'rated': 1.5, 'on_hours': (8, 18)},
    'Motor_AC_2HP': {'rated': 1.492, 'on_hours': (8, 17)},
    'RD_PC': {'rated': 0.22, 'on_hours': (8, 20)},
}

print("Generating 24-hour per-second data with equipment details...")
print(f"Total records: {TOTAL_SECONDS}")

# Generate time array
times = [f"{h:02d}:{m:02d}:{s:02d}" for h in range(24) for m in range(60) for s in range(60)]

# Initialize data dictionary
data = {
    'time': times,
    'RX_kWh': [],
    'TX1_kWh': [],
    'TX2_kWh': [],
    'Heater_kWh': [],
    'Bulb_100W_kWh': [],
    'Bulb_60W_kWh': [],
    'Motor_DC_220V_kWh': [],
    'Motor_AC_2HP_kWh': [],
    'RD_PC_kWh': [],
    'RX_CO_ppm': [],
    'TX1_CO_ppm': [],
    'TX2_CO_ppm': [],
    'CO_status': [],
    'load_status': [],
    'deviation_percent': [],
    'Heater_Status': [],
    'Bulb_100W_Status': [],
    'Bulb_60W_Status': [],
    'Motor_DC_220V_Status': [],
    'Motor_AC_2HP_Status': [],
    'RD_PC_Status': [],
    'Heater_Usage_Percent': [],
    'Bulb_100W_Usage_Percent': [],
    'Bulb_60W_Usage_Percent': [],
    'Motor_DC_220V_Usage_Percent': [],
    'Motor_AC_2HP_Usage_Percent': [],
    'RD_PC_Usage_Percent': [],
}

# Generate data for each second
for i in range(TOTAL_SECONDS):
    hour = i // 3600
    minute = (i % 3600) // 60
    second = i % 60
    
    # Calculate hour factor (daily pattern)
    hour_factor = 0.5 + 0.5 * np.sin((hour - 6) * np.pi / 12)
    hour_factor = np.clip(hour_factor, 0.3, 1.2)
    
    # Generate equipment consumption
    equipment_data = {}
    for eq_name, eq_spec in EQUIPMENT.items():
        on_start, on_end = eq_spec['on_hours']
        
        # Check if equipment is ON
        if on_start < on_end:
            is_on = on_start <= hour < on_end
        else:  # Wraps around midnight
            is_on = hour >= on_start or hour < on_end
        
        # Calculate consumption
        if is_on:
            base_consumption = eq_spec['rated'] * 0.4 * hour_factor
            noise = np.random.normal(0, base_consumption * 0.1)
            consumption = max(0.01, base_consumption + noise)
        else:
            consumption = eq_spec['rated'] * 0.01  # Standby
        
        equipment_data[eq_name] = {
            'consumption': consumption,
            'status': 'ON' if is_on else 'OFF',
            'usage_percent': (consumption / eq_spec['rated']) * 100
        }
    
    # Aggregate TX1 and TX2
    tx1_consumption = (equipment_data['Heater']['consumption'] + 
                       equipment_data['Bulb_100W']['consumption'] + 
                       equipment_data['Bulb_60W']['consumption'])
    
    tx2_consumption = (equipment_data['Motor_DC_220V']['consumption'] + 
                       equipment_data['Motor_AC_2HP']['consumption'] + 
                       equipment_data['RD_PC']['consumption'])
    
    rx_consumption = tx1_consumption + tx2_consumption
    
    # Calculate deviation
    total_tx = tx1_consumption + tx2_consumption
    deviation = ((rx_consumption - total_tx) / total_tx * 100) if total_tx > 0 else 0
    
    # CO levels
    rx_co = 40 + hour_factor * 20 + np.random.normal(0, 2)
    tx1_co = 45 + hour_factor * 20 + np.random.normal(0, 2)
    tx2_co = 42 + hour_factor * 20 + np.random.normal(0, 2)
    
    # Status
    co_status = "Normal" if rx_co < 100 else "High"
    load_status = "Normal" if rx_consumption < 4 else "High"
    
    # Append to data
    data['RX_kWh'].append(round(rx_consumption, 2))
    data['TX1_kWh'].append(round(tx1_consumption, 2))
    data['TX2_kWh'].append(round(tx2_consumption, 2))
    data['Heater_kWh'].append(round(equipment_data['Heater']['consumption'], 2))
    data['Bulb_100W_kWh'].append(round(equipment_data['Bulb_100W']['consumption'], 2))
    data['Bulb_60W_kWh'].append(round(equipment_data['Bulb_60W']['consumption'], 2))
    data['Motor_DC_220V_kWh'].append(round(equipment_data['Motor_DC_220V']['consumption'], 2))
    data['Motor_AC_2HP_kWh'].append(round(equipment_data['Motor_AC_2HP']['consumption'], 2))
    data['RD_PC_kWh'].append(round(equipment_data['RD_PC']['consumption'], 2))
    data['RX_CO_ppm'].append(round(rx_co, 1))
    data['TX1_CO_ppm'].append(round(tx1_co, 1))
    data['TX2_CO_ppm'].append(round(tx2_co, 1))
    data['CO_status'].append(co_status)
    data['load_status'].append(load_status)
    data['deviation_percent'].append(round(deviation, 2))
    data['Heater_Status'].append(equipment_data['Heater']['status'])
    data['Bulb_100W_Status'].append(equipment_data['Bulb_100W']['status'])
    data['Bulb_60W_Status'].append(equipment_data['Bulb_60W']['status'])
    data['Motor_DC_220V_Status'].append(equipment_data['Motor_DC_220V']['status'])
    data['Motor_AC_2HP_Status'].append(equipment_data['Motor_AC_2HP']['status'])
    data['RD_PC_Status'].append(equipment_data['RD_PC']['status'])
    data['Heater_Usage_Percent'].append(round(np.clip(equipment_data['Heater']['usage_percent'], 0, 100), 1))
    data['Bulb_100W_Usage_Percent'].append(round(np.clip(equipment_data['Bulb_100W']['usage_percent'], 0, 100), 1))
    data['Bulb_60W_Usage_Percent'].append(round(np.clip(equipment_data['Bulb_60W']['usage_percent'], 0, 100), 1))
    data['Motor_DC_220V_Usage_Percent'].append(round(np.clip(equipment_data['Motor_DC_220V']['usage_percent'], 0, 100), 1))
    data['Motor_AC_2HP_Usage_Percent'].append(round(np.clip(equipment_data['Motor_AC_2HP']['usage_percent'], 0, 100), 1))
    data['RD_PC_Usage_Percent'].append(round(np.clip(equipment_data['RD_PC']['usage_percent'], 0, 100), 1))

# Create DataFrame
df = pd.DataFrame(data)

# Save to CSV
output_file = 'backend/24hr_per_second_offline_mode_with_equipment.csv'
df.to_csv(output_file, index=False)

print(f"\n✓ Generated {len(df)} records")
print(f"✓ Saved to: {output_file}")
print(f"\nSample data (first 5 rows):")
print(df.head(5))
print(f"\nSample data (noon - 12:00:00):")
print(df.iloc[43200:43205])
print(f"\nFile statistics:")
print(f"- Total rows: {len(df)}")
print(f"- Time range: {df['time'].iloc[0]} to {df['time'].iloc[-1]}")
print(f"- RX Power range: {df['RX_kWh'].min():.2f} to {df['RX_kWh'].max():.2f} kWh")
print(f"- CO levels range: {df['RX_CO_ppm'].min():.1f} to {df['RX_CO_ppm'].max():.1f} ppm")
print(f"\n✓ CSV file ready for use!")
