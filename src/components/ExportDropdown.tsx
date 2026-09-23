import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';

interface ExportDropdownProps {
  onExportExcel: () => void;
  onExportPDF: () => void;
}

export function ExportDropdown({ onExportExcel, onExportPDF }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExportExcel = () => {
    setIsOpen(false);
    onExportExcel();
  };

  const handleExportPDF = () => {
    setIsOpen(false);
    onExportPDF();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={handleExportExcel}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              <span>Excel (.xlsx)</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <FileText className="w-4 h-4 text-red-600" />
              <span>PDF Document</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
