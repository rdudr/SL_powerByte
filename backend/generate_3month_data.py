#!/usr/bin/env python3
"""
Generate 3-month energy and air quality dataset with TX1, TX2, RX readings and MQ-7 CO ppm levels.

This script generates realistic hourly data for:
- Energy consumption (TX1, TX2, RX in kWh)
- Energy deviation (±2.5% tolerance)
- Load status (underload/normal/overload)
- Carbon Monoxide levels (TX1, TX2, RX in ppm)
- Air quality status (Low/Moderate/High)

Usage:
    python generate_3month_data.py --output 3_month_TX1_TX2_RX_with_MQ7_ppm.csv
"""

import csv
import random
from datetime import datetime, timedelta
import argparse


def generate_hourly_energy():
    """Generate realistic hourly energy consumption values."""
    hour = datetime.now().hour
    
    # Daily pattern: low at night, peak during day
    if 0 <= hour < 6:
        base = random.uniform(0.68, 1.08)  # Underload
    elif 6 <= hour < 10:
        base = random.uniform(1.25, 1.92)  # Ramp up
    elif 10 <= hour < 20:
        base = random.uniform(1.95, 2.35)  # Peak
    else:
        base = random.uniform(1.55, 1.98)  # Evening decline
    
    return base


def calculate_deviation(rx, tx1, tx2):
    """Calculate energy deviation percentage."""
    total_tx = tx1 + tx2
    if total_tx == 0:
        return 0.0
    deviation = ((rx - total_tx) / total_tx) * 100
    return round(deviation, 2)


def get_load_status(rx_value):
    """Classify load status based on RX consumption."""
    if rx_value < 2.0:
        return "underload"
    elif rx_value > 4.0:
        return "overload"
    else:
        return "normal"


def generate_co_levels(hour):
    """Generate realistic CO ppm levels based on time of day."""
    # CO levels correlate with activity and heating/cooking
    if 0 <= hour < 6:
        base = random.uniform(40, 80)  # Low at night
    elif 6 <= hour < 10:
        base = random.uniform(50, 100)  # Morning activity
    elif 10 <= hour < 20:
        base = random.uniform(100, 180)  # Peak activity
    else:
        base = random.uniform(80, 130)  # Evening
    
    return base


def get_co_status(co_ppm):
    """Classify air quality based on CO ppm levels."""
    if co_ppm < 80:
        return "Low"
    elif co_ppm < 150:
        return "Moderate"
    else:
        return "High"


def generate_dataset(start_date, num_days, output_file):
    """Generate 3-month dataset with hourly entries."""
    
    print(f"Generating {num_days} days of hourly data...")
    print(f"Start date: {start_date}")
    print(f"Output file: {output_file}")
    
    rows = []
    current_date = datetime.strptime(start_date, "%Y-%m-%d")
    
    for day in range(num_days):
        for hour in range(24):
            timestamp = current_date + timedelta(hours=hour)
            
            # Generate energy values
            tx1_kwh = round(generate_hourly_energy(), 2)
            tx2_kwh = round(generate_hourly_energy() * random.uniform(0.95, 1.05), 2)
            
            # RX should be approximately TX1 + TX2 with ±2.5% deviation
            expected_rx = tx1_kwh + tx2_kwh
            deviation_factor = random.uniform(-0.025, 0.025)
            rx_kwh = round(expected_rx * (1 + deviation_factor), 2)
            
            # Calculate actual deviation
            deviation_percent = calculate_deviation(rx_kwh, tx1_kwh, tx2_kwh)
            
            # Get load status
            load_status = get_load_status(rx_kwh)
            
            # Generate CO levels
            tx1_co = round(generate_co_levels(hour) * random.uniform(0.95, 1.05), 0)
            tx2_co = round(generate_co_levels(hour) * random.uniform(0.95, 1.05), 0)
            rx_co = round((tx1_co + tx2_co) / 2, 0)
            
            # Get CO status
            co_status = get_co_status(rx_co)
            
            # Format hourly slot
            hourly_slot = f"{hour:02d}:00-{hour:02d}:59"
            
            row = {
                'timestamp': timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                'date': timestamp.strftime("%Y-%m-%d"),
                'hourly_slot': hourly_slot,
                'TX1_kWh': tx1_kwh,
                'TX2_kWh': tx2_kwh,
                'RX_kWh': rx_kwh,
                'deviation_percent': deviation_percent,
                'load_status': load_status,
                'TX1_CO_ppm': int(tx1_co),
                'TX2_CO_ppm': int(tx2_co),
                'RX_CO_ppm': int(rx_co),
                'CO_status': co_status,
            }
            rows.append(row)
        
        current_date += timedelta(days=1)
        if (day + 1) % 30 == 0:
            print(f"  Generated {day + 1} days...")
    
    # Write to CSV
    fieldnames = [
        'timestamp', 'date', 'hourly_slot', 'TX1_kWh', 'TX2_kWh', 'RX_kWh',
        'deviation_percent', 'load_status', 'TX1_CO_ppm', 'TX2_CO_ppm', 'RX_CO_ppm', 'CO_status'
    ]
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"\n✓ Dataset generated successfully!")
    print(f"  Total records: {len(rows)}")
    print(f"  File size: {len(rows)} rows")
    print(f"  Date range: {rows[0]['date']} to {rows[-1]['date']}")
    
    # Print statistics
    rx_values = [float(row['RX_kWh']) for row in rows]
    co_values = [float(row['RX_CO_ppm']) for row in rows]
    
    print(f"\nData Statistics:")
    print(f"  RX Energy - Min: {min(rx_values):.2f} kWh, Max: {max(rx_values):.2f} kWh, Avg: {sum(rx_values)/len(rx_values):.2f} kWh")
    print(f"  CO Levels - Min: {min(co_values):.0f} ppm, Max: {max(co_values):.0f} ppm, Avg: {sum(co_values)/len(co_values):.0f} ppm")
    
    load_counts = {}
    for row in rows:
        status = row['load_status']
        load_counts[status] = load_counts.get(status, 0) + 1
    
    print(f"\nLoad Status Distribution:")
    for status, count in sorted(load_counts.items()):
        percentage = (count / len(rows)) * 100
        print(f"  {status}: {count} ({percentage:.1f}%)")


def main():
    parser = argparse.ArgumentParser(
        description='Generate 3-month energy and air quality dataset'
    )
    parser.add_argument(
        '--output',
        default='3_month_TX1_TX2_RX_with_MQ7_ppm.csv',
        help='Output CSV file path'
    )
    parser.add_argument(
        '--start-date',
        default='2025-11-18',
        help='Start date (YYYY-MM-DD)'
    )
    parser.add_argument(
        '--days',
        type=int,
        default=90,
        help='Number of days to generate (default: 90 for 3 months)'
    )
    
    args = parser.parse_args()
    
    generate_dataset(args.start_date, args.days, args.output)


if __name__ == '__main__':
    main()
