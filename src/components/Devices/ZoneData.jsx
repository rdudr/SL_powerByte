import React from 'react';
import { useGlobalData } from '../../context/data/DataState';
import EquipmentStatusPanel from '../Dashboard/EquipmentStatusPanel';
import DashboardHeader from '../Dashboard/DashboardHeader';

export default function ZoneData() {
    const { kitchen, systemConfig } = useGlobalData();

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <DashboardHeader activeTab="zone Date" />

                {/* Main Content */}
                <div className="mt-8">
                    <EquipmentStatusPanel kitchen={kitchen} systemConfig={systemConfig} />
                </div>
            </div>
        </div>
    );
}
