import React, { useState, useMemo } from 'react';
import { useStoreContext } from '../App';
import { Plus, Search, X, Edit2, Eye } from 'lucide-react';

function formatCurrency(n: number) { return '₹' + n.toLocaleString('en-IN'); }

export function CustomersPage() {
  const store = useStoreContext();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [form, setForm] = useState({ customer_name: '', mobile: '', alternate_mobile: '', address: '', contact_person: '', notes: '' });
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    return store.customers.filter(c => {
      const matchSearch = !search || c.customer_name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search);
      const matchStatus = !statusFilter || (statusFilter === 'active' ? c.is_active : !c.is_active);
      return matchSearch && matchStatus;
    });
  }, [store.customers, search, statusFilter]);

  const handleSave = () => {
    if (!form.customer_name) { setError('Customer name is required.'); return; }
    if (!form.mobile) { setError('Mobile number is required.'); return; }
    if (store.isDemoMode) { setError('Demo mode is read-only.'); return; }
    store.addCustomer({ ...form, is_active: true });
    setShowForm(false); setForm({ customer_name: '', mobile: '', alternate_mobile: '', address: '', contact_person: '', notes: '' });
  };

  const customerDetail = selectedCustomer ? store.customers.find(c => c.id === selectedCustomer) : null;
  const customerSales = selectedCustomer ? store.sales.filter(s => s.customer_id === selectedCustomer && s.transaction_state === 'FULFILLED') : [];
  const customerPayments = selectedCustomer ? store.customerPayments.filter(p => p.customer_id === selectedCustomer) : [];
  const customerVehicles = selectedCustomer ? store.vehicles.filter(v => v.customer_id === selectedCustomer) : [];
  const outstanding = selectedCustomer ? store.getCustomerOutstanding(selectedCustomer) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Customers</h1>
          <p className="text-sm text-slate-500">Manage customer information and accounts</p>
        </div>
        <button onClick={() => setShowForm(true)} disabled={store.isDemoMode} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead><tr><th>Customer</th><th>Mobile</th><th>Vehicles</th><th>Total Sales</th><th>Total Qty (BRASS)</th><th>Outstanding</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(c => {
                const sales = store.sales.filter(s => s.customer_id === c.id && s.transaction_state === 'FULFILLED');
                const totalSales = sales.reduce((s, x) => s + x.total_amount, 0);
                const totalQty = sales.reduce((s, x) => s + x.quantity_brass, 0);
                const vehicles = store.vehicles.filter(v => v.customer_id === c.id).length;
                const outst = store.getCustomerOutstanding(c.id);
                return (
                  <tr key={c.id}>
                    <td className="font-medium">{c.customer_name}</td>
                    <td>{c.mobile}</td>
                    <td>{vehicles}</td>
                    <td>{formatCurrency(totalSales)}</td>
                    <td>{totalQty.toFixed(2)}</td>
                    <td className={`font-medium ${outst > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(outst)}</td>
                    <td><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td><button onClick={() => setSelectedCustomer(c.id)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><Eye size={14} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {customerDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">{customerDetail.customer_name}</h2>
              <button onClick={() => setSelectedCustomer(null)} className="p-1.5 hover:bg-slate-100 rounded"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Mobile:</span> <span className="font-medium">{customerDetail.mobile}</span></div>
                <div><span className="text-slate-500">Contact:</span> <span className="font-medium">{customerDetail.contact_person || '—'}</span></div>
                <div><span className="text-slate-500">Address:</span> <span className="font-medium">{customerDetail.address}</span></div>

              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-lg font-bold text-blue-800">{customerSales.length}</p>
                  <p className="text-xs text-blue-600">Sales</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg text-center">
                  <p className="text-lg font-bold text-indigo-800">{customerSales.reduce((s, x) => s + x.quantity_brass, 0).toFixed(2)}</p>
                  <p className="text-xs text-indigo-600">BRASS</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-lg font-bold text-green-800">{customerPayments.length}</p>
                  <p className="text-xs text-green-600">Payments</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-center">
                  <p className="text-lg font-bold text-red-800">{formatCurrency(outstanding)}</p>
                  <p className="text-xs text-red-600">Outstanding</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Vehicles ({customerVehicles.length})</h3>
                <div className="space-y-1">
                  {customerVehicles.map(v => (
                    <div key={v.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded text-sm">
                      <span className="font-mono font-medium">{v.vehicle_number}</span>
                      <span className="text-slate-500">— {v.driver_name}</span>
                      <span className="text-slate-400 text-xs">{v.vehicle_type}</span>
                    </div>
                  ))}
                  {customerVehicles.length === 0 && <p className="text-sm text-slate-500">No vehicles registered</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Add Customer</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 rounded"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
                <input type="text" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mobile *</label>
                  <input type="tel" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Alternate Mobile</label>
                  <input type="tel" value={form.alternate_mobile} onChange={e => setForm({ ...form, alternate_mobile: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                  <input type="text" value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
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
