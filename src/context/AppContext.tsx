import React, { createContext, useContext, useEffect, useState } from 'react';
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
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Login Function
    const login = (pin: string) => {
        const correctPin = import.meta.env.VITE_APP_PIN || '1502';
        if (pin === correctPin) {
            setIsAuthenticated(true);
            localStorage.setItem('burndown_auth_success', 'true');
            return true;
        }
        return false;
    };

    // Logout Function
    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('burndown_auth_success');
    };

    // Initial Fetch & Subscription & Auth Check
    useEffect(() => {
        // Check Auth
        const storedAuth = localStorage.getItem('burndown_auth_success');
        if (storedAuth === 'true') {
            setIsAuthenticated(true);
        }

        fetchLogs();

        // Subscribe to realtime changes
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
        // Optimistic Update
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
            const { error } = await supabase.from('burndown_logs').delete().gt('remaining_hours', -1);
            if (!error) {
                setState(s => ({ ...s, logs: {} }));
            } else {
                console.error("Delete Error", error);
            }
        }
    };

    return (
        <AppContext.Provider value={{
            ...state,
            isAuthenticated,
            login,
            logout,
            setProjectName,
            setStartDate,
            setEndDate,
            updateLog,
            resetData
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
}
