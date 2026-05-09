import React, { useState } from 'react'
import ExcelJS from 'exceljs'
import { Download } from 'lucide-react'
import './ExportButton.css'

const ExportButton = ({ data, filename, sheetName = 'Sheet1' }) => {
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        if (!data || data.length === 0) return;
        setExporting(true);
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(sheetName);

            worksheet.columns = Object.keys(data[0]).map(key => ({ header: key, key }));
            data.forEach(row => worksheet.addRow(row));

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setExporting(false);
        }
    };

    return (
        <button
            className="export-btn"
            onClick={handleExport}
            disabled={!data || data.length === 0 || exporting}
        >
            <Download size={14} />
            {exporting ? 'Exporting…' : 'Export to Excel'}
        </button>
    );
};

export default ExportButton;
