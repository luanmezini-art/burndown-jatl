import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BurndownChart } from './BurndownChart';
import { DataGrid } from './DataGrid';
import { TEAM_MEMBERS } from '../lib/types';
import type { TeamMember } from '../lib/types';
import { cn } from '../lib/utils';
import { LayoutDashboard } from 'lucide-react';

type ViewMode = 'OVERVIEW' | TeamMember;

export function Dashboard() {
    const { projectName } = useApp();
    const [activeView, setActiveView] = useState<ViewMode>('OVERVIEW');

    return (
        <div className="flex-1 h-screen overflow-hidden flex flex-col bg-slate-50">
            {/* Header with Tabs */}
            <header className="bg-white border-b border-slate-200 shadow-sm z-10 pl-16 md:pl-0">
                <div className="px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{projectName}</h2>
                        <p className="text-sm text-gray-500 mt-1">Sprint Burndown & Kapazitätsplanung</p>
                    </div>

                    {/* View Switcher / Tabs */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full no-scrollbar">
                        <button
                            onClick={() => setActiveView('OVERVIEW')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap",
                                activeView === 'OVERVIEW'
                                    ? "bg-white text-monday-blue shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-slate-200"
                            )}
                        >
                            <LayoutDashboard size={14} />
                            Gesamt
                        </button>
                        <div className="w-px h-4 bg-slate-300 mx-1 flex-shrink-0" />
                        {TEAM_MEMBERS.map(member => (
                            <button
                                key={member}
                                onClick={() => setActiveView(member)}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap",
                                    activeView === member
                                        ? "bg-white text-monday-blue shadow-sm"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-slate-200"
                                )}
                            >
                                {member}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-auto p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* OVERVIEW MODE */}
                    {activeView === 'OVERVIEW' && (
                        <>
                            <section className="h-[400px] w-full">
                                <BurndownChart />
                            </section>

                            <section className="h-[500px] w-full overflow-hidden">
                                <DataGrid />
                            </section>
                        </>
                    )}

                    {/* MEMBER MODE */}
                    {activeView !== 'OVERVIEW' && (
                        <div className="space-y-4">
                            <div className="hidden md:block p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 text-sm">
                                <strong>Hinweis:</strong> Sie bearbeiten jetzt nur die Einträge für <u>{activeView}</u>.
                            </div>
                            <section className="h-[calc(100vh-200px)] w-full overflow-hidden">
                                <DataGrid memberFilter={activeView} />
                            </section>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
