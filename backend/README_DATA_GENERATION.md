# 3-Month Energy & Air Quality Data Generation

## Overview

This directory contains tools and data for generating and managing 3-month historical datasets with:
- **Energy Consumption**: TX1, TX2, RX (Main Receiver) in kWh
- **Energy Deviation**: Calculated deviation with ±2.5% tolerance
- **Load Status**: Classification (underload/normal/overload)
- **Air Quality**: CO ppm levels from MQ-7 sensor
- **CO Status**: Air quality classification (Low/Moderate/High)

## Files

### Data Files

- **`3_month_TX1_TX2_RX_with_MQ7_ppm.csv`** - Pre-generated 3-month dataset (96 hourly records)
- **`DATA_STRUCTURE_GUIDE.md`** - Detailed documentation of data columns and format

### Generation Scripts

- **`generate_3month_data.py`** - Python script to generate new datasets

## Quick Start

### Using Pre-Generated Data

The file `3_month_TX1_TX2_RX_with_MQ7_ppm.csv` is ready to use with the PowerByte application:

```bash
# View the data
head -20 3_month_TX1_TX2_RX_with_MQ7_ppm.csv

# Count records
wc -l 3_month_TX1_TX2_RX_with_MQ7_ppm.csv
```

### Generating New Data

Generate a fresh 3-month dataset:

```bash
# Generate 90 days of data (default)
python generate_3month_data.py

# Generate with custom output file
python generate_3month_data.py --output my_dataset.csv

# Generate with custom start date
python generate_3month_data.py --start-date 2026-01-01 --days 90

# Generate 6 months of data
python generate_3month_data.py --days 180
```

## Data Generation Features

### Realistic Hourly Patterns

The generator creates realistic daily patterns:

**Off-Peak Hours (00:00-06:59)**
- Energy: 0.68-1.08 kWh/hr (Underload)
- CO: 40-80 ppm (Low)
- Status: Underload

**Morning Ramp-Up (06:00-10:00)**
- Energy: 1.25-1.92 kWh/hr
- CO: 50-100 ppm (Low-Moderate)
- Status: Normal

**Peak Hours (10:00-20:00)**
- Energy: 1.95-2.35 kWh/hr (Overload)
- CO: 100-180 ppm (Moderate-High)
- Status: Overload

**Evening Decline (20:00-00:00)**
- Energy: 1.55-1.98 kWh/hr
- CO: 80-130 ppm (Moderate)
- Status: Normal

### Energy Deviation Calculation

The generator ensures realistic energy deviations:

```
deviation = ((RX - (TX1 + TX2)) / (TX1 + TX2)) * 100
```

- **Tolerance**: ±2.5% (acceptable range)
- **Alert Threshold**: > 4.0% (triggers alerts)
- **Typical Range**: -2.5% to +2.5%

### CO Level Simulation

CO ppm levels are generated based on:
- Time of day (activity patterns)
- Heating/cooking cycles
- Ventilation patterns
- Random sensor variations (±5%)

**CO Status Thresholds**:
- Low: < 80 ppm
- Moderate: 80-150 ppm
- High: ≥ 150 ppm

## Data Integration

### With PowerByte Dashboard

1. Place CSV file in `backend/` directory
2. Update backend to load the CSV:

```python
import pandas as pd

# Load the dataset
df = pd.read_csv('backend/3_month_TX1_TX2_RX_with_MQ7_ppm.csv')

# Use for analysis
energy_data = df[['timestamp', 'TX1_kWh', 'TX2_kWh', 'RX_kWh']]
air_quality = df[['timestamp', 'TX1_CO_ppm', 'TX2_CO_ppm', 'RX_CO_ppm']]
```

### With Real-Time Monitoring

For per-second data in the future:

1. Aggregate to hourly averages
2. Calculate min/max/std deviation
3. Update deviation_percent with granular calculations
4. Enhance CO_status with real-time alerts

```python
# Example: Aggregate per-second data to hourly
hourly_data = per_second_data.resample('1H').agg({
    'TX1_kWh': 'sum',
    'TX2_kWh': 'sum',
    'RX_kWh': 'sum',
    'TX1_CO_ppm': 'mean',
    'TX2_CO_ppm': 'mean',
    'RX_CO_ppm': 'mean',
})
```

## Data Validation

### Check Data Integrity

```bash
# Verify CSV format
python -c "import csv; f=open('3_month_TX1_TX2_RX_with_MQ7_ppm.csv'); print(f.readline())"

# Count records
python -c "import csv; f=open('3_month_TX1_TX2_RX_with_MQ7_ppm.csv'); print(len(list(csv.reader(f))))"

# Check for missing values
python -c "
import pandas as pd
df = pd.read_csv('3_month_TX1_TX2_RX_with_MQ7_ppm.csv')
print('Missing values:', df.isnull().sum().sum())
print('Data shape:', df.shape)
"
```

### Validate Energy Deviation

```python
import pandas as pd

df = pd.read_csv('3_month_TX1_TX2_RX_with_MQ7_ppm.csv')

# Check deviation is within tolerance
within_tolerance = df['deviation_percent'].abs() <= 2.5
print(f"Records within tolerance: {within_tolerance.sum()}/{len(df)}")

# Find anomalies
anomalies = df[df['deviation_percent'].abs() > 4.0]
print(f"Anomalies (>4%): {len(anomalies)}")
```

## Future Enhancements

### Per-Second Data Integration

When per-second data becomes available:

1. **Data Collection**
   - Collect per-second readings from sensors
   - Store in high-resolution database
   - Aggregate to hourly for historical analysis

2. **Enhanced Calculations**
   - Calculate min/max/std for each hour
   - Detect micro-anomalies
   - Improve deviation accuracy

3. **Real-Time Alerts**
   - Immediate notification on threshold breach
   - Predictive alerts based on trends
   - Automated corrective actions

### Example: Per-Second to Hourly Aggregation

```python
import pandas as pd

# Load per-second data
per_second = pd.read_csv('per_second_data.csv', parse_dates=['timestamp'])

# Aggregate to hourly
hourly = per_second.set_index('timestamp').resample('1H').agg({
    'TX1_kWh': 'sum',
    'TX2_kWh': 'sum',
    'RX_kWh': 'sum',
    'TX1_CO_ppm': ['mean', 'min', 'max', 'std'],
    'TX2_CO_ppm': ['mean', 'min', 'max', 'std'],
    'RX_CO_ppm': ['mean', 'min', 'max', 'std'],
})

# Save aggregated data
hourly.to_csv('3_month_aggregated.csv')
```

## Troubleshooting

### Script Not Running

```bash
# Check Python version (requires 3.6+)
python --version

# Install required packages
pip install pandas

# Run with verbose output
python generate_3month_data.py --help
```

### CSV File Issues

```bash
# Verify file encoding
file 3_month_TX1_TX2_RX_with_MQ7_ppm.csv

# Check for line ending issues
dos2unix 3_month_TX1_TX2_RX_with_MQ7_ppm.csv

# Validate CSV structure
python -m csv 3_month_TX1_TX2_RX_with_MQ7_ppm.csv
```

## Support

For issues or questions:
1. Check `DATA_STRUCTURE_GUIDE.md` for column definitions
2. Review generated data statistics
3. Validate data integrity using provided scripts
4. Check PowerByte logs for integration errors

## License

This data generation tool is part of the PowerByte project.
