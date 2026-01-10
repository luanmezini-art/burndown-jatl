import React, { createContext, useContext, useEffect, useState } from 'react';
import { differenceInDays, addDays, format } from 'date-fns';
import { TEAM_MEMBERS } from '../lib/types';
import { AppContextType, AppState, DailyLog, TeamMember } from '../lib/types';

const STORAGE_KEY = 'agile_dashboard_data_v1';

const defaultState: AppState = {
    projectName: 'Sprint 1',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
    initialBudget: 250,
    logs: {},
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AppState>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse logs', e);
            }
        }
        return defaultState;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const setProjectName = (name: string) => setState(s => ({ ...s, projectName: name }));
    const setStartDate = (date: string) => setState(s => ({ ...s, startDate: date }));
    const setEndDate = (date: string) => setState(s => ({ ...s, endDate: date }));

    const updateLog = (date: string, member: TeamMember, remaining: number) => {
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
    };

    const resetData = () => {
        if (confirm('Sind Sie sicher? Alle Daten gehen verloren.')) {
            setState(defaultState);
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
