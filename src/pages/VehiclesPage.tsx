import React, { useState, useMemo } from 'react';
import { useStoreContext } from '../App';
import { Plus, Search, X } from 'lucide-react';

export function VehiclesPage() {
  const store = useStoreContext();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'customer' | 'supplier'>('all');
  const [form, setForm] = useState({ vehicle_number: '', vehicle_type: 'Tipper', owner_name: '', customer_id: '', supplier_id: '', driver_name: '', driver_mobile: '', capacity: '' });
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    return store.vehicles.filter(v => {
      const matchSearch = !search || v.vehicle_number.toLowerCase().includes(search.toLowerCase()) || v.driver_name.toLowerCase().includes(search.toLowerCase());
      const matchType = !typeFilter || v.vehicle_type === typeFilter;
      const matchOwner = ownerFilter === 'all' || (ownerFilter === 'customer' ? !!v.customer_id : !!v.supplier_id);
      return matchSearch && matchType && matchOwner && v.is_active;
    });
  }, [store.vehicles, search, typeFilter, ownerFilter]);

  const normalizeVehicleNo = (v: string) => v.replace(/\s+/g, '').toUpperCase();

  const handleSave = () => {
    if (!form.vehicle_number) { setError('Vehicle number is required.'); return; }
    if (!form.driver_name) { setError('Driver name is required.'); return; }
    if (store.isDemoMode) { setError('Demo mode is read-only.'); return; }
    const normalized = normalizeVehicleNo(form.vehicle_number);
    if (store.vehicles.some(v => v.vehicle_number === normalized && v.is_active)) { setError('This vehicle number already exists.'); return; }
    store.addVehicle({ ...form, vehicle_number: normalized, is_active: true, customer_id: form.customer_id || undefined, supplier_id: form.supplier_id || undefined });
    setShowForm(false);
    setForm({ vehicle_number: '', vehicle_type: 'Tipper', owner_name: '', customer_id: '', supplier_id: '', driver_name: '', driver_mobile: '', capacity: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div><h1 className="text-xl font-bold text-slate-800">Vehicles</h1><p className="text-sm text-slate-500">Manage vehicles for customers and suppliers</p></div>
        <button onClick={() => setShowForm(true)} disabled={store.isDemoMode} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium"><Plus size={16} /> Add Vehicle</button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm"><option value="">All Types</option><option value="Tipper">Tipper</option><option value="Truck">Truck</option><option value="Mini Truck">Mini Truck</option></select>
        <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value as any)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm"><option value="all">All Owners</option><option value="customer">Customer</option><option value="supplier">Supplier</option></select>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead><tr><th>Vehicle No.</th><th>Type</th><th>Owner</th><th>Customer/Supplier</th><th>Driver</th><th>Mobile</th><th>Capacity</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(v => {
                const customer = store.customers.find(c => c.id === v.customer_id);
                const supplier = store.suppliers.find(s => s.id === v.supplier_id);
                return (
                  <tr key={v.id}>
                    <td className="font-mono font-medium">{v.vehicle_number}</td>
                    <td><span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{v.vehicle_type}</span></td>
                    <td>{v.owner_name}</td>
                    <td>{customer?.customer_name || supplier?.supplier_name || '—'}</td>
                    <td>{v.driver_name}</td>
                    <td>{v.driver_mobile || '—'}</td>
                    <td>{v.capacity || '—'}</td>
                    <td><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm text-slate-600">{filtered.length} vehicles</div>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between"><h2 className="text-lg font-bold text-slate-800">Add Vehicle</h2><button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 rounded"><X size={18} /></button></div>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Number *</label><input type="text" value={form.vehicle_number} onChange={e => setForm({ ...form, vehicle_number: e.target.value })} placeholder="MH16AB1234" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Type</label><select value={form.vehicle_type} onChange={e => setForm({ ...form, vehicle_type: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"><option>Tipper</option><option>Truck</option><option>Mini Truck</option></select></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Owner Name</label><input type="text" value={form.owner_name} onChange={e => setForm({ ...form, owner_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Assign to Customer</label><select value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value, supplier_id: '' })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"><option value="">None</option>{store.customers.filter(c => c.is_active).map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Assign to Supplier</label><select value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value, customer_id: '' })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"><option value="">None</option>{store.suppliers.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Driver Name *</label><input type="text" value={form.driver_name} onChange={e => setForm({ ...form, driver_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Driver Mobile</label><input type="tel" value={form.driver_mobile} onChange={e => setForm({ ...form, driver_mobile: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label><input type="text" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="e.g., 15 Brass" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
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
