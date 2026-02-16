import React from 'react';
import { formatDuration, formatTimeSince } from '../../hooks/useRuntimeTracking';
import FormulaTooltip from '../Common/FormulaTooltip';

export const RunTimeCard = ({ 
  totalRuntime = 0, 
  activeTime = 0, 
  deactiveTime = 0, 
  lastActiveTime = null, 
  lastDeactiveTime = null 
}) => (
    <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm relative overflow-hidden h-40 flex flex-col justify-center">
        {/* Weather Icon Placeholder */}
        <div className="absolute -top-4 -right-4">
            <span className="text-8xl">⛅</span>
        </div>

        <div className="relative z-10">
            <div className="flex items-center">
                <h3 className="text-gray-600 font-bold mb-4 border-b pb-2 inline-block">Total RUN time: {formatDuration(totalRuntime)}</h3>
                <FormulaTooltip
                    title="Runtime Tracking"
                    formula="Total Runtime = Active Time + Deactive Time"
                    variables={{
                        "Active Time": "Time when system is receiving/transmitting power (RX or TX active)",
                        "Deactive Time": "Time when system is idle (no power flow)",
                        "Total Runtime": "Cumulative time since monitoring started"
                    }}
                    example="If Active Time = 2h 30m and Deactive Time = 1h 15m\nThen Total Runtime = 3h 45m"
                    notes="Runtime tracking starts when the dashboard loads and continues until page refresh."
                />
            </div>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">↗</div>
                    <div>
                        <p className="text-xs font-bold text-gray-700 uppercase">Active Time</p>
                        <p className="text-[10px] text-gray-400">Last Active time {formatTimeSince(lastActiveTime)}</p>
                    </div>
                </div>
                <span className="text-xs font-bold text-gray-900">{formatDuration(activeTime)}</span>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">↘</div>
                    <div>
                        <p className="text-xs font-bold text-gray-700 uppercase">Deactive Time</p>
                        <p className="text-[10px] text-gray-400">Last Deactive time {formatTimeSince(lastDeactiveTime)}</p>
                    </div>
                </div>
                <span className="text-xs font-bold text-gray-900">{formatDuration(deactiveTime)}</span>
            </div>
        </div>
    </div>
);

export const YellowStatCard = ({ label, value, subLabel, growth, icon, formulaData }) => (
    <div className="bg-[#ffc107] rounded-3xl p-6 shadow-sm h-40 flex flex-col justify-between relative">
        <div className="flex justify-between items-start">
            <div className="flex items-center">
                <h3 className="text-gray-900 font-medium text-sm truncate pr-2">{label}</h3>
                {formulaData && (
                    <FormulaTooltip {...formulaData} />
                )}
            </div>
            <button className="text-gray-800 font-bold text-xl leading-3 hover:text-white transition">...</button>
        </div>

        <div className="mt-1 mb-1">
            <div className="text-3xl font-black text-gray-900 tracking-tight">
                {value}
            </div>
        </div>

        <div className="flex justify-between items-end border-t border-black/5 pt-2">
            <p className="text-xs font-semibold text-gray-800">{subLabel}</p>
            <span className="text-lg font-bold text-gray-900 flex items-center">
                {growth}
            </span>
        </div>
    </div>
);
