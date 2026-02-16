import React from 'react';

export const RunTimeCard = ({ activeTime, deactiveTime }) => (
    <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm relative overflow-hidden h-40 flex flex-col justify-center">
        {/* Weather Icon Placeholder */}
        <div className="absolute -top-4 -right-4">
            <span className="text-8xl">⛅</span>
        </div>

        <div className="relative z-10">
            <h3 className="text-gray-600 font-bold mb-4 border-b pb-2 inline-block">Total RUN time</h3>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">↗</div>
                    <div>
                        <p className="text-xs font-bold text-gray-700 uppercase">Active Time</p>
                        <p className="text-[10px] text-gray-400">Last Active time 10m</p>
                    </div>
                </div>
                <span className="text-xs font-bold text-gray-900">{activeTime}</span>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">↘</div>
                    <div>
                        <p className="text-xs font-bold text-gray-700 uppercase">Deactive Time</p>
                        <p className="text-[10px] text-gray-400">Last Deactive time 14m ago</p>
                    </div>
                </div>
                <span className="text-xs font-bold text-gray-900">{deactiveTime}</span>
            </div>
        </div>
    </div>
);

export const YellowStatCard = ({ label, value, subLabel, growth, icon }) => (
    <div className="bg-[#ffc107] rounded-3xl p-6 shadow-sm h-40 flex flex-col justify-between relative">
        <div className="flex justify-between items-start">
            <h3 className="text-gray-900 font-medium text-sm truncate pr-2">{label}</h3>
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
