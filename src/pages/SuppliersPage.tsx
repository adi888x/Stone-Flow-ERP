import React, { useState, useMemo } from 'react';
import { useStoreContext } from '../App';
import { Plus, Search, X, Eye } from 'lucide-react';
function formatCurrency(n: number) { return '₹' + n.toLocaleString('en-IN'); }

export function SuppliersPage() {
  const store = useStoreContext();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [form, setForm] = useState({ supplier_name: '', mobile: '', alternate_mobile: '', address: '', gstin: '', contact_person: '', notes: '' });
  const [error, setError] = useState('');

  const filtered = useMemo(() => store.suppliers.filter(s => !search || s.supplier_name.toLowerCase().includes(search.toLowerCase()) || s.mobile.includes(search)), [store.suppliers, search]);

  const handleSave = () => {
    if (!form.supplier_name) { setError('Supplier name is required.'); return; }
    if (!form.mobile) { setError('Mobile number is required.'); return; }
    if (store.isDemoMode) { setError('Demo mode is read-only.'); return; }
    store.addSupplier({ ...form, is_active: true });
    setShowForm(false); setForm({ supplier_name: '', mobile: '', alternate_mobile: '', address: '', gstin: '', contact_person: '', notes: '' });
  };

  const supplierDetail = selectedSupplier ? store.suppliers.find(s => s.id === selectedSupplier) : null;
  const supplierPurchases = selectedSupplier ? store.purchases.filter(p => p.supplier_id === selectedSupplier && p.transaction_state === 'ACTIVE') : [];
  const supplierPayments = selectedSupplier ? store.supplierPayments.filter(p => p.supplier_id === selectedSupplier) : [];
  const supplierVehicles = selectedSupplier ? store.vehicles.filter(v => v.supplier_id === selectedSupplier) : [];
  const outstanding = selectedSupplier ? store.getSupplierOutstanding(selectedSupplier) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div><h1 className="text-xl font-bold text-slate-800">Suppliers</h1><p className="text-sm text-slate-500">Manage supplier information and accounts</p></div>
        <button onClick={() => setShowForm(true)} disabled={store.isDemoMode} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium"><Plus size={16} /> Add Supplier</button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead><tr><th>Supplier</th><th>Mobile</th><th>GSTIN</th><th>Vehicles</th><th>Total Purchases</th><th>Total Qty (BRASS)</th><th>Outstanding</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(s => {
                const purchases = store.purchases.filter(p => p.supplier_id === s.id && p.transaction_state === 'ACTIVE');
                const totalPurchases = purchases.reduce((sum, p) => sum + p.total_amount, 0);
                const totalQty = purchases.reduce((sum, p) => sum + p.quantity_brass, 0);
                const vehicles = store.vehicles.filter(v => v.supplier_id === s.id).length;
                const outst = store.getSupplierOutstanding(s.id);
                return (
                  <tr key={s.id}>
                    <td className="font-medium">{s.supplier_name}</td><td>{s.mobile}</td><td className="font-mono text-xs">{s.gstin || '—'}</td><td>{vehicles}</td>
                    <td>{formatCurrency(totalPurchases)}</td><td>{totalQty.toFixed(2)}</td>
                    <td className={`font-medium ${outst > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(outst)}</td>
                    <td><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td><button onClick={() => setSelectedSupplier(s.id)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><Eye size={14} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {supplierDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">{supplierDetail.supplier_name}</h2>
              <button onClick={() => setSelectedSupplier(null)} className="p-1.5 hover:bg-slate-100 rounded"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Mobile:</span> <span className="font-medium">{supplierDetail.mobile}</span></div>
                <div><span className="text-slate-500">Contact:</span> <span className="font-medium">{supplierDetail.contact_person || '—'}</span></div>
                <div><span className="text-slate-500">Address:</span> <span className="font-medium">{supplierDetail.address}</span></div>
                <div><span className="text-slate-500">GSTIN:</span> <span className="font-medium font-mono">{supplierDetail.gstin || '—'}</span></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg text-center"><p className="text-lg font-bold text-blue-800">{supplierPurchases.length}</p><p className="text-xs text-blue-600">Purchases</p></div>
                <div className="p-3 bg-indigo-50 rounded-lg text-center"><p className="text-lg font-bold text-indigo-800">{supplierPurchases.reduce((s, x) => s + x.quantity_brass, 0).toFixed(2)}</p><p className="text-xs text-indigo-600">BRASS</p></div>
                <div className="p-3 bg-green-50 rounded-lg text-center"><p className="text-lg font-bold text-green-800">{supplierPayments.length}</p><p className="text-xs text-green-600">Payments</p></div>
                <div className="p-3 bg-red-50 rounded-lg text-center"><p className="text-lg font-bold text-red-800">{formatCurrency(outstanding)}</p><p className="text-xs text-red-600">Outstanding</p></div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Vehicles ({supplierVehicles.length})</h3>
                {supplierVehicles.map(v => (<div key={v.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded text-sm"><span className="font-mono font-medium">{v.vehicle_number}</span><span className="text-slate-500">— {v.driver_name}</span></div>))}
                {supplierVehicles.length === 0 && <p className="text-sm text-slate-500">No vehicles registered</p>}
              </div>
            </div>
          </div>
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between"><h2 className="text-lg font-bold text-slate-800">Add Supplier</h2><button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 rounded"><X size={18} /></button></div>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Supplier Name *</label><input type="text" value={form.supplier_name} onChange={e => setForm({ ...form, supplier_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Mobile *</label><input type="tel" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Alternate Mobile</label><input type="tel" value={form.alternate_mobile} onChange={e => setForm({ ...form, alternate_mobile: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Address</label><textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">GSTIN</label><input type="text" value={form.gstin} onChange={e => setForm({ ...form, gstin: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label><input type="text" value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              </div>
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
