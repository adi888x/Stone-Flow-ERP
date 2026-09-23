import React from 'react';
import { Filter } from 'lucide-react';

interface StatusFilterProps {
  status: string;
  onStatusChange: (status: string) => void;
}

export function StatusFilter({ status, onStatusChange }: StatusFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Filter className="w-4 h-4 text-slate-500" />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="all">All Status</option>
        <option value="FULFILLED">Fulfilled</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
    </div>
  );
}
