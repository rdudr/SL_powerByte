# Real-Time Data Runner - Setup & Usage Guide

## Overview

The Real-Time Data Runner is a standalone Node.js CLI application that streams 24-hour per-second CSV data to the PowerByte backend in real-time. This allows you to simulate live sensor data for testing and development.

## Features

✅ **Per-Second Streaming**: Sends one data point per second
✅ **24-Hour Data**: Loads complete 24-hour dataset from CSV
✅ **Start/Stop Controls**: Interactive CLI with start/stop commands
✅ **Real-Time Monitoring**: Shows current time and data being sent
✅ **Error Handling**: Graceful error handling and recovery
✅ **Status Display**: View current streaming status anytime
✅ **Separate Process**: Runs independently from the website

## Prerequisites

- Node.js (v12 or higher)
- Backend API running on `http://localhost:8000`
- CSV file: `24hr_per_second_offline_mode.csv` in the `backend/` directory

## Installation

1. **Ensure Node.js is installed:**
   ```bash
   node --version
   ```

2. **Place CSV file in backend directory:**
   ```
   backend/24hr_per_second_offline_mode.csv
   ```

3. **Make the script executable (Linux/Mac):**
   ```bash
   chmod +x backend/realtime_data_runner.js
   ```

## Running the Real-Time Runner

### Method 1: Direct Node.js Execution

```bash
cd backend
node realtime_data_runner.js
```

### Method 2: Using npm script (if configured)

Add to `package.json`:
```json
{
  "scripts": {
    "realtime": "node backend/realtime_data_runner.js"
  }
}
```

Then run:
```bash
npm run realtime
```

## Interactive Commands

Once the runner is started, you can use these commands:

### `start`
Begins streaming data from the CSV file.
```
> start
▶ Starting data stream...
Total data points: 86400
[0s] 00:00:00 | RX: 2.5kWh | TX1: 1.2kWh | TX2: 1.3kWh
[1s] 00:00:01 | RX: 2.6kWh | TX1: 1.3kWh | TX2: 1.3kWh
...
```

### `stop`
Stops the current data stream.
```
> stop
⏹ Stream stopped
Streamed 1234 data points in 1234 seconds
```

### `status`
Displays current streaming status.
```
> status
=== Real-Time Data Runner Status ===
Status: RUNNING
CSV File: /path/to/backend/24hr_per_second_offline_mode.csv
Total Data Points: 86400
Current Index: 5432/86400
Elapsed Time: 5432s
Commands: start | stop | status | exit
```

### `exit`
Stops streaming (if running) and exits the program.
```
> exit
⏹ Stream stopped
Goodbye!
```

### `help`
Shows available commands.
```
> help
Available Commands:
  start  - Start streaming data from CSV
  stop   - Stop the current stream
  status - Display current status
  exit   - Exit the program
  help   - Show this help message
```

## CSV File Format

The CSV file should have the following columns:

```csv
time,RX_kWh,TX1_kWh,TX2_kWh,RX_CO_ppm,TX1_CO_ppm,TX2_CO_ppm,CO_status,load_status,deviation_percent
00:00:00,2.5,1.2,1.3,45,50,48,Normal,Normal,5.2
00:00:01,2.6,1.3,1.3,46,51,49,Normal,Normal,5.1
...
23:59:59,2.4,1.1,1.3,44,49,47,Normal,Normal,5.3
```

**Required Columns:**
- `time`: Time in HH:MM:SS format
- `RX_kWh`: Main Receiver power in kWh
- `TX1_kWh`: Transmitter 1 power in kWh
- `TX2_kWh`: Transmitter 2 power in kWh

**Optional Columns:**
- `RX_CO_ppm`: CO levels at RX
- `TX1_CO_ppm`: CO levels at TX1
- `TX2_CO_ppm`: CO levels at TX2
- `CO_status`: CO status
- `load_status`: Load status
- `deviation_percent`: Deviation percentage

## How It Works

### Data Flow

```
CSV File (24hr_per_second_offline_mode.csv)
    ↓
Real-Time Runner (Node.js)
    ↓
Parse per-second data
    ↓
Every 1 second:
  1. Read next data point
  2. Send to Backend API
  3. Display in console
    ↓
Backend API (/api/realtime/data)
    ↓
Update latest_sensor_data
    ↓
Frontend fetches via /api/data
    ↓
Dashboard displays real-time data
```

