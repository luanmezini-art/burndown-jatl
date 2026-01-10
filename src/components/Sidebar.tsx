import React from 'react';
import { useApp } from '../context/AppContext';
// ... imports need to include Menu and X from lucide-react
import { Calendar, Settings, RotateCcw, Download, Menu, X, LogOut } from 'lucide-react';
import { exportToExcel } from '../lib/export';
import { useState } from 'react';

export function Sidebar() {
    const { projectName, startDate, endDate, setProjectName, setStartDate, setEndDate, resetData, logs, initialBudget, logout } = useApp();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md text-monday-blue"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`
                fixed md:static inset-y-0 left-0 z-40
                w-80 bg-white border-r border-slate-200 h-screen p-6 flex flex-col shadow-sm transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="mb-8 flex items-center gap-3 text-monday-blue mt-10 md:mt-0"> {/* Margin top for mobile close button space */}
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Settings size={24} />
                    </div>
                    <h1 className="text-2xl font-bold font-sans tracking-tight">Konfiguration</h1>
                </div>

                <div className="space-y-6 flex-1 overflow-y-auto">
                    {/* ... content remains same ... */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Projektname</label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-monday-blue/20 focus:border-monday-blue outline-none transition-all"
                            placeholder="Mein Projekt"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Calendar size={16} />
                            <span className="text-sm font-medium">Zeitraum</span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Start</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-monday-blue outline-none text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Ende</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-monday-blue outline-none text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-3">
                    <button
                        onClick={() => {
                            exportToExcel({
                                projectName,
                                startDate,
                                endDate,
                                initialBudget,
                                logs
                            });
                        }}
                        className="flex items-center gap-2 text-monday-blue hover:bg-blue-50 px-4 py-2 rounded-lg w-full transition-colors text-sm font-medium"
                    >
                        <Download size={16} />
                        Excel Export
                    </button>

                    <button
                        onClick={resetData}
                        className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg w-full transition-colors text-sm font-medium"
                    >
                        <RotateCcw size={16} />
                        Daten zurücksetzen
                    </button>

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg w-full transition-colors text-sm font-medium mt-2"
                    >
                        <LogOut size={16} />
                        Abmelden
                    </button>
                </div>
            </div>
        </>
    );
}
