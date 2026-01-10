import React from 'react';
import { useApp } from '../context/AppContext';
import { BurndownChart } from './BurndownChart';
import { DataGrid } from './DataGrid';

export function Dashboard() {
    const { projectName } = useApp();

    return (
        <div className="flex-1 h-screen overflow-hidden flex flex-col bg-slate-50">
            <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-sm z-10">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{projectName}</h2>
                    <p className="text-sm text-gray-500 mt-1">Sprint Burndown & Kapazitätsplanung</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {['Joanna', 'Tatiana', 'Leman', 'Anastasia'].map((name, i) => (
                            <div
                                key={name}
                                className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm"
                                title={name}
                                style={{ zIndex: 4 - i }}
                            >
                                {name[0]}
                            </div>
                        ))}
                    </div>
                    <span className="text-sm text-gray-500 font-medium px-2">Team JATL</span>
                </div>
            </header>

            <main className="flex-1 overflow-auto p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <section>
                        <BurndownChart />
                    </section>

                    <section className="h-[500px]">
                        <DataGrid />
                    </section>
                </div>
            </main>
        </div>
    );
}
