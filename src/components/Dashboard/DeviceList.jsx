import React from 'react';

export default function DeviceList({ devices }) {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 leading-tight">highest power consuming device list</h3>
                <p className="text-gray-500 text-xs mt-1">Total Expenses: <span className="text-black font-bold">₹40,000 (+6%)</span></p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-3 text-[10px] text-gray-400 uppercase font-semibold border-b pb-2">
                    <span className="col-span-1">Device Name</span>
                    <span className="col-span-1 text-center">time of overload</span>
                    <span className="col-span-1 text-right">total power consumend</span>
                </div>

                {devices.map((device, index) => (
                    <div key={index} className="grid grid-cols-3 items-center py-2 relative">
                        <div className="col-span-1 flex items-center space-x-2">
                            <span className="relative flex h-2.5 w-2.5 shrink-0">
                                {device.usageTime === 'Active' && (
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                )}
                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${device.usageTime === 'Active' ? 'bg-green-500' : 'bg-red-400'}`}></span>
                            </span>
                            <p className="text-sm font-bold text-gray-700 truncate">{device.name}</p>
                        </div>
                        <div className="col-span-1 text-center">
                            <span className={`text-xs font-medium px-2 py-1 rounded-md ${device.overloaded ? 'text-red-600 bg-red-50 font-bold' : 'text-green-600 bg-green-50'
                                }`}>
                                {device.overloadTime || 'Normal'}
                            </span>
                        </div>
                        <div className="col-span-1 text-right">
                            <span className="text-sm font-bold text-gray-900">{device.power || '0'}W</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
