import React, { useState, useMemo } from 'react';
import { useStoreContext } from '../App';
import { Search, FileDown } from 'lucide-react';
function formatCurrency(n: number) { return '₹' + n.toLocaleString('en-IN'); }

export function CustomerLedgerPage() {
  const store = useStoreContext();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const ledger = useMemo(() => {
    if (!selectedCustomer) return [];
    const entries: any[] = [];
    // Add sales
    store.sales.filter(s => s.customer_id === selectedCustomer && s.transaction_state === 'FULFILLED').forEach(s => {
      const vehicle = store.vehicles.find(v => v.id === s.vehicle_id);
      const material = store.materials.find(m => m.id === s.material_id);
      entries.push({ date: s.date, reference_no: s.sale_slip_number, type: 'Sale' as const, description: `Sale - ${material?.material_name}`, vehicle: vehicle?.vehicle_number, material: material?.material_name, qty_brass: s.quantity_brass, debit: s.total_amount, credit: 0 });
    });
    // Add payments
    store.customerPayments.filter(p => p.customer_id === selectedCustomer).forEach(p => {
      entries.push({ date: p.date, reference_no: p.payment_number, type: 'Customer Payment' as const, description: `Payment - ${p.payment_mode}`, debit: 0, credit: p.amount });
    });
    // Sort by date
    entries.sort((a, b) => a.date.localeCompare(b.date));
    // Calculate running balance
    let balance = 0;
    return entries.map(e => { balance += e.debit - e.credit; return { ...e, balance }; });
  }, [selectedCustomer, store]);

  const filteredLedger = useMemo(() => {
    return ledger.filter(e => {
      const matchFrom = !dateFrom || e.date >= dateFrom;
      const matchTo = !dateTo || e.date <= dateTo;
      return matchFrom && matchTo;
    });
  }, [ledger, dateFrom, dateTo]);

  const customer = store.customers.find(c => c.id === selectedCustomer);

  return (
    <div className="space-y-4">
      <div><h1 className="text-xl font-bold text-slate-800">Customer Ledger</h1><p className="text-sm text-slate-500">View customer transaction history and running balance</p></div>
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
        <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm min-w-[200px]">
          <option value="">Select Customer</option>
          {store.customers.filter(c => c.is_active).map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
      </div>
      {selectedCustomer && customer && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg text-center"><p className="text-lg font-bold text-blue-800">{filteredLedger.filter(e => e.type === 'Sale').length}</p><p className="text-xs text-blue-600">Sales</p></div>
          <div className="p-3 bg-green-50 rounded-lg text-center"><p className="text-lg font-bold text-green-800">{formatCurrency(filteredLedger.reduce((s, e) => s + e.debit, 0))}</p><p className="text-xs text-green-600">Total Debit</p></div>
          <div className="p-3 bg-emerald-50 rounded-lg text-center"><p className="text-lg font-bold text-emerald-800">{formatCurrency(filteredLedger.reduce((s, e) => s + e.credit, 0))}</p><p className="text-xs text-emerald-600">Total Credit</p></div>
          <div className="p-3 bg-red-50 rounded-lg text-center"><p className="text-lg font-bold text-red-800">{formatCurrency(store.getCustomerOutstanding(selectedCustomer))}</p><p className="text-xs text-red-600">Outstanding</p></div>
        </div>
      )}
      {selectedCustomer && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="erp-table">
              <thead><tr><th>Date</th><th>Reference No.</th><th>Type</th><th>Description</th><th>Vehicle</th><th>Material</th><th>Qty (BRASS)</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead>
              <tbody>
                {filteredLedger.length === 0 ? <tr><td colSpan={10} className="text-center py-8 text-slate-500">No transactions found</td></tr> :
                  filteredLedger.map((e, i) => (
                    <tr key={i}>
                      <td>{e.date}</td>
                      <td className="font-mono text-xs">{e.reference_no}</td>
                      <td><span className={`px-2 py-0.5 rounded text-xs font-medium ${e.type === 'Sale' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{e.type}</span></td>
                      <td>{e.description}</td>
                      <td className="font-mono text-xs">{e.vehicle || '—'}</td>
                      <td>{e.material || '—'}</td>
                      <td>{e.qty_brass?.toFixed(2) || '—'}</td>
                      <td className={e.debit > 0 ? 'text-red-600 font-medium' : ''}>{e.debit > 0 ? formatCurrency(e.debit) : '—'}</td>
                      <td className={e.credit > 0 ? 'text-green-600 font-medium' : ''}>{e.credit > 0 ? formatCurrency(e.credit) : '—'}</td>
                      <td className="font-bold">{formatCurrency(e.balance)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {!selectedCustomer && <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">Select a customer to view their ledger</div>}
    </div>
  );
}

export function SupplierLedgerPage() {
  const store = useStoreContext();
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const ledger = useMemo(() => {
    if (!selectedSupplier) return [];
    const entries: any[] = [];
    store.purchases.filter(p => p.supplier_id === selectedSupplier && p.transaction_state === 'FULFILLED').forEach(p => {
      const vehicle = store.vehicles.find(v => v.id === p.vehicle_id);
      const material = store.materials.find(m => m.id === p.material_id);
      entries.push({ date: p.date, reference_no: p.purchase_slip_number, type: 'Purchase' as const, description: `Purchase - ${material?.material_name}`, vehicle: vehicle?.vehicle_number, material: material?.material_name, qty_brass: p.quantity_brass, debit: p.total_amount, credit: 0 });
    });
    store.supplierPayments.filter(p => p.supplier_id === selectedSupplier).forEach(p => {
      entries.push({ date: p.date, reference_no: p.payment_number, type: 'Supplier Payment' as const, description: `Payment - ${p.payment_mode}`, debit: 0, credit: p.amount });
    });
    entries.sort((a, b) => a.date.localeCompare(b.date));
    let balance = 0;
    return entries.map(e => { balance += e.debit - e.credit; return { ...e, balance }; });
  }, [selectedSupplier, store]);

  const filteredLedger = useMemo(() => {
    return ledger.filter(e => (!dateFrom || e.date >= dateFrom) && (!dateTo || e.date <= dateTo));
  }, [ledger, dateFrom, dateTo]);

  return (
    <div className="space-y-4">
      <div><h1 className="text-xl font-bold text-slate-800">Supplier Ledger</h1><p className="text-sm text-slate-500">View supplier transaction history and running balance</p></div>
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
        <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm min-w-[200px]">
          <option value="">Select Supplier</option>
          {store.suppliers.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
      </div>
      {selectedSupplier && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg text-center"><p className="text-lg font-bold text-blue-800">{filteredLedger.filter(e => e.type === 'Purchase').length}</p><p className="text-xs text-blue-600">Purchases</p></div>
          <div className="p-3 bg-green-50 rounded-lg text-center"><p className="text-lg font-bold text-green-800">{formatCurrency(filteredLedger.reduce((s, e) => s + e.debit, 0))}</p><p className="text-xs text-green-600">Total Debit</p></div>
          <div className="p-3 bg-emerald-50 rounded-lg text-center"><p className="text-lg font-bold text-emerald-800">{formatCurrency(filteredLedger.reduce((s, e) => s + e.credit, 0))}</p><p className="text-xs text-emerald-600">Total Credit</p></div>
          <div className="p-3 bg-red-50 rounded-lg text-center"><p className="text-lg font-bold text-red-800">{formatCurrency(store.getSupplierOutstanding(selectedSupplier))}</p><p className="text-xs text-red-600">Outstanding</p></div>
        </div>
      )}
      {selectedSupplier && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="erp-table">
              <thead><tr><th>Date</th><th>Reference No.</th><th>Type</th><th>Description</th><th>Vehicle</th><th>Material</th><th>Qty (BRASS)</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead>
              <tbody>
                {filteredLedger.length === 0 ? <tr><td colSpan={10} className="text-center py-8 text-slate-500">No transactions found</td></tr> :
                  filteredLedger.map((e, i) => (
                    <tr key={i}>
                      <td>{e.date}</td><td className="font-mono text-xs">{e.reference_no}</td>
                      <td><span className={`px-2 py-0.5 rounded text-xs font-medium ${e.type === 'Purchase' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{e.type}</span></td>
                      <td>{e.description}</td><td className="font-mono text-xs">{e.vehicle || '—'}</td><td>{e.material || '—'}</td>
                      <td>{e.qty_brass?.toFixed(2) || '—'}</td>
                      <td className={e.debit > 0 ? 'text-red-600 font-medium' : ''}>{e.debit > 0 ? formatCurrency(e.debit) : '—'}</td>
                      <td className={e.credit > 0 ? 'text-green-600 font-medium' : ''}>{e.credit > 0 ? formatCurrency(e.credit) : '—'}</td>
                      <td className="font-bold">{formatCurrency(e.balance)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {!selectedSupplier && <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">Select a supplier to view their ledger</div>}
    </div>
  );
}
