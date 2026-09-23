import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStoreContext } from '../App';
import { Plus, Search, X, MoreVertical, Edit, Trash2 } from 'lucide-react';
function formatCurrency(n: number) { return '₹' + n.toLocaleString('en-IN'); }
const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Other'] as const;

export function CustomerPaymentsPage() {
  const store = useStoreContext();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], customer_id: '', amount: '', payment_mode: 'Cash' as typeof PAYMENT_MODES[number], reference_number: '', notes: '' });
  const [error, setError] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    if (openMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenu]);

  const filtered = useMemo(() => {
    return store.customerPayments.filter(p => {
      const customer = store.customers.find(c => c.id === p.customer_id);
      return !search || customer?.customer_name.toLowerCase().includes(search.toLowerCase()) || p.payment_number.toLowerCase().includes(search.toLowerCase());
    });
  }, [store.customerPayments, store.customers, search]);

  const handleSave = () => {
    if (!form.customer_id) { setError('Customer is required.'); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Amount must be greater than 0.'); return; }
    if (store.isDemoMode) { setError('Demo mode is read-only.'); return; }
    store.addCustomerPayment({ customer_id: form.customer_id, date: form.date, amount: parseFloat(form.amount), payment_mode: form.payment_mode, reference_number: form.reference_number, notes: form.notes, created_by: store.currentUser?.full_name || '' });
    setShowForm(false); setForm({ date: new Date().toISOString().split('T')[0], customer_id: '', amount: '', payment_mode: 'Cash', reference_number: '', notes: '' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div><h1 className="text-xl font-bold text-slate-800">Customer Payments</h1><p className="text-sm text-slate-500">Record payments received from customers</p></div>
          <button onClick={() => setShowForm(true)} disabled={store.isDemoMode} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium"><Plus size={16} /> Record Payment</button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search payments..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
        </div>
      </div>

      {/* Table - Scrollable */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
        <table className="erp-table text-base">
          <thead className="sticky top-0 bg-white z-10 shadow-sm"><tr><th>Date</th><th>Payment ID</th><th>Customer</th><th>Amount</th><th>Mode</th><th>Reference</th><th>Created By</th><th></th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={8} className="text-center py-8 text-slate-500">No payments found</td></tr> :
              filtered.map(p => {
                const customer = store.customers.find(c => c.id === p.customer_id);
                return (
                  <tr key={p.id}>
                    <td>{p.date}</td>
                    <td className="font-mono text-sm">{p.payment_number}</td>
                    <td className="font-medium">{customer?.customer_name}</td>
                    <td className="font-bold text-green-700">{formatCurrency(p.amount)}</td>
                    <td><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{p.payment_mode}</span></td>
                    <td className="font-mono text-sm">{p.reference_number || '—'}</td>
                    <td>{p.created_by}</td>
                    <td className="relative">
                      <div ref={openMenu === p.id ? menuRef : null} className="relative">
                        <button 
                          onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                          className="p-1.5 hover:bg-slate-100 rounded"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenu === p.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-[9999]">
                            <button 
                              onClick={() => {
                                // Edit payment logic
                                setOpenMenu(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Edit size={14} /> Edit Payment
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this payment?')) {
                                  // Delete payment logic
                                  setOpenMenu(null);
                                }
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 size={14} /> Delete Payment
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm text-slate-600">Total Received: {formatCurrency(filtered.reduce((s, p) => s + p.amount, 0))}</div>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between"><h2 className="text-lg font-bold text-slate-800">Record Customer Payment</h2><button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 rounded"><X size={18} /></button></div>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Date *</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Customer *</label><select value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"><option value="">Select customer</option>{store.customers.filter(c => c.is_active).map(c => <option key={c.id} value={c.id}>{c.customer_name} — Outstanding: {formatCurrency(store.getCustomerOutstanding(c.id))}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹) *</label><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label><select value={form.payment_mode} onChange={e => setForm({ ...form, payment_mode: e.target.value as any })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">{PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Reference No.</label><input type="text" value={form.reference_number} onChange={e => setForm({ ...form, reference_number: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
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

export function SupplierPaymentsPage() {
  const store = useStoreContext();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], supplier_id: '', amount: '', payment_mode: 'Cash' as typeof PAYMENT_MODES[number], reference_number: '', notes: '' });
  const [error, setError] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    if (openMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenu]);

  const filtered = useMemo(() => {
    return store.supplierPayments.filter(p => {
      const supplier = store.suppliers.find(s => s.id === p.supplier_id);
      return !search || supplier?.supplier_name.toLowerCase().includes(search.toLowerCase()) || p.payment_number.toLowerCase().includes(search.toLowerCase());
    });
  }, [store.supplierPayments, store.suppliers, search]);

  const handleSave = () => {
    if (!form.supplier_id) { setError('Supplier is required.'); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Amount must be greater than 0.'); return; }
    if (store.isDemoMode) { setError('Demo mode is read-only.'); return; }
    store.addSupplierPayment({ supplier_id: form.supplier_id, date: form.date, amount: parseFloat(form.amount), payment_mode: form.payment_mode, reference_number: form.reference_number, notes: form.notes, created_by: store.currentUser?.full_name || '' });
    setShowForm(false); setForm({ date: new Date().toISOString().split('T')[0], supplier_id: '', amount: '', payment_mode: 'Cash', reference_number: '', notes: '' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div><h1 className="text-xl font-bold text-slate-800">Supplier Payments</h1><p className="text-sm text-slate-500">Record payments made to suppliers</p></div>
          <button onClick={() => setShowForm(true)} disabled={store.isDemoMode} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium"><Plus size={16} /> Record Payment</button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search payments..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
        </div>
      </div>

      {/* Table - Scrollable */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
        <table className="erp-table text-base">
          <thead className="sticky top-0 bg-white z-10 shadow-sm"><tr><th>Date</th><th>Payment ID</th><th>Supplier</th><th>Amount</th><th>Mode</th><th>Reference</th><th>Created By</th><th></th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={8} className="text-center py-8 text-slate-500">No payments found</td></tr> :
              filtered.map(p => {
                const supplier = store.suppliers.find(s => s.id === p.supplier_id);
                return (
                  <tr key={p.id}>
                    <td>{p.date}</td>
                    <td className="font-mono text-sm">{p.payment_number}</td>
                    <td className="font-medium">{supplier?.supplier_name}</td>
                    <td className="font-bold text-red-700">{formatCurrency(p.amount)}</td>
                    <td><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{p.payment_mode}</span></td>
                    <td className="font-mono text-sm">{p.reference_number || '—'}</td>
                    <td>{p.created_by}</td>
                    <td className="relative">
                      <div ref={openMenu === p.id ? menuRef : null} className="relative">
                        <button 
                          onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                          className="p-1.5 hover:bg-slate-100 rounded"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenu === p.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-[9999]">
                            <button 
                              onClick={() => {
                                // Edit payment logic
                                setOpenMenu(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Edit size={14} /> Edit Payment
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this payment?')) {
                                  // Delete payment logic
                                  setOpenMenu(null);
                                }
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 size={14} /> Delete Payment
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm text-slate-600">Total Paid: {formatCurrency(filtered.reduce((s, p) => s + p.amount, 0))}</div>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between"><h2 className="text-lg font-bold text-slate-800">Record Supplier Payment</h2><button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 rounded"><X size={18} /></button></div>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Date *</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Supplier *</label><select value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"><option value="">Select supplier</option>{store.suppliers.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.supplier_name} — Outstanding: {formatCurrency(store.getSupplierOutstanding(s.id))}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹) *</label><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label><select value={form.payment_mode} onChange={e => setForm({ ...form, payment_mode: e.target.value as any })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">{PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Reference No.</label><input type="text" value={form.reference_number} onChange={e => setForm({ ...form, reference_number: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>
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
