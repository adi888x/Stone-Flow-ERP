import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangeFilterProps {
  fromDate: string;
  toDate: string;
  dateRange: string;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
  onDateRangeChange: (range: string) => void;
}

export function DateRangeFilter({
  fromDate,
  toDate,
  dateRange,
  onFromDateChange,
  onToDateChange,
  onDateRangeChange,
}: DateRangeFilterProps) {
  const handleDateRangeChange = (range: string) => {
    onDateRangeChange(range);
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (range === 'today') {
      onFromDateChange(todayStr);
      onToDateChange(todayStr);
    } else if (range === 'thisWeek') {
      const startOfWeek = new Date(today);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      onFromDateChange(startOfWeek.toISOString().split('T')[0]);
      onToDateChange(todayStr);
    } else if (range === 'thisMonth') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      onFromDateChange(startOfMonth.toISOString().split('T')[0]);
      onToDateChange(todayStr);
    }
    // For 'custom', don't change dates, let user select manually
  };

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={dateRange}
        onChange={(e) => handleDateRangeChange(e.target.value)}
        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="today">Today</option>
        <option value="thisWeek">This Week</option>
        <option value="thisMonth">This Month</option>
        <option value="custom">Custom Range</option>
      </select>

      {dateRange === 'custom' && (
        <>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="From Date"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="To Date"
            />
          </div>
        </>
      )}
    </div>
  );
}
