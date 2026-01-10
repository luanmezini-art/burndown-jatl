import React from 'react';
import { differenceInDays, addDays, format, parseISO, isSameDay } from 'date-fns';
import { useApp } from '../context/AppContext';
import { TEAM_MEMBERS } from '../lib/types';
import type { TeamMember } from '../lib/types';
import { cn } from '../lib/utils';
import { Activity } from 'lucide-react';

interface DataGridProps {
    memberFilter?: TeamMember | null;
}

export function DataGrid({ memberFilter }: DataGridProps) {
    const { startDate, endDate, logs, updateLog } = useApp();
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const days = differenceInDays(end, start) + 1;

    // Filter members based on prop
    const displayedMembers = memberFilter ? [memberFilter] : TEAM_MEMBERS;

    if (days <= 0) return <div className="p-8 text-center text-gray-500">Bitte wählen Sie ein gültiges Datum.</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <Activity className="text-monday-blue" size={20} />
                    <h3 className="font-bold text-gray-800">
                        {memberFilter ? `Eintrag: ${memberFilter}` : 'Stunden-Tracking'}
                    </h3>
                </div>
            </div>

            <div className="overflow-auto flex-1">
                <table className="w-full text-sm text-left relative border-collapse">
                    <thead className="text-xs text-gray-500 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-6 py-3 font-semibold border-b border-slate-200 sticky left-0 z-20 bg-slate-50">Datum</th>
                            {displayedMembers.map(member => (
                                <th key={member} className="px-4 py-3 font-semibold border-b border-slate-200 text-center min-w-[100px]">
                                    {member}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: days }).map((_, i) => {
                            const date = addDays(start, i);
                            const dateStr = format(date, 'yyyy-MM-dd');
                            const isToday = isSameDay(date, new Date());
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                            return (
                                <tr
                                    key={dateStr}
                                    className={cn(
                                        "border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors",
                                        isToday && "bg-blue-50/30"
                                    )}
                                >
                                    <td className={cn(
                                        "px-6 py-3 font-medium text-gray-900 whitespace-nowrap border-r border-slate-100 sticky left-0 z-10 bg-white group-hover:bg-blue-50/30",
                                        isToday && "bg-blue-50/30",
                                        isWeekend && "text-gray-400"
                                    )}>
                                        {format(date, 'dd. MMM')}
                                        <span className="ml-2 text-[10px] text-gray-400 font-normal uppercase">{format(date, 'EEE', { locale: undefined })}</span>
                                    </td>
                                    {displayedMembers.map(member => {
                                        const value = logs[dateStr]?.[member] ?? '';

                                        return (
                                            <td key={member} className="px-2 py-2 text-center border-r last:border-r-0 border-slate-100">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="24"
                                                    placeholder="-"
                                                    disabled={isWeekend}
                                                    value={value}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === '') {
                                                            // We can't really "delete" easily with current updateLog, so we might pass 0 or handle it.
                                                            // Ideally pass -1 or undefined if allowed.
                                                            // Let's pass 0 for now or handle empty string in UI only.
                                                            // Actually, updateLog expects number.
                                                            // Let's assume user wants to clear -> 0? Or just don't update if empty?
                                                            // Let's try passing 0 if empty for now to avoid errors, or update `updateLog` logic later.
                                                        }
                                                        updateLog(dateStr, member, Number(val));
                                                    }}
                                                    className={cn(
                                                        "w-full text-center py-2 px-2 rounded-md border border-transparent hover:border-slate-300 focus:border-monday-blue focus:ring-2 focus:ring-monday-blue/20 outline-none transition-all font-medium",
                                                        value === '' && "bg-slate-50/50 italic text-slate-400",
                                                        isWeekend && "bg-slate-50/50 text-slate-300 cursor-not-allowed"
                                                    )}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
