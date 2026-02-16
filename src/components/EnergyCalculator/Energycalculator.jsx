import React, { useState } from 'react';
import DashboardHeader from '../Dashboard/DashboardHeader';

export default function Energycalculator() {
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [values, setValues] = useState({
        wattage: '',
        hours: '',
        rate: '',
        days: ''
    });

    const handleChange = (e) => {
        setValues({ ...values, [e.target.id]: e.target.value });
        setError('');
        setResult(null);
    };

    const calculate = () => {
        const wattage = parseFloat(values.wattage);
        const hours = parseFloat(values.hours);
        const rate = parseFloat(values.rate);
        const days = parseFloat(values.days);

        if (isNaN(wattage) || isNaN(hours) || isNaN(rate) || isNaN(days)) {
            setError('Please enter valid numeric values for all fields.');
            return;
        }

        const dailyCost = (wattage * hours) / 1000 * rate;
        const totalCost = dailyCost * days;
        setResult(`Total Cost: Rs ${totalCost.toFixed(2)}`);
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <DashboardHeader activeTab="Energy Calculator" />

                <div className="bg-white rounded-3xl p-8 shadow-sm max-w-2xl mx-auto mt-10">
                    <h2 className="mb-6 text-2xl font-bold text-gray-900 border-b pb-4">Appliance Cost Estimator</h2>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="wattage" className="block mb-2 text-sm font-bold text-gray-700">Appliance Wattage (W)</label>
                                <input
                                    type="number"
                                    id="wattage"
                                    value={values.wattage}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
                                    placeholder="e.g. 1000"
                                />
                            </div>

                            <div>
                                <label htmlFor="hours" className="block mb-2 text-sm font-bold text-gray-700">Hours Used / Day</label>
                                <input
                                    type="number"
                                    id="hours"
                                    value={values.hours}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
                                    placeholder="e.g. 5"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="rate" className="block mb-2 text-sm font-bold text-gray-700">Rate per kWh (Rs)</label>
                                <input
                                    type="number"
                                    id="rate"
                                    value={values.rate}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
                                    placeholder="e.g. 8.50"
                                />
                            </div>

                            <div>
                                <label htmlFor="days" className="block mb-2 text-sm font-bold text-gray-700">Number of Days</label>
                                <input
                                    type="number"
                                    id="days"
                                    value={values.days}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
                                    placeholder="e.g. 30"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 text-sm font-medium text-red-600 bg-red-50 rounded-xl border border-red-100">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={calculate}
                            className="w-full py-4 mt-4 font-bold text-white transition-all bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform active:scale-95"
                        >
                            Calculate Cost
                        </button>

                        {result && (
                            <div className="p-6 mt-6 text-center bg-green-50 border border-green-100 rounded-xl shadow-inner">
                                <span className="text-3xl font-black text-green-700">{result}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
