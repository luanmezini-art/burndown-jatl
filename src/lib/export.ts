import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { differenceInDays, addDays, format, parseISO } from 'date-fns';
import type { AppState } from './types';
import { TEAM_MEMBERS } from './types';

export async function exportToExcel(state: AppState) {
    const { startDate, endDate, logs, projectName } = state;
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const days = differenceInDays(end, start) + 1;

    if (days <= 0) return;

    // 1. Create Workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Burndown App';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Burndown Data');

    // 2. Define Columns
    sheet.columns = [
        { header: 'Datum', key: 'date', width: 15 },
        ...TEAM_MEMBERS.map(m => ({ header: m, key: m, width: 15 })),
    ];

    // Style Header
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6E6' }
    };

    // 3. Add Data Rows
    for (let i = 0; i < days; i++) {
        const currentDate = addDays(start, i);
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const logEntry = logs[dateStr] || {};

        const row: any = {
            date: format(currentDate, 'dd.MM.yyyy'),
        };

        TEAM_MEMBERS.forEach(member => {
            const val = logEntry[member];
            row[member] = val !== undefined ? val : '';
        });

        sheet.addRow(row);
    }

    // 4. Capture Chart Image
    const chartElement = document.getElementById('burndown-chart-container');
    if (chartElement) {
        try {
            const canvas = await html2canvas(chartElement, {
                scale: 2, // Higher resolution
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            const imageBase64 = canvas.toDataURL('image/png');

            const imageId = workbook.addImage({
                base64: imageBase64,
                extension: 'png',
            });

            // Add image to next available space (e.g., column G, spanning decent width)
            // Let's allow some space. Table usually ~5 columns.
            // Insert image at the top right or below.
            // Let's put it next to the table, starting at column F (index 5)
            sheet.addImage(imageId, {
                tl: { col: TEAM_MEMBERS.length + 2, row: 1 }, // Start row 1 (0-indexed? No, 1-indexed in tl object usually? ExcelJS uses 0-based for internal, but let's check docs safely. tl: { col: 5, row: 1 } means F2
                ext: { width: 800, height: 500 }
            });

        } catch (error) {
            console.error("Chart capture failed", error);
        }
    }

    // 5. Write File
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `${projectName.replace(/\s+/g, '_')}_Burndown_Export.xlsx`;
    saveAs(new Blob([buffer]), fileName);
}
