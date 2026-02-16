# PowerByte Quick Start Guide

## ✅ All Services Running Successfully!

### Service Status

1. **Backend API Server** ✅
   - Running on: `http://localhost:8000`
   - Status: Active
   - XGBoost Model: Loaded

2. **Frontend Development Server** ✅
   - Running on: `http://localhost:3001` (Port 3000 was in use)
   - Status: Active
   - Access Dashboard: `http://localhost:3001/panel/dashboard`

3. **Real-time Data Runner** ✅
   - Status: Streaming 86,400 data points
   - CSV File: `24hr_per_second_offline_mode_with_equipment.csv`
   - Update Interval: 1 second
   - Data: TX1, TX2, RX power readings with equipment details

## 🌐 Access URLs

- **Main Dashboard**: http://localhost:3001/panel/dashboard
- **Login Page**: http://localhost:3001/login
- **API Docs**: http://localhost:8000/docs
- **API Status**: http://localhost:8000

## 📊 Real-time Data Flow

```
CSV Data (86,400 points)
    ↓
Real-time Runner (1 sec intervals)
    ↓
Backend API (/api/realtime/data)
    ↓
XGBoost ML Engine (Predictions)
    ↓
Frontend Dashboard (Live Updates)
```

## 🔧 If White Screen Appears

The dashboard is at: **http://localhost:3001/panel/dashboard**

NOT at: ~~http://localhost:3000/panel/dashboard~~

## 🎯 What's Working

- ✅ XGBoost predictions every 2 seconds
- ✅ Real-time power consumption data
- ✅ Device monitoring (Heater, Motors, Bulbs, PC)
- ✅ Carbon emission calculations (CEA 0.716 kg CO₂/kWh)
- ✅ Historical data (3 months)
- ✅ Anomaly detection
- ✅ Energy loss detection
- ✅ Notification system

## 📈 Current Data Streaming

The system is currently streaming:
- RX Power: ~0.07-0.08 kWh
- TX1 Power: ~0.04 kWh
- TX2 Power: ~0.03 kWh

Data updates every second for 24 hours (86,400 data points total).

## 🛑 To Stop Services

Run these commands:
```bash
# Stop frontend
# (Find process ID with: Get-Process | Where-Object {$_.ProcessName -like "*node*"})

# Stop backend
# (Find Python process running uvicorn)

# Stop data runner
# (Find Node process running realtime_data_runner.js)
```

Or simply close the terminal windows.

## 🔄 To Restart

1. Backend: `cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000`
2. Frontend: `npm start`
3. Data Runner: `cd backend && node realtime_data_runner.js auto-start 86400`

---

**Last Updated**: Now
**Status**: All systems operational ✅
