import React, { useState } from 'react';
import { useStoreContext } from '../App';
import { Plus, X } from 'lucide-react';

export function MaterialsPage() {
  const store = useStoreContext();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ material_name: '', category: 'Sand', unit: 'BRASS', description: '' });
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!form.material_name) { setError('Material name is required.'); return; }
    if (store.isDemoMode) { setError('Demo mode is read-only.'); return; }
    store.addMaterial({ ...form, is_active: true });
    setShowForm(false); setForm({ material_name: '', category: 'Sand', unit: 'BRASS', description: '' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div><h1 className="text-xl font-bold text-slate-800">Materials</h1><p className="text-sm text-slate-500">Manage materials and products</p></div>
          <button onClick={() => setShowForm(true)} disabled={store.isDemoMode} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium"><Plus size={16} /> Add Material</button>
        </div>
      </div>

      {/* Table - Scrollable */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
        <table className="erp-table text-base">
          <thead className="sticky top-0 bg-white z-10 shadow-sm"><tr><th>Material</th><th>Category</th><th>Unit</th><th>Description</th><th>Status</th></tr></thead>
          <tbody>
            {store.materials.map(m => (
              <tr key={m.id}>
                <td className="font-medium">{m.material_name}</td>
                <td><span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{m.category}</span></td>
                <td className="font-medium text-blue-600">{m.unit}</td>
                <td className="text-slate-500 text-sm">{m.description || '—'}</td>
                <td><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{m.is_active ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between"><h2 className="text-lg font-bold text-slate-800">Add Material</h2><button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 rounded"><X size={18} /></button></div>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Material Name *</label><input type="text" value={form.material_name} onChange={e => setForm({ ...form, material_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"><option>Sand</option><option>Aggregate</option><option>Gravel</option><option>Other</option></select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Unit</label><select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"><option>BRASS</option></select></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
            </div>
            <div className="p-5 border-t border-slate-200 flex gap-3">
              <button onClick={handleSave} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm">SAVE</button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm border border-slate-300">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
