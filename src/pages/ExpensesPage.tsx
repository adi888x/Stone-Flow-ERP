import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStoreContext } from '../App';
import { Plus, Search, X, MoreVertical, Edit } from 'lucide-react';

function formatCurrency(n: number) { return '₹' + n.toLocaleString('en-IN'); }

const CATEGORIES = ['Plant Maintenance', 'Machine Repair', 'Pump Repair', 'Electrical', 'Welding', 'Spare Parts', 'Vehicle Repair', 'Labour', 'Fuel', 'Office', 'Miscellaneous'];
const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Cheque'] as const;

export function ExpensesPage() {
  const store = useStoreContext();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  // Auto-open form if coming from dashboard quick action
  React.useEffect(() => {
    const shouldOpen = sessionStorage.getItem('openExpenseForm');
    if (shouldOpen === 'true') {
      setShowForm(true);
      sessionStorage.removeItem('openExpenseForm');
    }
  }, []);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [workArea, setWorkArea] = useState('');
  const [vendor, setVendor] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [paymentMode, setPaymentMode] = useState<typeof PAYMENT_MODES[number]>('Cash');
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('bottom');
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

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
    return store.expenses.filter(e => {
      const matchSearch = !search || e.description_of_work.toLowerCase().includes(search.toLowerCase()) || e.vendor_or_person.toLowerCase().includes(search.toLowerCase()) || e.expense_number.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !categoryFilter || e.category === categoryFilter;
      return matchSearch && matchCategory && e.transaction_state === 'FULFILLED';
    });
  }, [store.expenses, search, categoryFilter]);

  const handleSave = () => {
    setError('');
    if (!category) { setError('Category is required.'); return; }
    if (!description) { setError('Description is required.'); return; }
    if (!amount || parseFloat(amount) <= 0) { setError('Amount must be greater than 0.'); return; }
    if (paymentMode !== 'Cash' && !accountId) { setError('Please select an account for this payment mode.'); return; }
    if (store.isDemoMode) { setError('Demo mode is read-only.'); return; }

    // Determine the account to use
    const selectedAccountId = paymentMode === 'Cash' 
      ? store.cashBankAccounts.find(acc => acc.account_type === 'CASH')?.id 
      : accountId;
    
    if (!selectedAccountId) { setError('Account not found.'); return; }

    // Create the expense
    const expense = store.addExpense({
      date: formDate,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      category, description_of_work: description, work_area: workArea,
      vendor_or_person: vendor, paid_by: paidBy || store.currentUser?.full_name || '',
      payment_mode: paymentMode, amount: parseFloat(amount), notes,
      created_by: store.currentUser?.full_name || '',
    });
    
    // Create Cash & Bank transaction
    store.addCashBankTransaction({
      account_id: selectedAccountId,
      date: formDate,
      transaction_type: 'Payment Out',
      party_type: 'other',
      party_name: vendor || 'Expense',
      mode: paymentMode,
      paid_amount: parseFloat(amount),
      received_amount: 0,
      balance_after: 0, // Will be calculated by the store
      notes: `${category}: ${description}${notes ? ' - ' + notes : ''}`,
      source_type: 'expense',
      source_id: expense.id,
      created_by: store.currentUser?.full_name || ''
    });
    
    setShowForm(false); setSuccess('Expense saved successfully!');
    setFormDate(new Date().toISOString().split('T')[0]);
    setCategory(''); setDescription(''); setWorkArea(''); setVendor(''); setPaidBy(''); setAccountId(''); setAmount(''); setNotes('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Plant Expenses</h1>
            <p className="text-sm text-slate-500">Track all plant and operational expenses</p>
          </div>
          <button onClick={() => setShowForm(true)} disabled={store.isDemoMode} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium">
            <Plus size={16} /> New Expense
          </button>
        </div>
        {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>}

        {/* Filters - Fixed */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table - Scrollable */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          <table className="erp-table text-base">
            <thead className="sticky top-0 bg-white z-10 shadow-sm"><tr><th>Date</th><th>Expense No.</th><th>Category</th><th>Description</th><th>Vendor/Person</th><th>Paid By</th><th>Mode</th><th>Amount</th><th></th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={9} className="text-center py-8 text-slate-500">No expenses found</td></tr> :
                filtered.map(e => (
                  <tr key={e.id}>
                    <td>{e.date}</td>
                    <td className="font-mono text-sm">{e.expense_number}</td>
                    <td><span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">{e.category}</span></td>
                    <td className="max-w-[200px] truncate">{e.description_of_work}</td>
                    <td>{e.vendor_or_person}</td>
                    <td>{e.paid_by}</td>
                    <td><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{e.payment_mode}</span></td>
                    <td className="font-medium">{formatCurrency(e.amount)}</td>
                    <td className="relative">
                      <div ref={openMenu === e.id ? menuRef : null} className="relative">
                        <button 
                          onClick={(event) => {
                            if (openMenu === e.id) {
                              setOpenMenu(null);
                            } else {
                              const button = event.currentTarget;
                              const rect = button.getBoundingClientRect();
                              const spaceBelow = window.innerHeight - rect.bottom;
                              setMenuPosition(spaceBelow < 200 ? 'top' : 'bottom');
                              setOpenMenu(e.id);
                            }
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenu === e.id && (
                          <div className={`absolute right-0 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-[9999] ${
                            menuPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
                          }`}>
                            <button 
                              onClick={() => {
                                // Edit expense logic
                                setOpenMenu(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Edit size={14} /> Edit Expense
                            </button>
                            {e.transaction_state === 'FULFILLED' && store.currentUser?.role === 'ADMIN' && (
                              <button 
                                onClick={() => {
                                  if (confirm('Are you sure you want to cancel this expense?')) {
                                    // Cancel expense logic
                                    setOpenMenu(null);
                                  }
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <X size={14} /> Cancel Expense
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm text-slate-600">
          Total: {formatCurrency(filtered.reduce((s, e) => s + e.amount, 0))} | {filtered.length} expenses
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">New Expense</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 rounded"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹) *</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description of Work *</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Conveyor belt repair" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Work Area</label>
                  <input type="text" value={workArea} onChange={e => setWorkArea(e.target.value)} placeholder="e.g., Plant Area A" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vendor/Person</label>
                  <input type="text" value={vendor} onChange={e => setVendor(e.target.value)} placeholder="Vendor name" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Paid By</label>
                  <input type="text" value={paidBy} onChange={e => setPaidBy(e.target.value)} placeholder="Name" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode *</label>
                  <select value={paymentMode} onChange={e => { setPaymentMode(e.target.value as any); setAccountId(''); }} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                    {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              {paymentMode !== 'Cash' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Account *</label>
                  <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                    <option value="">Select account</option>
                    {store.cashBankAccounts.filter(acc => acc.is_active && acc.account_type === 'BANK').map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.account_name} — {formatCurrency(acc.balance)}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
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
