# 3-Month Energy & Air Quality Dataset Guide

## File: `3_month_TX1_TX2_RX_with_MQ7_ppm.csv`

### Overview
This dataset contains 3 months of hourly energy consumption data from TX1, TX2, and RX (Main Receiver) with corresponding air quality measurements (Carbon Monoxide levels) from the MQ-7 sensor.

### Data Columns

| Column | Description | Unit | Range | Notes |
|--------|-------------|------|-------|-------|
| `timestamp` | Date and time of measurement | YYYY-MM-DD HH:MM:SS | - | Hourly intervals |
| `date` | Date only | YYYY-MM-DD | - | For grouping by day |
| `hourly_slot` | Hour range | HH:MM-HH:MM | 00:00-23:59 | 24 hourly slots per day |
| `TX1_kWh` | Transmitter 1 energy consumption | kWh | 0.68-2.35 | Individual circuit reading |
| `TX2_kWh` | Transmitter 2 energy consumption | kWh | 0.67-2.34 | Individual circuit reading |
| `RX_kWh` | Main Receiver total reading | kWh | 1.35-4.69 | Should ≈ TX1 + TX2 |
| `deviation_percent` | Energy deviation from expected | % | ±2.5% | (RX - (TX1+TX2)) / (TX1+TX2) * 100 |
| `load_status` | System load classification | Enum | underload/normal/overload | Based on RX consumption |
| `TX1_CO_ppm` | TX1 Carbon Monoxide level | ppm | 38-182 | MQ-7 sensor reading |
| `TX2_CO_ppm` | TX2 Carbon Monoxide level | ppm | 40-180 | MQ-7 sensor reading |
| `RX_CO_ppm` | RX Carbon Monoxide level | ppm | 41-181 | MQ-7 sensor reading |
| `CO_status` | Air quality classification | Enum | Low/Moderate/High | Based on CO ppm levels |

### Load Status Classification

- **Underload**: RX < 2.0 kWh (Low power consumption)
- **Normal**: 2.0 kWh ≤ RX ≤ 4.0 kWh (Expected consumption)
- **Overload**: RX > 4.0 kWh (High power consumption)

### CO Status Classification (MQ-7 Sensor)

- **Low**: CO ppm < 80 (Good air quality)
- **Moderate**: 80 ≤ CO ppm < 150 (Acceptable air quality)
- **High**: CO ppm ≥ 150 (Poor air quality - requires attention)

### Energy Deviation Tolerance

The system allows ±2.5% deviation between RX reading and sum of TX readings:
- **Acceptable**: -2.5% ≤ deviation ≤ +2.5%
- **Alert Threshold**: deviation > 4.0% (triggers DataMismatchAlert)

### Data Characteristics

**Time Period**: November 18, 2025 - January 1, 2026 (3 months)

**Hourly Patterns**:
- **Off-peak (00:00-06:59)**: Lower consumption (underload), lower CO levels
- **Peak hours (11:00-20:00)**: Higher consumption (normal/overload), higher CO levels
- **Evening (21:00-23:59)**: Moderate consumption, moderate CO levels

**Typical Daily Pattern**:
1. Midnight-6 AM: Underload (0.68-1.08 kWh/hr)
2. 6-10 AM: Ramp up (1.25-1.92 kWh/hr)
3. 10 AM-8 PM: Peak load (1.95-2.35 kWh/hr) - Overload periods
4. 8 PM-Midnight: Decline (1.55-1.98 kWh/hr)

### MQ-7 Sensor Information

**Sensor**: MQ-7 (Prototype Monitoring)
- Detects Carbon Monoxide (CO) gas
- Typical range: 20-2000 ppm
- Response time: ~90 seconds
- Recovery time: ~30 seconds

**CO Sources**:
- Incomplete combustion from appliances
- Vehicle exhaust (if near windows)
- Heating systems
- Cooking equipment

### Usage Examples

**For Energy Loss Detection**:
```
deviation = (RX - (TX1 + TX2)) / (TX1 + TX2) * 100
if abs(deviation) > 2.5:
    Alert: "Energy mismatch detected"
```

**For Air Quality Monitoring**:
```
avg_CO = (TX1_CO_ppm + TX2_CO_ppm + RX_CO_ppm) / 3
if avg_CO > 150:
    Alert: "Poor air quality - High CO levels"
```

**For Load Analysis**:
```
if RX > 4.0:
    Status: "Overload - Consider load balancing"
elif RX < 2.0:
    Status: "Underload - System underutilized"
else:
    Status: "Normal operation"
```

### Data Quality Notes

- All timestamps are in 24-hour format (UTC)
- Energy values are cumulative hourly consumption
- CO ppm values are instantaneous readings at hour boundary
- Deviation calculations account for measurement tolerances
- No missing data points in the 3-month period
- Data is suitable for:
  - Time-series analysis
  - Anomaly detection
  - Predictive modeling
  - Real-time monitoring dashboards

### Future Data Integration

When per-second data becomes available:
1. Aggregate to hourly averages for consistency
2. Calculate min/max/std deviation for each hour
3. Update deviation_percent with more granular calculations
4. Enhance CO_status with real-time alerts
5. Implement predictive maintenance based on patterns

### File Statistics

- **Total Records**: 96 hourly entries (4 days sampled from 3-month period)
- **File Size**: ~14 KB
- **Format**: CSV (comma-separated values)
- **Encoding**: UTF-8
- **Line Endings**: LF (Unix style)

