import React, { useState } from 'react';
import DashboardHeader from '../Dashboard/DashboardHeader';
import { useGlobalData } from '../../context/data/DataState';

export default function Account() {
    const { systemConfig, setSystemConfig, kitchen, unitRate, setUnitRate } = useGlobalData();
    const rxData = systemConfig || {};
    const setRxData = setSystemConfig;

    const [tempRate, setTempRate] = useState(unitRate);
    const [editingItem, setEditingItem] = useState(null); // { type: 'TX'|'Device', parentId: ... , item: ... }
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Guard AFTER all hooks
    if (!rxData.id) {
        return <div className="p-8 text-center text-gray-500">Loading Configuration...</div>;
    }

    // --- Actions ---

    const handleAddTx = () => {
        const newTx = {
            id: `TX-${Date.now()}`,
            name: 'New Transmitter',
            type: 'TX',
            devices: []
        };
        setRxData(prev => ({
            ...prev,
            txUnits: [...prev.txUnits, newTx]
        }));
    };

    const handleAddDevice = (txId) => {
        const newDevice = {
            id: `D-${Date.now()}`,
            name: 'New Device',
            type: 'Device',
            specs: { power: 0, current: 0 }
        };
        setRxData(prev => ({
            ...prev,
            txUnits: prev.txUnits.map(tx =>
                tx.id === txId
                    ? { ...tx, devices: [...tx.devices, newDevice] }
                    : tx
            )
        }));
    };

    const handleEdit = (item, type, parentId = null) => {
        setEditingItem({ ...item, itemType: type, parentId });
        setIsModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        const updatedItem = editingItem;

        if (updatedItem.itemType === 'RX') {
            setRxData(prev => ({ ...prev, name: updatedItem.name }));
        } else if (updatedItem.itemType === 'TX') {
            setRxData(prev => ({
                ...prev,
                txUnits: prev.txUnits.map(tx => tx.id === updatedItem.id ? updatedItem : tx)
            }));
        } else if (updatedItem.itemType === 'Device') {
            setRxData(prev => ({
                ...prev,
                txUnits: prev.txUnits.map(tx =>
                    tx.id === updatedItem.parentId
                        ? { ...tx, devices: tx.devices.map(d => d.id === updatedItem.id ? updatedItem : d) }
                        : tx
                )
            }));
        }
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleDelete = (item, type, parentId = null) => {
        if (!window.confirm("Are you sure you want to delete this?")) return;

        if (type === 'TX') {
            setRxData(prev => ({
                ...prev,
                txUnits: prev.txUnits.filter(tx => tx.id !== item.id)
            }));
        } else if (type === 'Device') {
            setRxData(prev => ({
                ...prev,
                txUnits: prev.txUnits.map(tx =>
                    tx.id === parentId
                        ? { ...tx, devices: tx.devices.filter(d => d.id !== item.id) }
                        : tx
                )
            }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <DashboardHeader activeTab="Account" />

                <div className="bg-white rounded-3xl p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b">
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">{rxData.name || 'System'}</h3>
                            <p className="text-xs text-gray-500">Master Controller</p>
                        </div>
                        <button
                            onClick={() => handleEdit(rxData, 'RX')}
                            className="text-gray-400 hover:text-blue-600 transition-colors bg-white p-2 rounded-xl border border-gray-100 shadow-sm"
                        >
                            ✏️ Edit
                        </button>
                    </div>

                    {/* --- NEW: Electricity Tariff Section --- */}
                    <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                                ⚡ Electricity Tariff
                            </h3>
                            <p className="text-sm text-amber-700 mt-1">
                                Set your electricity unit rate (₹/kWh) to calculate accurate costs across the project.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-amber-200 shadow-sm">
                            <span className="text-gray-500 font-medium pl-2">₹</span>
                            <input
                                type="number"
                                step="0.01"
                                value={tempRate}
                                onChange={(e) => setTempRate(e.target.value)}
                                className="w-24 p-1 text-lg font-bold text-gray-800 outline-none border-b border-transparent focus:border-amber-500 transition-colors text-right"
                            />
                            <span className="text-gray-400 text-sm pr-2">/ kWh</span>
                            <button
                                onClick={() => {
                                    setUnitRate(Number(tempRate));
                                    alert(`Unit Rate Updated to ₹${tempRate}/kWh! All costs will be recalculated.`);
                                }}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md active:scale-95"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* TX Units List */}
            <div className="max-w-7xl mx-auto mt-8 space-y-8">
                {rxData.txUnits.map(tx => (
                    <div key={tx.id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                        {/* TX Header */}
                        <div className="bg-gray-50 p-4 flex justify-between items-center border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700 font-bold">TX</div>
                                <h4 className="font-bold text-gray-800">{tx.name} <span className="text-gray-400 font-normal text-sm ml-2">({tx.devices.length} Devices)</span></h4>
                            </div>
                            <div className="flex space-x-3">
                                <button onClick={() => handleAddDevice(tx.id)} className="text-indigo-600 text-xs font-bold hover:underline">+ Add Device</button>
                                <button onClick={() => handleEdit(tx, 'TX')} className="text-gray-500 hover:text-indigo-600 text-xs font-medium">Edit</button>
                                <button onClick={() => handleDelete(tx, 'TX')} className="text-gray-400 hover:text-red-600 text-xs font-medium">Delete</button>
                            </div>
                        </div>

                        {/* Devices Grid */}
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tx.devices.length === 0 && <p className="text-gray-400 text-sm italic col-span-full text-center py-4">No devices connected.</p>}

                            {tx.devices.map(device => (
                                <div key={device.id} className="border border-gray-100 p-4 rounded-xl hover:shadow-md transition bg-white relative group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center space-x-2">
                                            {/* Live Status Dot */}
                                            <span className="relative flex h-2.5 w-2.5 shrink-0">
                                                {kitchen?.[device.name]?.Status === 'ON' && (
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                )}
                                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${kitchen?.[device.name]?.Status === 'ON' ? 'bg-green-500' : 'bg-red-400'}`}></span>
                                            </span>
                                            <span className="font-bold text-gray-700">{device.name}</span>
                                        </div>
                                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(device, 'Device', tx.id)} className="text-indigo-500 hover:text-indigo-700">✎</button>
                                            <button onClick={() => handleDelete(device, 'Device', tx.id)} className="text-red-400 hover:text-red-600">×</button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm mt-3">
                                        <div>
                                            <span className="block text-xs text-gray-400">Rating</span>
                                            <span className="font-mono text-gray-800">{device.specs.power}W</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-xs text-gray-400">Max Current</span>
                                            <span className="font-mono text-gray-800">{device.specs.current}A</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="pt-8 flex justify-center">
                    <button
                        onClick={handleAddTx}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition transform hover:scale-105"
                    >
                        + Add New TX Unit
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            {isModalOpen && editingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <form onSubmit={handleSave} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold mb-6 text-gray-900">Edit {editingItem.itemType}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editingItem.name}
                                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            {editingItem.itemType === 'Device' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Power Rating (W)</label>
                                        <input
                                            type="number"
                                            value={editingItem.specs?.power}
                                            onChange={(e) => setEditingItem({ ...editingItem, specs: { ...editingItem.specs, power: Number(e.target.value) } })}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Current (A)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={editingItem.specs?.current}
                                            onChange={(e) => setEditingItem({ ...editingItem, specs: { ...editingItem.specs, current: Number(e.target.value) } })}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 mt-8">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-md"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
