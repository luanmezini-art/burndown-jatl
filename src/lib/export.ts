import * as XLSX from 'xlsx';
import { differenceInDays, addDays, format, parseISO } from 'date-fns';
import { AppState, TEAM_MEMBERS } from './types';

export function exportToExcel(state: AppState) {
    const { startDate, endDate, logs, projectName } = state;
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const days = differenceInDays(end, start) + 1;

    if (days <= 0) return;

    // Prepare data for Excel
    const data = [];

    for (let i = 0; i < days; i++) {
        const currentDate = addDays(start, i);
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const logEntry = logs[dateStr] || {};

        const row: any = {
            Datum: format(currentDate, 'dd.MM.yyyy'),
        };

        TEAM_MEMBERS.forEach(member => {
            row[member] = logEntry[member] ?? ''; // Use empty string for missing values
        });

        data.push(row);
    }

    // Create Workbook and Sheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Burndown Data");

    // Adjust column width (optional polish)
    const cols = [{ wch: 12 }]; // Date column
    TEAM_MEMBERS.forEach(() => cols.push({ wch: 10 }));
    worksheet['!cols'] = cols;

    // Generate filename
    const fileName = `${projectName.replace(/\s+/g, '_')}_Burndown_Export.xlsx`;

    // Write file
    XLSX.writeFile(workbook, fileName);
}
