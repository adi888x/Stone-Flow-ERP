import React, { useState } from 'react';
import { useStoreContext } from '../App';
import { Search, Filter } from 'lucide-react';

export function AuditLogsPage() {
  const store = useStoreContext();
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const filtered = store.auditLogs.filter(log => {
    const matchSearch = !search || log.action.toLowerCase().includes(search.toLowerCase()) || log.entity_type.toLowerCase().includes(search.toLowerCase()) || log.user_name.toLowerCase().includes(search.toLowerCase());
    const matchEntity = !entityFilter || log.entity_type === entityFilter;
    return matchSearch && matchEntity;
  });

  const entityTypes = [...new Set(store.auditLogs.map(l => l.entity_type))];

  return (
    <div className="space-y-4">
      <div><p className="text-sm text-slate-500">Track all system changes and actions</p></div>
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
        <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm"><option value="">All Entities</option>{entityTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th><th>Entity ID</th><th>Details</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-slate-500">No audit logs found</td></tr> :
                filtered.map(log => (
                  <tr key={log.id}>
                    <td className="text-xs">{new Date(log.created_at).toLocaleString('en-IN')}</td>
                    <td className="font-medium">{log.user_name}</td>
                    <td><span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                      log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                      log.action === 'CANCEL' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                    }`}>{log.action}</span></td>
                    <td>{log.entity_type}</td>
                    <td className="font-mono text-xs">{log.entity_id.slice(0, 8)}...</td>
                    <td className="text-xs text-slate-500">
                      {log.new_data && <span>New: {JSON.stringify(log.new_data).slice(0, 50)}...</span>}
                      {log.reason && <span className="ml-2 text-amber-600">Reason: {log.reason}</span>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm text-slate-600">{filtered.length} log entries</div>
      </div>
    </div>
  );
}
