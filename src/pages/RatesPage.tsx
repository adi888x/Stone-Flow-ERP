import React, { useState, useMemo } from 'react';
import { useStoreContext } from '../App';
import { Plus, Search, X } from 'lucide-react';
function formatCurrency(n: number) { return '₹' + n.toLocaleString('en-IN'); }

export function RatesPage() {
  const store = useStoreContext();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [form, setForm] = useState({ customer_id: '', material_id: '', rate: '', effective_from: new Date().toISOString().split('T')[0] });
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    return store.customerRates.filter(r => {
      const customer = store.customers.find(c => c.id === r.customer_id);
      const material = store.materials.find(m => m.id === r.material_id);
      const matchSearch = !search || customer?.customer_name.toLowerCase().includes(search.toLowerCase()) || material?.material_name.toLowerCase().includes(search.toLowerCase());
      const matchCustomer = !customerFilter || r.customer_id === customerFilter;
      return matchSearch && matchCustomer;
    });
  }, [store.customerRates, store.customers, store.materials, search, customerFilter]);

  const handleSave = () => {
    if (!form.customer_id) { setError('Customer is required.'); return; }
    if (!form.material_id) { setError('Material is required.'); return; }
    if (!form.rate || parseFloat(form.rate) <= 0) { setError('Rate must be greater than 0.'); return; }
    if (store.isDemoMode) { setError('Demo mode is read-only.'); return; }
    store.addRate({ customer_id: form.customer_id, material_id: form.material_id, rate: parseFloat(form.rate), unit: 'BRASS', effective_from: form.effective_from, is_active: true });
    setShowForm(false); setForm({ customer_id: '', material_id: '', rate: '', effective_from: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div><h1 className="text-xl font-bold text-slate-800">Customer Rates</h1><p className="text-sm text-slate-500">Manage customer-specific pricing (per BRASS)</p></div>
          <button onClick={() => setShowForm(true)} disabled={store.isDemoMode} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium"><Plus size={16} /> Add Rate</button>
        </div>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <strong>Default Rate:</strong> {formatCurrency(store.appSettings.default_rate)} / BRASS — Applied when no customer-specific rate exists.
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search rates..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
          <select value={customerFilter} onChange={e => setCustomerFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm"><option value="">All Customers</option>{store.customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}</select>
        </div>
      </div>

      {/* Table - Scrollable */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
        <table className="erp-table text-base">
          <thead className="sticky top-0 bg-white z-10 shadow-sm"><tr><th>Customer</th><th>Material</th><th>Rate / BRASS</th><th>Effective From</th><th>Effective To</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map(r => {
              const customer = store.customers.find(c => c.id === r.customer_id);
              const material = store.materials.find(m => m.id === r.material_id);
              return (
                <tr key={r.id}>
                  <td className="font-medium">{customer?.customer_name}</td>
                  <td>{material?.material_name}</td>
                  <td className="font-bold text-blue-700">{formatCurrency(r.rate)}</td>
                  <td>{r.effective_from}</td>
                  <td>{r.effective_to || '—'}</td>
                  <td><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{r.is_active ? 'Active' : 'Inactive'}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between"><h2 className="text-lg font-bold text-slate-800">Add Customer Rate</h2><button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 rounded"><X size={18} /></button></div>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Customer *</label><select value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"><option value="">Select customer</option>{store.customers.filter(c => c.is_active).map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Material *</label><select value={form.material_id} onChange={e => setForm({ ...form, material_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"><option value="">Select material</option>{store.materials.filter(m => m.is_active).map(m => <option key={m.id} value={m.id}>{m.material_name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Rate per BRASS (₹) *</label><input type="number" step="0.01" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} placeholder="4500.00" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Effective From *</label><input type="date" value={form.effective_from} onChange={e => setForm({ ...form, effective_from: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
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
