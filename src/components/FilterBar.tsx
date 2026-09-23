import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { DateRangeFilter } from './DateRangeFilter';
import { StatusFilter } from './StatusFilter';
import { ExportDropdown } from './ExportDropdown';

interface FilterBarProps {
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  fromDate: string;
  toDate: string;
  dateRange: string;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
  onDateRangeChange: (range: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  onReset: () => void;
  children?: React.ReactNode;
}

export function FilterBar({
  searchValue,
  searchPlaceholder,
  onSearchChange,
  fromDate,
  toDate,
  dateRange,
  onFromDateChange,
  onToDateChange,
  onDateRangeChange,
  status,
  onStatusChange,
  onExportExcel,
  onExportPDF,
  onReset,
  children,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
      {/* Search and Actions Row */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <DateRangeFilter
            fromDate={fromDate}
            toDate={toDate}
            dateRange={dateRange}
            onFromDateChange={onFromDateChange}
            onToDateChange={onToDateChange}
            onDateRangeChange={onDateRangeChange}
          />

          <StatusFilter status={status} onStatusChange={onStatusChange} />

          <ExportDropdown onExportExcel={onExportExcel} onExportPDF={onExportPDF} />

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Additional Filters (children) */}
      {children && (
        <div className="flex flex-wrap gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
