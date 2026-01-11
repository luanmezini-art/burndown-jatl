export type TeamMember = 'Joanna' | 'Tatiana' | 'Leman' | 'Anastasia';

export const TEAM_MEMBERS: TeamMember[] = ['Joanna', 'Tatiana', 'Leman', 'Anastasia'];

export const MEMBER_DISPLAY_NAMES: Record<TeamMember, string> = {
    Joanna: 'Mezini, J.',
    Tatiana: 'Klassen, T.',
    Leman: 'Özel, L.',
    Anastasia: 'Legbaum, A.'
};

export interface DailyLog {
    [date: string]: {
        [key in TeamMember]?: number; // Remaining hours
    };
}

export interface AppState {
    projectName: string;
    startDate: string; // ISO date string YYYY-MM-DD
    endDate: string; // ISO date string YYYY-MM-DD
    initialBudget: number; // 250
    logs: DailyLog;
}

export interface AppContextType extends AppState {
    setProjectName: (name: string) => void;
    setStartDate: (date: string) => void;
    setEndDate: (date: string) => void;
    updateLog: (date: string, member: TeamMember, remaining: number) => void;
    resetData: () => void;
}