### Time Handling

- **Start Time**: Begins from 00:00:00 (midnight)
- **Duration**: Streams all 86,400 seconds (24 hours)
- **Interval**: 1 second between each data point
- **Total Time**: ~24 hours to stream complete dataset

## Backend Integration

The runner sends data to the backend endpoint:

```
POST /api/realtime/data
Content-Type: application/json

{
  "timestamp": "2024-02-16T20:30:45.123Z",
  "data": {
    "time": "20:30:45",
    "RX_kWh": 2.5,
    "TX1_kWh": 1.2,
    "TX2_kWh": 1.3,
    ...
  }
}
```

The backend updates `latest_sensor_data` which is then served to the frontend via `/api/data`.

## Frontend Integration

The frontend automatically receives updates through:

1. **Polling**: Frontend polls `/api/data` every 2 seconds
2. **Real-Time Updates**: Kitchen data updates with new values
3. **Dashboard Display**: All metrics update in real-time

## Troubleshooting

### Issue: "CSV file not found"
**Solution**: Ensure `24hr_per_second_offline_mode.csv` is in the `backend/` directory

### Issue: "API returned 500"
**Solution**: 
- Check backend is running on `http://localhost:8000`
- Check backend logs for errors
- Verify CSV format is correct

### Issue: "Connection refused"
**Solution**:
- Start the backend: `python backend/main.py`
- Ensure backend is listening on port 8000

### Issue: Data not appearing in frontend
**Solution**:
- Check runner is streaming (use `status` command)
- Check backend logs for incoming requests
- Refresh frontend page
- Check browser console for errors

## Performance Notes

- **Memory Usage**: ~5-10 MB (loads entire CSV into memory)
- **CPU Usage**: Minimal (simple per-second operations)
- **Network**: ~1 KB per second (very low bandwidth)
- **Latency**: <100ms per request (local network)

## Advanced Usage

### Running in Background (Linux/Mac)

```bash
nohup node backend/realtime_data_runner.js > realtime.log 2>&1 &
```

### Running with PM2 (Process Manager)

```bash
npm install -g pm2
pm2 start backend/realtime_data_runner.js --name "realtime-runner"
pm2 logs realtime-runner
```

### Running in Docker

```dockerfile
FROM node:16
WORKDIR /app
COPY backend/ .
CMD ["node", "realtime_data_runner.js"]
```

## Example Workflow

1. **Start Backend:**
   ```bash
   cd backend
   python main.py
   ```

2. **Start Real-Time Runner (in another terminal):**
   ```bash
   cd backend
   node realtime_data_runner.js
   ```

3. **Start Frontend:**
   ```bash
   npm run dev
   ```

4. **In Runner Terminal:**
   ```
   > start
   ▶ Starting data stream...
   [0s] 00:00:00 | RX: 2.5kWh | TX1: 1.2kWh | TX2: 1.3kWh
   [1s] 00:00:01 | RX: 2.6kWh | TX1: 1.3kWh | TX2: 1.3kWh
   ...
   ```

5. **View in Frontend:**
   - Dashboard shows real-time data
   - Energy Loss Trend updates per second
   - Runtime tracking shows active/inactive periods

## Stopping the Runner

### Graceful Shutdown
```
> stop
⏹ Stream stopped

> exit
Goodbye!
```

### Force Quit
```
Ctrl+C
```

## Logs and Monitoring

The runner outputs:
- ✓ Success messages (green)
- ✗ Error messages (red)
- ⚠ Warnings (yellow)
- ℹ Info messages (cyan)

Example output:
```
✓ Loaded 86400 data points from CSV
▶ Starting data stream...
Total data points: 86400
[0s] 00:00:00 | RX: 2.5kWh | TX1: 1.2kWh | TX2: 1.3kWh
[1s] 00:00:01 | RX: 2.6kWh | TX1: 1.3kWh | TX2: 1.3kWh
✗ Error sending data at 00:00:02: Connection refused
[3s] 00:00:03 | RX: 2.4kWh | TX1: 1.1kWh | TX2: 1.3kWh
```

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review backend logs
3. Check frontend console for errors
4. Verify CSV file format
5. Ensure all services are running

## Next Steps

- Configure the CSV file with your data
- Set up automated testing with the runner
- Integrate with CI/CD pipeline
- Monitor real-time data in dashboard
- Analyze energy loss trends
