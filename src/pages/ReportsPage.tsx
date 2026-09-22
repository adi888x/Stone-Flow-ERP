import React, { useState, useMemo } from 'react';
import { useStoreContext } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileDown } from 'lucide-react';
function formatCurrency(n: number) { return '₹' + n.toLocaleString('en-IN'); }
const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

export function ReportsPage() {
  const store = useStoreContext();
  const [reportType, setReportType] = useState('sales-daily');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const reportData = useMemo((): any[] => {
    const activeSales = store.sales.filter(s => s.transaction_state === 'FULFILLED' && (!dateFrom || s.date >= dateFrom) && (!dateTo || s.date <= dateTo));
    const activePurchases = store.purchases.filter(p => p.transaction_state === 'FULFILLED' && (!dateFrom || p.date >= dateFrom) && (!dateTo || p.date <= dateTo));
    const activeExpenses = store.expenses.filter(e => e.transaction_state === 'FULFILLED' && (!dateFrom || e.date >= dateFrom) && (!dateTo || e.date <= dateTo));

    switch (reportType) {
      case 'sales-daily': {
        const map: Record<string, { count: number; qty: number; amount: number }> = {};
        activeSales.forEach(s => { if (!map[s.date]) map[s.date] = { count: 0, qty: 0, amount: 0 }; map[s.date].count++; map[s.date].qty += s.quantity_brass; map[s.date].amount += s.total_amount; });
        return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([date, d]) => ({ label: date, ...d }));
      }
      case 'sales-customer': {
        const map: Record<string, { count: number; qty: number; amount: number }> = {};
        activeSales.forEach(s => { const c = store.customers.find(c => c.id === s.customer_id)?.customer_name || 'Unknown'; if (!map[c]) map[c] = { count: 0, qty: 0, amount: 0 }; map[c].count++; map[c].qty += s.quantity_brass; map[c].amount += s.total_amount; });
        return Object.entries(map).map(([label, d]) => ({ label, ...d }));
      }
      case 'sales-material': {
        const map: Record<string, { count: number; qty: number; amount: number }> = {};
        activeSales.forEach(s => { const m = store.materials.find(m => m.id === s.material_id)?.material_name || 'Unknown'; if (!map[m]) map[m] = { count: 0, qty: 0, amount: 0 }; map[m].count++; map[m].qty += s.quantity_brass; map[m].amount += s.total_amount; });
        return Object.entries(map).map(([label, d]) => ({ label, ...d }));
      }
      case 'purchase-daily': {
        const map: Record<string, { count: number; qty: number; amount: number }> = {};
        activePurchases.forEach(p => { if (!map[p.date]) map[p.date] = { count: 0, qty: 0, amount: 0 }; map[p.date].count++; map[p.date].qty += p.quantity_brass; map[p.date].amount += p.total_amount; });
        return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([date, d]) => ({ label: date, ...d }));
      }
      case 'purchase-supplier': {
        const map: Record<string, { count: number; qty: number; amount: number }> = {};
        activePurchases.forEach(p => { const s = store.suppliers.find(s => s.id === p.supplier_id)?.supplier_name || 'Unknown'; if (!map[s]) map[s] = { count: 0, qty: 0, amount: 0 }; map[s].count++; map[s].qty += p.quantity_brass; map[s].amount += p.total_amount; });
        return Object.entries(map).map(([label, d]) => ({ label, ...d }));
      }
      case 'expense-category': {
        const map: Record<string, { count: number; amount: number }> = {};
        activeExpenses.forEach(e => { if (!map[e.category]) map[e.category] = { count: 0, amount: 0 }; map[e.category].count++; map[e.category].amount += e.amount; });
        return Object.entries(map).map(([label, d]) => ({ label, ...d }));
      }
      case 'weekly-customer': {
        const map: Record<string, { slips: number; qty: number; sales: number; payments: number; outstanding: number }> = {};
        store.customers.forEach(c => {
          const custSales = activeSales.filter(s => s.customer_id === c.id);
          const custPayments = store.customerPayments.filter(p => p.customer_id === c.id && (!dateFrom || p.date >= dateFrom) && (!dateTo || p.date <= dateTo));
          if (custSales.length > 0 || custPayments.length > 0) {
            map[c.customer_name] = { slips: custSales.length, qty: custSales.reduce((s, x) => s + x.quantity_brass, 0), sales: custSales.reduce((s, x) => s + x.total_amount, 0), payments: custPayments.reduce((s, x) => s + x.amount, 0), outstanding: store.getCustomerOutstanding(c.id) };
          }
        });
        return Object.entries(map).map(([label, d]) => ({ label, ...d }));
      }
      default: return [];
    }
  }, [reportType, store, dateFrom, dateTo]);

  const reportTypes = [
    { value: 'sales-daily', label: 'Daily Sales' },
    { value: 'sales-customer', label: 'Customer-wise Sales' },
    { value: 'sales-material', label: 'Material-wise Sales' },
    { value: 'purchase-daily', label: 'Daily Purchases' },
    { value: 'purchase-supplier', label: 'Supplier-wise Purchases' },
    { value: 'expense-category', label: 'Expense by Category' },
    { value: 'weekly-customer', label: 'Weekly Customer Report' },
  ];

  const isWeeklyCustomer = reportType === 'weekly-customer';

  return (
    <div className="flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 space-y-4">
        <div><h1 className="text-xl font-bold text-slate-800">Reports</h1><p className="text-sm text-slate-500">Business reports with export options</p></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
          <select value={reportType} onChange={e => setReportType(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm min-w-[200px]">
            {reportTypes.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <button className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"><FileDown size={14} /> Excel</button>
          <button className="inline-flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"><FileDown size={14} /> PDF</button>
        </div>
      </div>

      {/* Chart */}
      {reportData.length > 0 && !isWeeklyCustomer && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">{reportTypes.find(r => r.value === reportType)?.label}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => reportType.includes('expense') ? `₹${(v/1000).toFixed(0)}k` : `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table - Scrollable */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          <table className="erp-table">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr>
                <th>{isWeeklyCustomer ? 'Customer' : 'Label'}</th>
                {isWeeklyCustomer ? (
                  <><th>No. of Slips</th><th>Total Qty (BRASS)</th><th>Total Sales</th><th>Payments Received</th><th>Outstanding</th></>
                ) : reportType.includes('expense') ? (
                  <><th>Count</th><th>Amount</th></>
                ) : (
                  <><th>No. of Slips</th><th>Total Qty (BRASS)</th><th>Total Amount</th></>
                )}
              </tr>
            </thead>
            <tbody>
              {reportData.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-slate-500">No data for selected filters</td></tr> :
                reportData.map((row, i) => (
                  <tr key={i}>
                    <td className="font-medium">{row.label}</td>
                    {isWeeklyCustomer ? (
                      <><td>{row.slips}</td><td>{row.qty?.toFixed(2)}</td><td>{formatCurrency(row.sales)}</td><td className="text-green-600">{formatCurrency(row.payments)}</td><td className="text-red-600 font-medium">{formatCurrency(row.outstanding)}</td></>
                    ) : reportType.includes('expense') ? (
                      <><td>{row.count}</td><td className="font-medium">{formatCurrency(row.amount)}</td></>
                    ) : (
                      <><td>{row.count}</td><td>{row.qty?.toFixed(2)}</td><td className="font-medium">{formatCurrency(row.amount)}</td></>
                    )}
                  </tr>
                ))}
            </tbody>
            {reportData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 font-bold">
                  <td>Total</td>
                  {isWeeklyCustomer ? (
                    <><td>{reportData.reduce((s, r) => s + (r.slips || 0), 0)}</td><td>{reportData.reduce((s, r) => s + (r.qty || 0), 0).toFixed(2)}</td><td>{formatCurrency(reportData.reduce((s, r) => s + (r.sales || 0), 0))}</td><td>{formatCurrency(reportData.reduce((s, r) => s + (r.payments || 0), 0))}</td><td>{formatCurrency(reportData.reduce((s, r) => s + (r.outstanding || 0), 0))}</td></>
                  ) : reportType.includes('expense') ? (
                    <><td>{reportData.reduce((s, r) => s + (r.count || 0), 0)}</td><td>{formatCurrency(reportData.reduce((s, r) => s + (r.amount || 0), 0))}</td></>
                  ) : (
                    <><td>{reportData.reduce((s, r) => s + (r.count || 0), 0)}</td><td>{reportData.reduce((s, r) => s + (r.qty || 0), 0).toFixed(2)}</td><td>{formatCurrency(reportData.reduce((s, r) => s + (r.amount || 0), 0))}</td></>
                  )}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
