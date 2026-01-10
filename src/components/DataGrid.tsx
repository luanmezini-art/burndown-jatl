import React from 'react';
import { differenceInDays, addDays, format, parseISO, isSameDay } from 'date-fns';
import { useApp } from '../context/AppContext';
import { TEAM_MEMBERS } from '../lib/types';
import { cn } from '../lib/utils';
import { Activity } from 'lucide-react';

export function DataGrid() {
    const { startDate, endDate, logs, updateLog, initialBudget } = useApp();

    const dates = React.useMemo(() => {
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        const days = differenceInDays(end, start) + 1;
        if (days <= 0) return [];

        return Array.from({ length: days }, (_, i) => addDays(start, i));
    }, [startDate, endDate]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                <Activity className="text-monday-blue" size={20} />
                <h3 className="font-bold text-gray-800">Stunden-Tracking</h3>
            </div>

            <div className="overflow-auto flex-1">
                <table className="w-full text-sm text-left relative border-collapse">
                    <thead className="text-xs text-gray-500 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-6 py-3 font-semibold border-b border-slate-200">Datum</th>
                            {TEAM_MEMBERS.map(member => (
                                <th key={member} className="px-4 py-3 font-semibold border-b border-slate-200 text-center">
                                    {member}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dates.map((date) => {
                            const dateStr = format(date, 'yyyy-MM-dd');
                            const isToday = isSameDay(date, new Date());

                            return (
                                <tr
                                    key={dateStr}
                                    className={cn(
                                        "border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors",
                                        isToday && "bg-blue-50/30"
                                    )}
                                >
                                    <td className="px-6 py-3 font-medium text-gray-900 whitespace-nowrap border-r border-slate-100">
                                        {format(date, 'dd. MMM yyyy')}
                                        {isToday && <span className="ml-2 text-[10px] bg-monday-blue text-white px-1.5 py-0.5 rounded-full">HEUTE</span>}
                                    </td>
                                    {TEAM_MEMBERS.map(member => {
                                        const value = logs[dateStr]?.[member] ?? '';

                                        return (
                                            <td key={member} className="px-2 py-2 text-center border-r last:border-r-0 border-slate-100">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="250"
                                                    placeholder="-"
                                                    value={value}
                                                    onChange={(e) => {
                                                        const val = e.target.value === '' ? undefined : Number(e.target.value);
                                                        // If undefined (cleared), we remove it? Or store undefined. 
                                                        // UpdateLog needs to handle optional number.
                                                        // But typescript expects number. Let's cast or handle.
                                                        // If empty string, we pass -1 or something to signal deletion? 
                                                        // Or Typescript allows undefined if we change signature?
                                                        // In context: updateLog(date, member, number). 
                                                        // I should filter NaN.
                                                        if (!isNaN(Number(val))) {
                                                            updateLog(dateStr, member, val as number);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "w-20 text-center py-1.5 px-2 rounded-md border border-transparent hover:border-slate-300 focus:border-monday-blue focus:ring-2 focus:ring-monday-blue/20 outline-none transition-all",
                                                        value === '' && "bg-slate-50/50 italic text-slate-400"
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
