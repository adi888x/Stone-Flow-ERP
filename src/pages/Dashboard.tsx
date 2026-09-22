import React, { useState, useMemo } from 'react';
import { useStoreContext } from '../App';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, IndianRupee, Package, ShoppingCart, CreditCard, Truck, Plus } from 'lucide-react';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

function formatCurrency(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

type Page = 'dashboard' | 'sales' | 'purchases' | 'expenses' | 'customers' | 'suppliers' |
  'vehicles' | 'materials' | 'rates' | 'customer-payments' | 'supplier-payments' |
  'customer-ledger' | 'supplier-ledger' | 'reports' | 'users' | 'audit-logs' | 'settings';

interface DashboardProps {
  setCurrentPage: (page: Page) => void;
}

export function Dashboard({ setCurrentPage }: DashboardProps) {
  const store = useStoreContext();
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('today');

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  const startDate = dateRange === 'today' ? today : dateRange === 'week' ? weekAgo : monthAgo;

  const stats = useMemo(() => {
    const activeSales = store.sales.filter(s => s.transaction_state === 'FULFILLED' && s.date >= startDate);
    const activePurchases = store.purchases.filter(p => p.transaction_state === 'FULFILLED' && p.date >= startDate);
    const activeExpenses = store.expenses.filter(e => e.transaction_state === 'FULFILLED' && e.date >= startDate);
    const custPayments = store.customerPayments.filter(p => p.date >= startDate);
    const supPayments = store.supplierPayments.filter(p => p.date >= startDate);

    const totalSales = activeSales.reduce((s, x) => s + x.total_amount, 0);
    const totalSalesQty = activeSales.reduce((s, x) => s + x.quantity_brass, 0);
    const totalPurchases = activePurchases.reduce((s, x) => s + x.total_amount, 0);
    const totalPurchasesQty = activePurchases.reduce((s, x) => s + x.quantity_brass, 0);
    const totalExpenses = activeExpenses.reduce((s, x) => s + x.amount, 0);
    const totalCustPayments = custPayments.reduce((s, x) => s + x.amount, 0);
    const totalSupPayments = supPayments.reduce((s, x) => s + x.amount, 0);

    const totalCustomerOutstanding = store.customers.reduce((sum, c) => sum + store.getCustomerOutstanding(c.id), 0);
    const totalSupplierOutstanding = store.suppliers.reduce((sum, s) => sum + store.getSupplierOutstanding(s.id), 0);

    return { totalSales, totalSalesQty, totalPurchases, totalPurchasesQty, totalExpenses, totalCustPayments, totalSupPayments, totalCustomerOutstanding, totalSupplierOutstanding, activeSales, activePurchases };
  }, [store, startDate]);

  // Chart data
  const salesByCustomer = useMemo(() => {
    const map: Record<string, number> = {};
    stats.activeSales.forEach(s => {
      const c = store.customers.find(c => c.id === s.customer_id);
      const name = c?.customer_name || 'Unknown';
      map[name] = (map[name] || 0) + s.total_amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [stats.activeSales, store.customers]);

  const salesByMaterial = useMemo(() => {
    const map: Record<string, number> = {};
    stats.activeSales.forEach(s => {
      const m = store.materials.find(m => m.id === s.material_id);
      const name = m?.material_name || 'Unknown';
      map[name] = (map[name] || 0) + s.quantity_brass;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [stats.activeSales, store.materials]);

  const salesTrend = useMemo(() => {
    const map: Record<string, number> = {};
    stats.activeSales.forEach(s => {
      map[s.date] = (map[s.date] || 0) + s.total_amount;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([date, amount]) => ({ date: date.slice(5), amount }));
  }, [stats.activeSales]);

  const purchaseTrend = useMemo(() => {
    const map: Record<string, number> = {};
    stats.activePurchases.forEach(p => {
      map[p.date] = (map[p.date] || 0) + p.total_amount;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([date, amount]) => ({ date: date.slice(5), amount }));
  }, [stats.activePurchases]);

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    store.expenses.filter(e => e.transaction_state === 'FULFILLED' && e.date >= startDate).forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [store.expenses, startDate]);

  const cards = [
    { label: "Today's Sales", value: formatCurrency(stats.totalSales), icon: <ShoppingCart size={20} />, color: 'bg-blue-500', change: '+12%' },
    { label: 'Sales Qty (BRASS)', value: stats.totalSalesQty.toFixed(2), icon: <Package size={20} />, color: 'bg-indigo-500', change: '+8%' },
    { label: "Today's Purchases", value: formatCurrency(stats.totalPurchases), icon: <Truck size={20} />, color: 'bg-emerald-500', change: '+5%' },
    { label: 'Purchase Qty (BRASS)', value: stats.totalPurchasesQty.toFixed(2), icon: <Package size={20} />, color: 'bg-teal-500', change: '+3%' },
    { label: "Today's Expenses", value: formatCurrency(stats.totalExpenses), icon: <IndianRupee size={20} />, color: 'bg-amber-500', change: '-2%' },
    { label: 'Customer Payments', value: formatCurrency(stats.totalCustPayments), icon: <CreditCard size={20} />, color: 'bg-green-500', change: '+15%' },
    { label: 'Customer Outstanding', value: formatCurrency(stats.totalCustomerOutstanding), icon: <TrendingUp size={20} />, color: 'bg-red-500', change: '' },
    { label: 'Supplier Outstanding', value: formatCurrency(stats.totalSupplierOutstanding), icon: <TrendingDown size={20} />, color: 'bg-orange-500', change: '' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of business operations</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => {
            sessionStorage.setItem('openSaleForm', 'true');
            setCurrentPage('sales');
          }}
          className="relative overflow-hidden flex items-center gap-5 p-6 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-150 transition-transform duration-500" />
          
          <div className="relative p-4 bg-white/20 backdrop-blur-sm rounded-xl group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 shadow-inner">
            <Plus size={32} strokeWidth={2.5} />
          </div>
          <div className="relative text-left flex-1">
            <p className="text-xl font-bold tracking-tight">New Sale</p>
            <p className="text-sm text-blue-100 mt-0.5">Create a new sale entry</p>
          </div>
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </button>
        
        <button
          onClick={() => {
            sessionStorage.setItem('openPurchaseForm', 'true');
            setCurrentPage('purchases');
          }}
          className="relative overflow-hidden flex items-center gap-5 p-6 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-150 transition-transform duration-500" />
          
          <div className="relative p-4 bg-white/20 backdrop-blur-sm rounded-xl group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 shadow-inner">
            <Plus size={32} strokeWidth={2.5} />
          </div>
          <div className="relative text-left flex-1">
            <p className="text-xl font-bold tracking-tight">New Purchase</p>
            <p className="text-sm text-emerald-100 mt-0.5">Create a new purchase entry</p>
          </div>
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="flex justify-start gap-2">
        {(['today', 'week', 'month'] as const).map(r => (
          <button
            key={r}
            onClick={() => setDateRange(r)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              dateRange === r ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {r === 'today' ? 'Today' : r === 'week' ? 'This Week' : 'This Month'}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`${card.color} p-2 rounded-lg text-white`}>{card.icon}</div>
              {card.change && (
                <span className={`text-xs font-medium ${card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {card.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            <p className="text-sm text-slate-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Purchase Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={purchaseTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="amount" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Sales by Customer</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={salesByCustomer} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                {salesByCustomer.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Sales by Material (BRASS)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={salesByMaterial} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                {salesByMaterial.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `${v.toFixed(2)} BRASS`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Expense by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={expenseByCategory} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                {expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Recent Sales</h3>
        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Slip No.</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Qty (BRASS)</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {store.sales.slice(0, 8).map(sale => {
                const customer = store.customers.find(c => c.id === sale.customer_id);
                const vehicle = store.vehicles.find(v => v.id === sale.vehicle_id);
                return (
                  <tr key={sale.id}>
                    <td>{sale.date}</td>
                    <td className="font-mono text-xs">{sale.sale_slip_number}</td>
                    <td>{customer?.customer_name}</td>
                    <td className="font-mono text-xs">{vehicle?.vehicle_number}</td>
                    <td>{sale.quantity_brass.toFixed(2)}</td>
                    <td className="font-medium">{formatCurrency(sale.total_amount)}</td>
                    <td>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        sale.transaction_state === 'FULFILLED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {sale.transaction_state}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
