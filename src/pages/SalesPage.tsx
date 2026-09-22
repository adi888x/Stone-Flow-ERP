import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStoreContext } from '../App';
import { Plus, Search, Printer, Eye, X, MoreVertical } from 'lucide-react';
import type { PaperSize } from '../types';

function formatCurrency(n: number) { return '₹' + n.toLocaleString('en-IN'); }

export function SalesPage() {
  const store = useStoreContext();
  const [showForm, setShowForm] = useState(false);

  // Auto-open form if coming from dashboard quick action
  useEffect(() => {
    const shouldOpen = sessionStorage.getItem('openSaleForm');
    if (shouldOpen === 'true') {
      setShowForm(true);
      sessionStorage.removeItem('openSaleForm');
    }
  }, []);
  const [showPreview, setShowPreview] = useState(false);
  const [previewSale, setPreviewSale] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [paperSize, setPaperSize] = useState<PaperSize>('80mm');
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

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [rate, setRate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getDateRange = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    switch (dateFilter) {
      case 'today':
        return { start: todayStr, end: todayStr };
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        return { start: yesterdayStr, end: yesterdayStr };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - 7);
        return { start: weekStart.toISOString().split('T')[0], end: todayStr };
      case 'month':
        const monthStart = new Date(today);
        monthStart.setMonth(monthStart.getMonth() - 1);
        return { start: monthStart.toISOString().split('T')[0], end: todayStr };
      default:
        return { start: todayStr, end: todayStr };
    }
  };

  const filteredSales = useMemo(() => {
    const { start, end } = getDateRange();
    return store.sales.filter(s => {
      const customer = store.customers.find(c => c.id === s.customer_id);
      const matchSearch = !search || customer?.customer_name.toLowerCase().includes(search.toLowerCase()) || s.sale_slip_number.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || s.transaction_state === statusFilter;
      const matchDate = s.date >= start && s.date <= end;
      return matchSearch && matchStatus && matchDate;
    });
  }, [store.sales, store.customers, search, statusFilter, dateFilter]);

  const customerVehicles = useMemo(() => {
    if (!customerId) return [];
    return store.getCustomerVehicles(customerId);
  }, [customerId, store]);

  const totalAmount = useMemo(() => {
    const q = parseFloat(quantity) || 0;
    const r = parseFloat(rate) || 0;
    return Math.round(q * r * 100) / 100;
  }, [quantity, rate]);

  const handleCustomerChange = (cid: string) => {
    setCustomerId(cid);
    setVehicleId('');
    if (cid && materialId) {
      const r = store.getApplicableRate(cid, materialId);
      setRate(r.toString());
    }
  };

  const handleMaterialChange = (mid: string) => {
    setMaterialId(mid);
    if (customerId && mid) {
      const r = store.getApplicableRate(customerId, mid);
      setRate(r.toString());
    }
  };

  const handlePreview = () => {
    if (!validate()) return;
    const sale = buildSaleData();
    setPreviewSale(sale);
    setShowPreview(true);
  };

  const handleSaveAndPrint = () => {
    if (!validate()) return;
    if (store.isDemoMode) { setError('Demo mode is read-only.'); return; }
    const sale = buildSaleData();
    const saved = store.addSale(sale);
    setPreviewSale({ ...saved, ...sale });
    setShowForm(false);
    setShowPreview(true);
    setSuccess('Sale slip created successfully!');
    resetForm();
  };

  const validate = (): boolean => {
    setError('');
    if (!customerId) { setError('Customer is required.'); return false; }
    if (!vehicleId) { setError('Vehicle is required.'); return false; }
    if (!materialId) { setError('Material is required.'); return false; }
    if (!quantity || parseFloat(quantity) <= 0) { setError('Quantity must be greater than 0.'); return false; }
    if (!rate || parseFloat(rate) <= 0) { setError('Rate must be greater than 0.'); return false; }
    const vehicle = store.vehicles.find(v => v.id === vehicleId);
    if (vehicle && vehicle.customer_id !== customerId) {
      setError('Vehicle does not belong to this customer.'); return false;
    }
    return true;
  };

  const buildSaleData = () => ({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    customer_id: customerId,
    vehicle_id: vehicleId,
    driver_name: store.vehicles.find(v => v.id === vehicleId)?.driver_name || '',
    material_id: materialId,
    quantity_brass: parseFloat(quantity),
    rate: parseFloat(rate),
    total_amount: totalAmount,
    notes,
    created_by: store.currentUser?.full_name || '',
  });

  const resetForm = () => {
    setCustomerId(''); setVehicleId(''); setMaterialId(''); setQuantity(''); setRate(''); setNotes(''); setError('');
  };

  const handleCancelSale = (saleId: string) => {
    if (store.isDemoMode) return;
    if (confirm('Are you sure you want to cancel this order?')) {
      store.cancelSale(saleId, 'Cancelled by user');
      setOpenMenu(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Sales</h1>
          <p className="text-sm text-slate-500">Manage sale slips and outward transactions</p>
        </div>
        <button
          onClick={() => { setShowForm(true); resetForm(); }}
          disabled={store.isDemoMode}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> New Sale
        </button>
      </div>

      {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer or slip no..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
            <option value="today">Today's Sales</option>
            <option value="yesterday">Yesterday's Sales</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
            <option value="">All Status</option>
            <option value="FULFILLED">Fulfilled</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="erp-table text-base">
            <thead>
              <tr>
                <th>Date</th>
                <th>Slip No.</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Material</th>
                <th>Qty (BRASS)</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8 text-slate-500">No sales found</td></tr>
              ) : filteredSales.map(sale => {
                const customer = store.customers.find(c => c.id === sale.customer_id);
                const vehicle = store.vehicles.find(v => v.id === sale.vehicle_id);
                const material = store.materials.find(m => m.id === sale.material_id);
                return (
                  <tr key={sale.id}>
                    <td>{sale.date}</td>
                    <td className="font-mono text-sm">{sale.sale_slip_number}</td>
                    <td>{customer?.customer_name}</td>
                    <td className="font-mono text-sm">{vehicle?.vehicle_number}</td>
                    <td>{material?.material_name}</td>
                    <td>{sale.quantity_brass.toFixed(2)}</td>
                    <td>{formatCurrency(sale.rate)}</td>
                    <td className="font-medium">{formatCurrency(sale.total_amount)}</td>
                    <td>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        sale.transaction_state === 'FULFILLED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{sale.transaction_state}</span>
                    </td>
                    <td className="relative">
                      <div ref={openMenu === sale.id ? menuRef : null} className="relative">
                        <button 
                          onClick={() => setOpenMenu(openMenu === sale.id ? null : sale.id)}
                          className="p-1.5 hover:bg-slate-100 rounded"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenu === sale.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-[9999]">
                            <button 
                              onClick={() => { setPreviewSale(sale); setShowPreview(true); setOpenMenu(null); }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Eye size={14} /> Preview / Print
                            </button>
                            {sale.transaction_state === 'FULFILLED' && store.currentUser?.role === 'ADMIN' && (
                              <button 
                                onClick={() => handleCancelSale(sale.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <X size={14} /> Cancel Order
                              </button>
                            )}
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
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm text-slate-600">
          Showing {filteredSales.length} of {store.sales.length} sales | Total: {formatCurrency(filteredSales.reduce((s, x) => s + (x.transaction_state === 'FULFILLED' ? x.total_amount : 0), 0))}
        </div>
      </div>

      {/* New Sale Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">New Sale</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 rounded"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer *</label>
                <select value={customerId} onChange={e => handleCustomerChange(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="">Select customer</option>
                  {store.customers.filter(c => c.is_active).map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle *</label>
                {customerId ? (
                  customerVehicles.length > 0 ? (
                    <select value={vehicleId} onChange={e => setVehicleId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                      <option value="">Select vehicle</option>
                      {customerVehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_number} — {v.driver_name}</option>)}
                    </select>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                      No vehicles registered for this customer.
                    </div>
                  )
                ) : (
                  <div className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-400 bg-slate-50">Select a customer first</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Material *</label>
                <select value={materialId} onChange={e => handleMaterialChange(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="">Select material</option>
                  {store.materials.filter(m => m.is_active).map(m => <option key={m.id} value={m.id}>{m.material_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity (BRASS) *</label>
                  <input type="number" step="0.01" min="0" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="10.00" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rate / BRASS *</label>
                  <input type="number" step="0.01" min="0" value={rate} onChange={e => setRate(e.target.value)} placeholder="4500.00" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-800">Total Amount</span>
                  <span className="text-xl font-bold text-blue-800">{formatCurrency(totalAmount)}</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">{quantity || '0'} BRASS × ₹{rate || '0'} = {formatCurrency(totalAmount)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Optional notes..." />
              </div>
            </div>
            <div className="p-5 border-t border-slate-200 flex gap-3">
              <button onClick={handlePreview} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm border border-slate-300">
                PREVIEW
              </button>
              <button onClick={handleSaveAndPrint} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm">
                SAVE & PRINT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {showPreview && previewSale && (
        <ReceiptPreviewModal
          sale={previewSale}
          store={store}
          paperSize={paperSize}
          setPaperSize={setPaperSize}
          onClose={() => { setShowPreview(false); setPreviewSale(null); }}
        />
      )}
    </div>
  );
}

function ReceiptPreviewModal({ sale, store, paperSize, setPaperSize, onClose }: { sale: any; store: any; paperSize: PaperSize; setPaperSize: (s: PaperSize) => void; onClose: () => void }) {
  const customer = store.customers.find((c: any) => c.id === sale.customer_id);
  const vehicle = store.vehicles.find((v: any) => v.id === sale.vehicle_id);
  const material = store.materials.find((m: any) => m.id === sale.material_id);
  const settings = store.appSettings;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-in">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Sale Slip Preview</h2>
          <div className="flex items-center gap-2">
            <select value={paperSize} onChange={e => setPaperSize(e.target.value as PaperSize)} className="px-2 py-1 border border-slate-300 rounded text-xs">
              <option value="58mm">58mm</option>
              <option value="80mm">80mm</option>
            </select>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded"><X size={18} /></button>
          </div>
        </div>

        <div className="p-6 flex justify-center bg-slate-100">
          <div className={paperSize === '58mm' ? 'receipt-58mm bg-white shadow-lg' : 'receipt-80mm bg-white shadow-lg'}>
            <div className="text-center border-b border-dashed border-slate-400 pb-2 mb-2">
              <p className="font-bold text-sm">{settings.business_name}</p>
              <p className="text-xs">{settings.business_address}</p>
              <p className="text-xs">Ph: {settings.business_phone}</p>
              <p className="font-bold text-xs mt-1">SALE SLIP</p>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Slip No:</span>
                <span className="font-mono font-bold">{sale.sale_slip_number || 'SAL-2026-XXXXXX'}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{sale.date || new Date().toISOString().split('T')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{sale.time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-400 my-2"></div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-medium">{customer?.customer_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Vehicle:</span>
                <span className="font-mono">{vehicle?.vehicle_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Driver:</span>
                <span>{sale.driver_name || vehicle?.driver_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Material:</span>
                <span>{material?.material_name || 'N/A'}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-400 my-2"></div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span className="font-bold">{(sale.quantity_brass || 0).toFixed(2)} BRASS</span>
              </div>
              <div className="flex justify-between">
                <span>Rate:</span>
                <span>{formatCurrency(sale.rate || 0)} / BRASS</span>
              </div>
            </div>

            <div className="border-t-2 border-slate-800 my-2"></div>

            <div className="flex justify-between text-sm font-bold">
              <span>TOTAL:</span>
              <span>{formatCurrency(sale.total_amount || 0)}</span>
            </div>

            <div className="border-t border-dashed border-slate-400 my-2"></div>

            <div className="text-xs text-center space-y-0.5">
              <p>Created By: {sale.created_by || store.currentUser?.full_name}</p>
              <p className="mt-2">Thank you for your business!</p>
              <p className="text-[10px] text-slate-500">— BALAJI WASH SAND —</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 flex gap-3">
          <button onClick={() => window.print()} className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm">
            <Printer size={16} /> Print
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm border border-slate-300">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
