import React from 'react'
import * as XLSX from 'xlsx'
import { Download } from 'lucide-react'
import './ExportButton.css'

const ExportButton = ({ data, filename, sheetName = 'Sheet1' }) => {
    const handleExport = () => {
        if (!data || data.length === 0) return;
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    return (
        <button className="export-btn" onClick={handleExport} disabled={!data || data.length === 0}>
            <Download size={14} />
            Export to Excel
        </button>
    );
};

export default ExportButton;
