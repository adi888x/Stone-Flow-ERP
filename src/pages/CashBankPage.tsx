import React, { useState, useMemo } from 'react';
import { useStoreContext } from '../App';
import { Plus, ArrowRightLeft, Download, Search, Filter, X, Edit, Trash2, Wallet, Building2 } from 'lucide-react';

function formatCurrency(n: number) { return '₹' + n.toLocaleString('en-IN'); }

export function CashBankPage() {
  const store = useStoreContext();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('acc1');
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showUpdateAccountModal, setShowUpdateAccountModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');

  // Add Money form state
  const [addMoneyForm, setAddMoneyForm] = useState({
    date: new Date().toISOString().split('T')[0],
    account_id: 'acc1',
    transaction_type: 'Add Money' as 'Add Money' | 'Reduce Money',
    amount: '',
    reason: '',
    reference_no: '',
    notes: ''
  });

  // Transfer form state
  const [transferForm, setTransferForm] = useState({
    date: new Date().toISOString().split('T')[0],
    from_account_id: 'acc1',
    to_account_id: 'acc2',
    amount: '',
    reference_no: '',
    notes: ''
  });

  // Add Account form state
  const [addAccountForm, setAddAccountForm] = useState({
    account_name: '',
    opening_balance: '',
    opening_balance_date: new Date().toISOString().split('T')[0],
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    branch_name: ''
  });

  // Computed values
  const totalBalance = store.getTotalBalance();
  const cashAccount = store.cashBankAccounts.find(acc => acc.account_type === 'CASH');
  const bankAccounts = store.cashBankAccounts.filter(acc => acc.account_type === 'BANK' && acc.is_active);
  const deletedAccounts = store.cashBankAccounts.filter(acc => !acc.is_active);
  
  const selectedAccount = store.cashBankAccounts.find(acc => acc.id === selectedAccountId);
  const accountTransactions = store.getAccountTransactions(selectedAccountId);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = accountTransactions;

    // Date filter
    const today = new Date();
    if (dateFilter === 'today') {
      filtered = filtered.filter(t => t.date === today.toISOString().split('T')[0]);
    } else if (dateFilter === 'last7') {
      const last7 = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(t => new Date(t.date) >= last7);
    } else if (dateFilter === 'last30') {
      const last30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(t => new Date(t.date) >= last30);
    } else if (dateFilter === 'thisMonth') {
      filtered = filtered.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      });
    } else if (dateFilter === 'lastMonth') {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      filtered = filtered.filter(t => {
        const d = new Date(t.date);
        return d >= lastMonth && d < thisMonth;
      });
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter(t => t.transaction_type === typeFilter);
    }

    // Mode filter
    if (modeFilter) {
      filtered = filtered.filter(t => t.mode === modeFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.transaction_id.toLowerCase().includes(query) ||
        t.party_name?.toLowerCase().includes(query) ||
        t.transaction_type.toLowerCase().includes(query) ||
        t.reference_no?.toLowerCase().includes(query) ||
        t.mode.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [accountTransactions, dateFilter, typeFilter, modeFilter, searchQuery]);

  // Summary calculations
  const summary = useMemo(() => {
    const openingBalance = selectedAccount?.opening_balance || 0;
    const totalReceived = filteredTransactions.reduce((sum, t) => sum + t.received_amount, 0);
    const totalPaid = filteredTransactions.reduce((sum, t) => sum + t.paid_amount, 0);
    const closingBalance = openingBalance + totalReceived - totalPaid;
    return { openingBalance, totalReceived, totalPaid, closingBalance };
  }, [selectedAccount, filteredTransactions]);

  // Handlers
  const handleAddMoney = () => {
    if (!addMoneyForm.account_id || !addMoneyForm.amount || parseFloat(addMoneyForm.amount) <= 0) {
      alert('Please fill all required fields');
      return;
    }

    const amount = parseFloat(addMoneyForm.amount);
    const isAdd = addMoneyForm.transaction_type === 'Add Money';

    store.addCashBankTransaction({
      account_id: addMoneyForm.account_id,
      date: addMoneyForm.date,
      transaction_type: addMoneyForm.transaction_type,
      mode: 'Adjustment',
      paid_amount: isAdd ? 0 : amount,
      received_amount: isAdd ? amount : 0,
      balance_after: 0, // Will be calculated
      reference_no: addMoneyForm.reference_no,
      notes: addMoneyForm.reason || addMoneyForm.notes,
      source_type: 'manual',
      created_by: store.currentUser?.full_name || 'Unknown'
    });

    setShowAddMoneyModal(false);
    setAddMoneyForm({
      date: new Date().toISOString().split('T')[0],
      account_id: 'acc1',
      transaction_type: 'Add Money',
      amount: '',
      reason: '',
      reference_no: '',
      notes: ''
    });
  };

  const handleTransfer = () => {
    if (!transferForm.from_account_id || !transferForm.to_account_id || !transferForm.amount || parseFloat(transferForm.amount) <= 0) {
      alert('Please fill all required fields');
      return;
    }

    if (transferForm.from_account_id === transferForm.to_account_id) {
      alert('Source and destination accounts must be different');
      return;
    }

    const amount = parseFloat(transferForm.amount);

    store.addTransfer({
      from_account_id: transferForm.from_account_id,
      to_account_id: transferForm.to_account_id,
      amount,
      date: transferForm.date,
      reference_no: transferForm.reference_no,
      notes: transferForm.notes,
      created_by: store.currentUser?.full_name || 'Unknown'
    });

    setShowTransferModal(false);
    setTransferForm({
      date: new Date().toISOString().split('T')[0],
      from_account_id: 'acc1',
      to_account_id: 'acc2',
      amount: '',
      reference_no: '',
      notes: ''
    });
  };

  const handleAddAccount = () => {
    if (!addAccountForm.account_name) {
      alert('Account name is required');
      return;
    }

    store.addCashBankAccount({
      account_name: addAccountForm.account_name,
      account_type: 'BANK',
      balance: parseFloat(addAccountForm.opening_balance) || 0,
      opening_balance: parseFloat(addAccountForm.opening_balance) || 0,
      opening_balance_date: addAccountForm.opening_balance_date,
      account_holder_name: addAccountForm.account_holder_name,
      account_number: addAccountForm.account_number,
      ifsc_code: addAccountForm.ifsc_code,
      bank_name: addAccountForm.bank_name,
      branch_name: addAccountForm.branch_name,
      is_active: true
    });

    setShowAddAccountModal(false);
    setAddAccountForm({
      account_name: '',
      opening_balance: '',
      opening_balance_date: new Date().toISOString().split('T')[0],
      account_holder_name: '',
      account_number: '',
      ifsc_code: '',
      bank_name: '',
      branch_name: ''
    });
  };

  const handleDownloadStatement = () => {
    alert('Download statement feature - to be implemented');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Cash & Bank</h1>
            <p className="text-sm text-slate-500">Manage cash and bank accounts</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowAddMoneyModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
              <Plus size={16} /> Add/Reduce Money
            </button>
            <button onClick={() => setShowTransferModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
              <ArrowRightLeft size={16} /> Transfer Money
            </button>
            <button onClick={() => setShowAddAccountModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">
              <Plus size={16} /> Add New Account
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Two Panel Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Left Panel - Account List */}
        <div className="lg:w-80 flex-shrink-0 space-y-4 overflow-y-auto">
          {/* Total Balance */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-5 shadow-lg">
            <p className="text-sm opacity-90">Total Balance</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
          </div>

          {/* Cash Account */}
          {cashAccount && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Cash</h3>
              <button
                onClick={() => setSelectedAccountId(cashAccount.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedAccountId === cashAccount.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Wallet size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{cashAccount.account_name}</p>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(cashAccount.balance)}</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Bank Accounts */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Bank Accounts</h3>
            <div className="space-y-2">
              {bankAccounts.map(account => (
                <button
                  key={account.id}
                  onClick={() => setSelectedAccountId(account.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedAccountId === account.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{account.account_name}</p>
                      <p className="text-xs text-slate-500">{account.bank_name}</p>
                      <p className="text-lg font-bold text-slate-900">{formatCurrency(account.balance)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Deleted Accounts */}
          {deletedAccounts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Deleted Accounts</h3>
              <div className="space-y-2">
                {deletedAccounts.map(account => (
                  <div key={account.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 opacity-60">
                    <p className="font-medium text-slate-600">{account.account_name}</p>
                    <p className="text-sm text-slate-500">{formatCurrency(account.balance)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Account Details & Transactions */}
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 overflow-hidden">
          {selectedAccount ? (
            <>
              {/* Account Info */}
              <div className="p-5 border-b border-slate-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{selectedAccount.account_name}</h2>
                    {selectedAccount.account_type === 'BANK' && (
                      <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        {selectedAccount.account_holder_name && (
                          <div><span className="text-slate-500">Holder:</span> <span className="font-medium">{selectedAccount.account_holder_name}</span></div>
                        )}
                        {selectedAccount.account_number && (
                          <div><span className="text-slate-500">A/C No:</span> <span className="font-medium font-mono">{selectedAccount.account_number}</span></div>
                        )}
                        {selectedAccount.ifsc_code && (
                          <div><span className="text-slate-500">IFSC:</span> <span className="font-medium font-mono">{selectedAccount.ifsc_code}</span></div>
                        )}
                        {selectedAccount.bank_name && (
                          <div><span className="text-slate-500">Bank:</span> <span className="font-medium">{selectedAccount.bank_name}</span></div>
                        )}
                        {selectedAccount.branch_name && (
                          <div><span className="text-slate-500">Branch:</span> <span className="font-medium">{selectedAccount.branch_name}</span></div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Current Balance</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(selectedAccount.balance)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowUpdateAccountModal(true)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm">
                    <Edit size={14} /> Update Details
                  </button>
                  <button onClick={handleDownloadStatement} className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm">
                    <Download size={14} /> Download Statement
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="p-4 border-b border-slate-200 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="last7">Last 7 Days</option>
                    <option value="last30">Last 30 Days</option>
                    <option value="thisMonth">This Month</option>
                    <option value="lastMonth">Last Month</option>
                  </select>
                  <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
                    <option value="">All Types</option>
                    <option value="Payment In">Payment In</option>
                    <option value="Payment Out">Payment Out</option>
                    <option value="Sale">Sale</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Add Money">Add Money</option>
                    <option value="Reduce Money">Reduce Money</option>
                    <option value="Transfer In">Transfer In</option>
                    <option value="Transfer Out">Transfer Out</option>
                  </select>
                  <select value={modeFilter} onChange={e => setModeFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
                    <option value="">All Modes</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Adjustment">Adjustment</option>
                  </select>
                  <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="flex-1 overflow-auto">
                <table className="erp-table text-base">
                  <thead className="sticky top-0 bg-white z-10 shadow-sm">
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>TXN ID</th>
                      <th>Party</th>
                      <th>Mode</th>
                      <th>Paid</th>
                      <th>Received</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-slate-500">No transactions found</td>
                      </tr>
                    ) : (
                      filteredTransactions.map(txn => (
                        <tr key={txn.id}>
                          <td>{txn.date}</td>
                          <td>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              txn.transaction_type.includes('In') || txn.transaction_type === 'Add Money'
                                ? 'bg-green-100 text-green-700'
                                : txn.transaction_type.includes('Out') || txn.transaction_type === 'Reduce Money'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {txn.transaction_type}
                            </span>
                          </td>
                          <td className="font-mono text-sm">{txn.transaction_id}</td>
                          <td>{txn.party_name || '—'}</td>
                          <td>{txn.mode}</td>
                          <td className={txn.paid_amount > 0 ? 'text-red-600 font-medium' : ''}>
                            {txn.paid_amount > 0 ? formatCurrency(txn.paid_amount) : '—'}
                          </td>
                          <td className={txn.received_amount > 0 ? 'text-green-600 font-medium' : ''}>
                            {txn.received_amount > 0 ? formatCurrency(txn.received_amount) : '—'}
                          </td>
                          <td className="font-medium">{formatCurrency(txn.balance_after)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer Summary */}
              <div className="p-4 border-t border-slate-200 bg-slate-50">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Opening Balance</p>
                    <p className="font-bold text-slate-900">{formatCurrency(summary.openingBalance)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Total Received</p>
                    <p className="font-bold text-green-600">{formatCurrency(summary.totalReceived)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Total Paid</p>
                    <p className="font-bold text-red-600">{formatCurrency(summary.totalPaid)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Closing Balance</p>
                    <p className="font-bold text-slate-900">{formatCurrency(summary.closingBalance)}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Select an account to view details
            </div>
          )}
        </div>
      </div>

      {/* Add/Reduce Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Add / Reduce Money</h2>
              <button onClick={() => setShowAddMoneyModal(false)} className="p-1.5 hover:bg-slate-100 rounded"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                <input type="date" value={addMoneyForm.date} onChange={e => setAddMoneyForm({ ...addMoneyForm, date: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account *</label>
                <select value={addMoneyForm.account_id} onChange={e => setAddMoneyForm({ ...addMoneyForm, account_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                  {store.cashBankAccounts.filter(acc => acc.is_active).map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.account_name} - {formatCurrency(acc.balance)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Type *</label>
                <select value={addMoneyForm.transaction_type} onChange={e => setAddMoneyForm({ ...addMoneyForm, transaction_type: e.target.value as any })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="Add Money">Add Money</option>
                  <option value="Reduce Money">Reduce Money</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹) *</label>
                <input type="number" value={addMoneyForm.amount} onChange={e => setAddMoneyForm({ ...addMoneyForm, amount: e.target.value })} placeholder="0.00" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason / Description</label>
                <input type="text" value={addMoneyForm.reason} onChange={e => setAddMoneyForm({ ...addMoneyForm, reason: e.target.value })} placeholder="e.g., Opening correction, Cash deposited" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reference No.</label>
                <input type="text" value={addMoneyForm.reference_no} onChange={e => setAddMoneyForm({ ...addMoneyForm, reference_no: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={addMoneyForm.notes} onChange={e => setAddMoneyForm({ ...addMoneyForm, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-200 flex gap-3">
              <button onClick={handleAddMoney} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm">SAVE</button>
              <button onClick={() => setShowAddMoneyModal(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm border border-slate-300">CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Money Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Transfer Money</h2>
              <button onClick={() => setShowTransferModal(false)} className="p-1.5 hover:bg-slate-100 rounded"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                <input type="date" value={transferForm.date} onChange={e => setTransferForm({ ...transferForm, date: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">From Account *</label>
                <select value={transferForm.from_account_id} onChange={e => setTransferForm({ ...transferForm, from_account_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                  {store.cashBankAccounts.filter(acc => acc.is_active).map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.account_name} - {formatCurrency(acc.balance)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">To Account *</label>
                <select value={transferForm.to_account_id} onChange={e => setTransferForm({ ...transferForm, to_account_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                  {store.cashBankAccounts.filter(acc => acc.is_active).map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.account_name} - {formatCurrency(acc.balance)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹) *</label>
                <input type="number" value={transferForm.amount} onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })} placeholder="0.00" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reference No.</label>
                <input type="text" value={transferForm.reference_no} onChange={e => setTransferForm({ ...transferForm, reference_no: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={transferForm.notes} onChange={e => setTransferForm({ ...transferForm, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-200 flex gap-3">
              <button onClick={handleTransfer} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm">TRANSFER</button>
              <button onClick={() => setShowTransferModal(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm border border-slate-300">CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Account Modal */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Add Bank Account</h2>
              <button onClick={() => setShowAddAccountModal(false)} className="p-1.5 hover:bg-slate-100 rounded"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Name *</label>
                <input type="text" value={addAccountForm.account_name} onChange={e => setAddAccountForm({ ...addAccountForm, account_name: e.target.value })} placeholder="e.g., HDFC Current Account" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Opening Balance (₹)</label>
                <input type="number" value={addAccountForm.opening_balance} onChange={e => setAddAccountForm({ ...addAccountForm, opening_balance: e.target.value })} placeholder="0.00" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">As of Date *</label>
                <input type="date" value={addAccountForm.opening_balance_date} onChange={e => setAddAccountForm({ ...addAccountForm, opening_balance_date: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Holder's Name</label>
                <input type="text" value={addAccountForm.account_holder_name} onChange={e => setAddAccountForm({ ...addAccountForm, account_holder_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
                <input type="text" value={addAccountForm.account_number} onChange={e => setAddAccountForm({ ...addAccountForm, account_number: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">IFSC Code</label>
                <input type="text" value={addAccountForm.ifsc_code} onChange={e => setAddAccountForm({ ...addAccountForm, ifsc_code: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
                <input type="text" value={addAccountForm.bank_name} onChange={e => setAddAccountForm({ ...addAccountForm, bank_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch Name</label>
                <input type="text" value={addAccountForm.branch_name} onChange={e => setAddAccountForm({ ...addAccountForm, branch_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-200 flex gap-3">
              <button onClick={handleAddAccount} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm">SUBMIT</button>
              <button onClick={() => setShowAddAccountModal(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm border border-slate-300">CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Account Modal */}
      {showUpdateAccountModal && selectedAccount && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Update Bank Details</h2>
              <button onClick={() => setShowUpdateAccountModal(false)} className="p-1.5 hover:bg-slate-100 rounded"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
                <input type="text" defaultValue={selectedAccount.account_name} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Holder's Name</label>
                <input type="text" defaultValue={selectedAccount.account_holder_name} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
                <input type="text" defaultValue={selectedAccount.account_number} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">IFSC Code</label>
                <input type="text" defaultValue={selectedAccount.ifsc_code} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
                <input type="text" defaultValue={selectedAccount.bank_name} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch Name</label>
                <input type="text" defaultValue={selectedAccount.branch_name} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-200 flex gap-3">
              <button onClick={() => setShowUpdateAccountModal(false)} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm">SAVE</button>
              <button onClick={() => setShowUpdateAccountModal(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm border border-slate-300">CLOSE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
