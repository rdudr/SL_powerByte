import React from 'react';
import { Outlet } from 'react-router-dom';
import { useGlobalData } from '../../context/data/DataState';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import DashboardHeader from './DashboardHeader';
import { RunTimeCard, YellowStatCard } from './StatCards';
import DeviceList from './DeviceList';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard(props) {
  const {
    kitchen,
    loading,
    realtimePrediction,
    predictionHistory,
    systemConfig,
    unitRate, // Added unitRate
  } = useGlobalData();

  // --- HISTORICAL DATA STATE ---
  const [historicalDaily, setHistoricalDaily] = React.useState(null);
  const [weeklyData, setWeeklyData] = React.useState(null);
  const [monthlyData, setMonthlyData] = React.useState(null);

  React.useEffect(() => {
    const API = 'http://localhost:8000';
    Promise.all([
      fetch(`${API}/api/historical/daily?days=90`).then(r => r.json()).catch(() => null),
      fetch(`${API}/api/historical/weekly`).then(r => r.json()).catch(() => null),
      fetch(`${API}/api/historical/monthly`).then(r => r.json()).catch(() => null),
    ]).then(([daily, weekly, monthly]) => {
      setHistoricalDaily(daily);
      setWeeklyData(weekly);
      setMonthlyData(monthly);
    });
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // CO₂ EMISSION FACTOR — CEA India Grid (Official)
  // Source: CEA "CO₂ Baseline Database for Indian Power Sector"
  //         Version 20.0, December 2024 (FY 2023-24)
  // Weighted Average: 0.716 kg CO₂ per kWh
  // ═══════════════════════════════════════════════════════════════
  const CO2_FACTOR = 0.716; // kg CO₂ / kWh (CEA India 2024)

  // --- DERIVED VALUES FROM HISTORICAL DATA ---
  const totalKwh = historicalDaily?.total_kwh || 0;
  // Use user-defined unit rate for calculations
  const totalCost = (totalKwh * unitRate).toFixed(0);
  const totalCarbonKg = (totalKwh * 0.716); // CEA Factor 0.716
  const avgDailyKwh = historicalDaily?.avg_daily_kwh || 0;

  // Convert carbon to display unit:
  //   < 1000 kg → show as "X.XX kg CO₂"
  //   >= 1000 kg → show as "X.XX t CO₂" (tonnes)
  const carbonDisplay = totalCarbonKg >= 1000
    ? `${(totalCarbonKg / 1000).toFixed(2)} t`
    : `${totalCarbonKg.toFixed(1)} kg`;

  // Monthly comparisons 
  const months = monthlyData?.months || [];
  // Recalculate monthly costs based on unitRate
  const monthlyCosts = monthlyData?.actual_kwh?.map(k => k * unitRate) || [];

  const lastMonthCost = monthlyCosts[months.length - 1] || 0;
  const prevMonthCost = monthlyCosts[months.length - 2] || 1;
  const costGrowthPct = prevMonthCost > 0 ? (((lastMonthCost - prevMonthCost) / prevMonthCost) * 100).toFixed(0) : 0;

  const lastMonthKwh = monthlyData?.actual_kwh?.[months.length - 1] || 0;
  const prevMonthKwh = monthlyData?.actual_kwh?.[months.length - 2] || 0;
  const energySaved = (prevMonthKwh - lastMonthKwh).toFixed(1);

  const lastMonthCarbon = monthlyData?.carbon_kg?.[months.length - 1] || 0;
  const prevMonthCarbon = monthlyData?.carbon_kg?.[months.length - 2] || 1;
  const carbonGrowthPct = prevMonthCarbon > 0 ? (((lastMonthCarbon - prevMonthCarbon) / prevMonthCarbon) * 100).toFixed(0) : 0;

  // --- 1. Prediction Graph — last 30 days from CSV ---
  const last30 = historicalDaily?.data?.slice(-30) || [];
  const graphData = {
    labels: last30.length > 0
      ? last30.map(d => d.date?.substring(5))
      : (predictionHistory || []).map(p => p.time),
    datasets: [
      {
        label: 'Predicted (kWh)',
        data: last30.length > 0
          ? last30.map(d => d.predicted_kwh)
          : (predictionHistory || []).map(p => p.power),
        borderColor: '#374151',
        backgroundColor: 'transparent',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 1,
      },
      {
        label: 'Actual (kWh)',
        data: last30.length > 0
          ? last30.map(d => d.actual_kwh)
          : (predictionHistory || []).map(p => p.power * 0.95),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 1,
      }
    ]
  };

  const graphOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } } },
      title: { display: false }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 45 } },
      y: { grid: { borderDash: [5, 5] }, ticks: { font: { size: 10 } } }
    }
  };

  // --- 2. Current power from realtime ---
  const currentPower = realtimePrediction?.predicted_power || 0;

  // --- 3. Device List ---
  const allDevices = systemConfig?.txUnits?.flatMap(tx => tx.devices) || [];

  const deviceList = allDevices.length > 0
    ? allDevices.map(device => {
      const liveData = kitchen[device.name];
      const livePower = liveData?.ActivePower || 0;
      const ratedPower = device.specs.power || 1;
      const isOverloaded = livePower >= ratedPower * 0.9; // ≥90% of rated = overload

      // Simulate how long device has been at overload (based on power ratio)
      let overloadTime = 'Normal';
      if (isOverloaded && livePower > 0) {
        const overloadRatio = livePower / ratedPower;
        // Higher ratio = longer simulated overload
        if (overloadRatio > 1.1) overloadTime = '2H 15M';
        else if (overloadRatio > 1.0) overloadTime = '1H 30M';
        else overloadTime = '0H 45M';
      }

      return {
        name: device.name,
        power: livePower > 0 ? livePower.toFixed(0) : ratedPower,
        usageTime: liveData?.Status === 'ON' ? 'Active' : 'Idle',
        overloaded: isOverloaded && livePower > 0,
        overloadTime: overloadTime,
      };
    })
      .sort((a, b) => Number(b.power) - Number(a.power))
      .slice(0, 5)
    : [];

  // --- Highest monthly bill from historical ---
  const highestMonthBill = monthlyData?.cost_inr ? Math.max(...monthlyData.cost_inr) : 5800;
  const lastMonthBill = monthlyData?.cost_inr?.[months.length - 1] || 3350;
  const lastMonthName = months.length > 0 ? months[months.length - 1] : 'Jan 2026';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* 1. Header & Nav */}
        <DashboardHeader activeTab="Dashboard" />

        {/* 2. Stat Cards Row — Powered by Historical CSV Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <RunTimeCard
            time={realtimePrediction?.timestamp ? new Date(realtimePrediction.timestamp).toLocaleTimeString() : "1M, 2D, 10H"}
          />
          <YellowStatCard
            value={`${carbonDisplay} CO₂`}
            unit=""
            label="Carbon Emission (CEA 0.716)"
            subLabel={`${CO2_FACTOR} kg CO₂/kWh × ${totalKwh.toFixed(0)} kWh`}
            growth={`${carbonGrowthPct > 0 ? '↑' : '↓'} ${Math.abs(carbonGrowthPct)}%`}
            icon="🌿"
          />
          <YellowStatCard
            value={`₹${Math.round(totalCost).toLocaleString()}`}
            unit=""
            label="Total Unit Consumed"
            subLabel={`${totalKwh.toFixed(0)} kWh (3 months)`}
            growth={`${costGrowthPct > 0 ? '↑' : '↓'} ${Math.abs(costGrowthPct)}%`}
            icon="💰"
          />
          <YellowStatCard
            value={`${energySaved} kWh`}
            unit=""
            label="Energy Saved from Last Month"
            subLabel="Growth rate"
            growth={`${energySaved > 0 ? '↓' : '↑'} ₹${Math.abs(energySaved * 7).toFixed(0)}`}
            icon="📊"
          />
        </div>

        {/* 3. Main Content: Graph + Device List */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left: Prediction Graph */}
          <div className="w-full lg:w-2/3 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Power Consumption — Last 30 Days</h3>
                <div className="mt-4">
                  <p className="text-gray-500 text-sm">Highest monthly bill</p>
                  <p className="text-4xl font-extrabold text-gray-900 mt-1">
                    ₹{Math.round(highestMonthBill).toLocaleString()}
                    <span className="text-sm font-normal text-gray-500 ml-2">({costGrowthPct > 0 ? '+' : ''}{costGrowthPct}%)</span>
                  </p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-gray-500 text-sm">Last month bill</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">₹{Math.round(lastMonthBill).toLocaleString()}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">{lastMonthName}</p>
              </div>
            </div>

            <div className="h-64 sm:h-80 w-full">
              <Line data={graphData} options={graphOptions} />
            </div>

            {/* Monthly Labels from Historical */}
            {monthlyData && (
              <div className="flex justify-between text-xs text-gray-400 mt-4 border-t pt-4">
                {monthlyData.months.map(m => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            )}

            {/* Anomaly Indicator */}
            {realtimePrediction?.anomaly && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700 animate-pulse">
                <span className="text-xl mr-2">⚠️</span>
                <span className="font-bold text-sm">Anomaly Detected: High Power Usage!</span>
              </div>
            )}
          </div>

          {/* Right: Device List */}
          <div className="w-full lg:w-1/3">
            <DeviceList devices={deviceList} />
          </div>

        </div>

        {/* 4. Additional Graphs Row — Powered by Historical Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">

          {/* Voltage Trend Chart */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Voltage Trend</h3>
            <p className="text-xs text-gray-400 mb-4">Real-time voltage fluctuations (V)</p>
            <div className="h-48">
              <Line
                data={{
                  labels: (predictionHistory || []).map(p => p.time),
                  datasets: [{
                    label: 'Voltage (V)',
                    data: (predictionHistory || []).map(p => p.voltage || 220),
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 2,
                    pointBackgroundColor: '#f59e0b',
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { display: false },
                    y: { grid: { borderDash: [3, 3] }, ticks: { font: { size: 10 } }, suggestedMin: 200, suggestedMax: 250 }
                  }
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
              <span className="text-xs text-gray-400">Current</span>
              <span className="text-sm font-bold text-amber-600">
                {(predictionHistory?.length > 0 ? predictionHistory[predictionHistory.length - 1].voltage : 220).toFixed(1)}V
              </span>
            </div>
          </div>

          {/* Energy Distribution by Device (Doughnut) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Energy Distribution</h3>
            <p className="text-xs text-gray-400 mb-4">Power share by device (Watts)</p>
            <div className="h-48 flex items-center justify-center">
              <Doughnut
                data={{
                  labels: allDevices.map(d => d.name),
                  datasets: [{
                    data: allDevices.map(d => d.specs.power),
                    backgroundColor: [
                      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
                      '#ec4899', '#06b6d4', '#84cc16', '#f97316'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff',
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'right', labels: { font: { size: 10 }, boxWidth: 10, padding: 8 } }
                  },
                  cutout: '60%'
                }}
              />
            </div>
            <div className="text-center mt-3 pt-3 border-t border-gray-50">
              <span className="text-xs text-gray-400">Total Installed Capacity: </span>
              <span className="text-sm font-bold text-blue-600">
                {allDevices.reduce((sum, d) => sum + d.specs.power, 0).toLocaleString()}W
              </span>
            </div>
          </div>

          {/* Weekly Consumption Bar Chart — From API */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Weekly Consumption</h3>
            <p className="text-xs text-gray-400 mb-4">Last 7 days actual vs predicted (kWh)</p>
            <div className="h-48">
              <Bar
                data={{
                  labels: weeklyData?.labels?.map(d => d.substring(5)) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                  datasets: [{
                    label: 'Actual (kWh)',
                    data: weeklyData?.actual_kwh || [],
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderRadius: 8,
                    barPercentage: 0.6,
                  }, {
                    label: 'Predicted (kWh)',
                    data: weeklyData?.predicted_kwh || [],
                    backgroundColor: 'rgba(16, 185, 129, 0.5)',
                    borderRadius: 8,
                    barPercentage: 0.6,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'top', labels: { font: { size: 10 }, boxWidth: 10, usePointStyle: true } } },
                  scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                    y: { grid: { borderDash: [3, 3] }, ticks: { font: { size: 10 } } }
                  }
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
              <span className="text-xs text-gray-400">Avg Daily</span>
              <span className="text-sm font-bold text-emerald-600">
                {avgDailyKwh.toFixed(1)} kWh
              </span>
            </div>
          </div>

        </div>

        {/* 5. Monthly Comparison Bar Chart */}
        {monthlyData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Monthly Energy Comparison</h3>
              <p className="text-xs text-gray-400 mb-4">Actual vs Predicted kWh per month</p>
              <div className="h-56">
                <Bar
                  data={{
                    labels: monthlyData.months,
                    datasets: [{
                      label: 'Actual (kWh)',
                      data: monthlyData.actual_kwh,
                      backgroundColor: 'rgba(59, 130, 246, 0.8)',
                      borderRadius: 8,
                      barPercentage: 0.5,
                    }, {
                      label: 'Predicted (kWh)',
                      data: monthlyData.predicted_kwh,
                      backgroundColor: 'rgba(139, 92, 246, 0.6)',
                      borderRadius: 8,
                      barPercentage: 0.5,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top', labels: { font: { size: 11 }, usePointStyle: true, boxWidth: 10 } } },
                    scales: {
                      x: { grid: { display: false } },
                      y: { grid: { borderDash: [3, 3] }, ticks: { font: { size: 10 } } }
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Monthly Cost & Carbon</h3>
              <p className="text-xs text-gray-400 mb-4">Expense (₹) and emission (kg CO₂) per month</p>
              <div className="h-56">
                <Bar
                  data={{
                    labels: monthlyData.months,
                    datasets: [{
                      label: `Cost using ₹${unitRate}/unit`,
                      data: monthlyCosts,
                      backgroundColor: 'rgba(245, 158, 11, 0.8)',
                      borderRadius: 8,
                      barPercentage: 0.5,
                      yAxisID: 'y',
                    }, {
                      label: 'Carbon (kg)',
                      data: monthlyData.carbon_kg,
                      backgroundColor: 'rgba(16, 185, 129, 0.6)',
                      borderRadius: 8,
                      barPercentage: 0.5,
                      yAxisID: 'y1',
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top', labels: { font: { size: 11 }, usePointStyle: true, boxWidth: 10 } } },
                    scales: {
                      x: { grid: { display: false } },
                      y: { type: 'linear', position: 'left', grid: { borderDash: [3, 3] }, ticks: { font: { size: 10 }, callback: v => `₹${v}` } },
                      y1: { type: 'linear', position: 'right', grid: { display: false }, ticks: { font: { size: 10 }, callback: v => `${v}kg` } },
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <Outlet />
        </div>

      </div>
    </div>
  );
}
