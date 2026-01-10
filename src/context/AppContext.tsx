import React, { createContext, useContext, useEffect, useState } from 'react';
import { addDays, format } from 'date-fns';
import type { AppContextType, AppState, DailyLog, TeamMember } from '../lib/types';
import { supabase } from '../lib/supabase';

const defaultState: AppState = {
    projectName: 'Projekt JATL',
    startDate: '2025-09-09',
    endDate: '2026-01-15',
    initialBudget: 250,
    logs: {},
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AppState>(defaultState);
    const [loading, setLoading] = useState(true);

    // Initial Fetch & Subscription
    useEffect(() => {
        fetchLogs();

        // Subscribe to realtime changes so other users' edits appear instantly
        const channel = supabase
            .channel('public:burndown_logs')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'burndown_logs',
                },
                () => {
                    fetchLogs();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchLogs = async () => {
        const { data, error } = await supabase
            .from('burndown_logs')
            .select('*');

        if (error) {
            console.error('Error fetching logs:', error);
            return;
        }

        if (data) {
            const newLogs: DailyLog = {};
            data.forEach((row: any) => {
                if (!newLogs[row.date]) newLogs[row.date] = {};
                newLogs[row.date][row.member as TeamMember] = row.remaining_hours;
            });
            setState(s => ({ ...s, logs: newLogs }));
        }
        setLoading(false);
    };

    const setProjectName = (name: string) => setState(s => ({ ...s, projectName: name }));
    const setStartDate = (date: string) => setState(s => ({ ...s, startDate: date }));
    const setEndDate = (date: string) => setState(s => ({ ...s, endDate: date }));

    const updateLog = async (date: string, member: TeamMember, remaining: number) => {
        // Optimistic Update (update UI immediately)
        setState(s => ({
            ...s,
            logs: {
                ...s.logs,
                [date]: {
                    ...(s.logs[date] || {}),
                    [member]: remaining
                }
            }
        }));

        // Send to DB
        const { error } = await supabase
            .from('burndown_logs')
            .upsert({ date, member, remaining_hours: remaining }, { onConflict: 'date,member' });

        if (error) {
            console.error("Supabase Error:", error);
        }
    };

    const resetData = async () => {
        if (confirm('Sind Sie sicher? Dies löscht ALLE Daten aus der Datenbank für alle Nutzer.')) {
            // Delete all entries. Since we don't have a "truncate" in client easily without RLS policies preventing it, 
            // we delete rows where remaining_hours is greater than -1 (all rows).
            const { error } = await supabase.from('burndown_logs').delete().gt('remaining_hours', -1);

            if (!error) {
                setState(s => ({ ...s, logs: {} }));
            } else {
                console.error("Delete Error", error);
            }
        }
    };

    return (
        <AppContext.Provider value={{ ...state, setProjectName, setStartDate, setEndDate, updateLog, resetData }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
}
