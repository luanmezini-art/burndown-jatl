import React, { useMemo } from 'react';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { differenceInDays, addDays, format, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext';
import { TEAM_MEMBERS } from '../lib/types';

// Monday.com colors
const COLORS = {
    Joanna: '#0073ea',   // Blue
    Tatiana: '#00ca72',  // Green
    Leman: '#a25ddc',    // Purple
    Anastasia: '#e2445c' // Red
};

export function BurndownChart() {
    const { startDate, endDate, logs, initialBudget } = useApp();

    const data = useMemo(() => {
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        const days = differenceInDays(end, start) + 1;

        if (days <= 0) return [];

        const chartData = [];
        const cumulativeSpent: Record<string, number> = {};

        // Initialize cumulative spent
        TEAM_MEMBERS.forEach(m => cumulativeSpent[m] = 0);

        for (let i = 0; i < days; i++) {
            const currentDate = addDays(start, i);
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            const logEntry = logs[dateStr] || {};

            const dataPoint: any = {
                date: format(currentDate, 'dd.MM'),
                fullDate: dateStr,
            };

            TEAM_MEMBERS.forEach(member => {
                const dailyEffort = logEntry[member];

                // If there is an entry, it is the "Daily Effort" (Burn)
                if (dailyEffort !== undefined) {
                    dataPoint[`${member}_burn`] = dailyEffort;
                    cumulativeSpent[member] += dailyEffort;
                } else {
                    // No entry means 0 effort for that day
                    dataPoint[`${member}_burn`] = 0;
                }

                // Remaining = Initial Budget - Sum of effort so far
                // We divide initial budget by 4 members? Or is it 250 total? 
                // Context says "Initial Budget: 250". Usually that's per team or project.
                // But lines are per member. 
                // Ideally budget is per member (e.g. 250 / 4 = 62.5h each?).
                // Or does every member start at 250?
                // Looking at previous code: `remaining = initialBudget` (if missing).
                // So previously everyone started at 250.
                // Let's assume everyone starts at 250 for now, or 250 is the TOTAL project budget?
                // User's previous chart showed all lines starting at 250. Let's keep that.

                const remaining = initialBudget - cumulativeSpent[member];
                dataPoint[member] = remaining > 0 ? remaining : 0;
            });

            chartData.push(dataPoint);
        }
        return chartData;
    }, [startDate, endDate, logs, initialBudget]);

    return (
        <div className="w-full h-[500px] bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold mb-4 font-sans text-monday-black">Team Leistungs-Chart</h3>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6e9ef" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#676879', fontSize: 12 }}
                        dy={10}
                    />
                    {/* Left Axis: Remaining Hours (0 - 250) */}
                    <YAxis
                        yAxisId="left"
                        label={{ value: 'Verbleibende Stunden (h)', angle: -90, position: 'insideLeft', fill: '#676879', fontSize: 12 }}
                        domain={[0, 250]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#676879', fontSize: 12 }}
                    />
                    {/* Right Axis: Burned Hours */}
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        label={{ value: 'Tägliche Leistung (h)', angle: 90, position: 'insideRight', fill: '#676879', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#676879', fontSize: 12 }}
                        domain={[0, 10]}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontSize: '13px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />

                    {/* Bars for Burned Hours (Stacked) */}
                    {TEAM_MEMBERS.map(member => (
                        <Bar
                            key={`${member}_burn`}
                            dataKey={`${member}_burn`}
                            name={`${member} (Leistung)`}
                            stackId="a"
                            fill={COLORS[member]}
                            yAxisId="right"
                            opacity={0.3} // Lighter opacity for bars
                            radius={[2, 2, 0, 0]}
                        />
                    ))}

                    {/* Lines for Remaining Hours */}
                    {TEAM_MEMBERS.map(member => (
                        <Line
                            key={member}
                            type="monotone"
                            dataKey={member}
                            name={member}
                            stroke={COLORS[member]}
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                            activeDot={{ r: 6 }}
                            yAxisId="left"
                            connectNulls
                        />
                    ))}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
