import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStoreContext } from '../App';
import { Plus, Search, Eye, X, Printer, MoreVertical } from 'lucide-react';
import { SearchableSelect } from '../components/SearchableSelect';
import { FilterBar } from '../components/FilterBar';
import { ReportExportService } from '../services/ReportExportService';
import { PrintReceipt } from '../components/PrintReceipt';

function formatCurrency(n: number) { return '₹' + n.toLocaleString('en-IN'); }

export function PurchasesPage() {
  const store = useStoreContext();
  const [showForm, setShowForm] = useState(false);

  // Auto-open form if coming from dashboard quick action
  useEffect(() => {
    const shouldOpen = sessionStorage.getItem('openPurchaseForm');
    if (shouldOpen === 'true') {
      setShowForm(true);
      sessionStorage.removeItem('openPurchaseForm');
    }
  }, []);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPurchase, setPreviewPurchase] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateRange, setDateRange] = useState('today');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplierId, setSupplierId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [rate, setRate] = useState('');
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

  const handleReset = () => {
    setSearch('');
    setFromDate(new Date().toISOString().split('T')[0]);
    setToDate(new Date().toISOString().split('T')[0]);
    setDateRange('today');
    setStatusFilter('all');
  };

  const handleExportExcel = async () => {
    const exportData = {
      reportType: 'purchases' as const,
      reportTitle: 'Purchase Report',
      dateRange: { from: fromDate, to: toDate },
      status: statusFilter === 'all' ? 'All' : statusFilter,
      generatedBy: store.currentUser?.full_name || 'Unknown',
      data: filteredPurchases.map(purchase => {
        const supplier = store.suppliers.find(s => s.id === purchase.supplier_id);
        const vehicle = store.vehicles.find(v => v.id === purchase.vehicle_id);
        const material = store.materials.find(m => m.id === purchase.material_id);
        return {
          date: purchase.date,
          slip_number: purchase.purchase_slip_number,
          party_name: supplier?.supplier_name || '',
          vehicle_number: vehicle?.vehicle_number || '',
          material_name: material?.material_name || '',
          quantity_brass: purchase.quantity_brass,
          rate: purchase.rate,
          total_amount: purchase.total_amount,
          transaction_state: purchase.transaction_state,
          created_by: purchase.created_by
        };
      }),
      totals: {
        quantity: filteredPurchases.reduce((sum, p) => sum + p.quantity_brass, 0),
        amount: filteredPurchases.reduce((sum, p) => sum + p.total_amount, 0)
      }
    };
    await ReportExportService.exportToExcel(exportData);
  };

  const handleExportPDF = () => {
    const exportData = {
      reportType: 'purchases' as const,
      reportTitle: 'Purchase Report',
      dateRange: { from: fromDate, to: toDate },
      status: statusFilter === 'all' ? 'All' : statusFilter,
      generatedBy: store.currentUser?.full_name || 'Unknown',
      data: filteredPurchases.map(purchase => {
        const supplier = store.suppliers.find(s => s.id === purchase.supplier_id);
        const vehicle = store.vehicles.find(v => v.id === purchase.vehicle_id);
        const material = store.materials.find(m => m.id === purchase.material_id);
        return {
          date: purchase.date,
          slip_number: purchase.purchase_slip_number,
          party_name: supplier?.supplier_name || '',
          vehicle_number: vehicle?.vehicle_number || '',
          material_name: material?.material_name || '',
          quantity_brass: purchase.quantity_brass,
          rate: purchase.rate,
          total_amount: purchase.total_amount,
          transaction_state: purchase.transaction_state,
          created_by: purchase.created_by
        };
      }),
      totals: {
        quantity: filteredPurchases.reduce((sum, p) => sum + p.quantity_brass, 0),
        amount: filteredPurchases.reduce((sum, p) => sum + p.total_amount, 0)
      }
    };
    ReportExportService.exportToPDF(exportData);
  };

  const filteredPurchases = useMemo(() => {
    return store.purchases.filter(p => {
      const supplier = store.suppliers.find(s => s.id === p.supplier_id);
      const matchSearch = !search || supplier?.supplier_name.toLowerCase().includes(search.toLowerCase()) || p.purchase_slip_number.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.transaction_state === statusFilter;
      const matchDate = p.date >= fromDate && p.date <= toDate;
      return matchSearch && matchStatus && matchDate;
    });
  }, [store.purchases, store.suppliers, search, statusFilter, fromDate, toDate]);

  const supplierVehicles = useMemo(() => {
    if (!supplierId) return [];
    return store.getSupplierVehicles(supplierId);
  }, [supplierId, store]);

  const totalAmount = useMemo(() => Math.round((parseFloat(quantity) || 0) * (parseFloat(rate) || 0) * 100) / 100, [quantity, rate]);

  const handleSaveAndPrint = () => {
    setError('');
    if (!supplierId) { setError('Supplier is required.'); return; }
    if (!vehicleId) { setError('Vehicle is required.'); return; }
    if (!materialId) { setError('Material is required.'); return; }
    if (!quantity || parseFloat(quantity) <= 0) { setError('Quantity must be greater than 0.'); return; }
    if (!rate || parseFloat(rate) <= 0) { setError('Rate must be greater than 0.'); return; }
    if (store.isDemoMode) { setError('Demo mode is read-only.'); return; }

    const vehicle = store.vehicles.find(v => v.id === vehicleId);
    if (vehicle && vehicle.supplier_id !== supplierId) { setError('Vehicle does not belong to this supplier.'); return; }

    const saved = store.addPurchase({
      date: formDate,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      supplier_id: supplierId,
      vehicle_id: vehicleId,
      driver_name: vehicle?.driver_name || '',
      material_id: materialId,
      quantity_brass: parseFloat(quantity),
      rate: parseFloat(rate),
      total_amount: totalAmount,
      notes,
      created_by: store.currentUser?.full_name || '',
    });
    setPreviewPurchase({ ...saved });
    setShowForm(false);
    setShowPreview(true);
    setSuccess('Purchase slip created successfully!');
    setFormDate(new Date().toISOString().split('T')[0]);
    setSupplierId(''); setVehicleId(''); setMaterialId(''); setQuantity(''); setRate(''); setNotes('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Print Container - Hidden on screen, visible only when printing */}
      {previewPurchase && (
        <div className="print-receipt-container">
          <PrintReceipt type="purchase" data={previewPurchase} store={store} />
        </div>
      )}

      {/* Header - Fixed */}
      <div className="flex-shrink-0 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Raw Material Inward / Purchase</h1>
            <p className="text-sm text-slate-500">Manage purchase slips for raw materials</p>
          </div>
          <button onClick={() => setShowForm(true)} disabled={store.isDemoMode} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium">
            <Plus size={16} /> New Purchase
          </button>
        </div>

        {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>}

        {/* Filter Bar */}
        <FilterBar
          searchValue={search}
          searchPlaceholder="Search by supplier or slip no..."
          onSearchChange={setSearch}
          fromDate={fromDate}
          toDate={toDate}
          dateRange={dateRange}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onDateRangeChange={setDateRange}
          status={statusFilter}
          onStatusChange={setStatusFilter}
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
          onReset={handleReset}
        />
      </div>

      {/* Table - Scrollable */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          <table className="erp-table text-base">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr>
                <th>Date</th><th>Slip No.</th><th>Supplier</th><th>Vehicle</th><th>Material</th><th>Qty (BRASS)</th><th>Rate</th><th>Amount</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8 text-slate-500">No purchases found</td></tr>
              ) : filteredPurchases.map(p => {
                const supplier = store.suppliers.find(s => s.id === p.supplier_id);
                const vehicle = store.vehicles.find(v => v.id === p.vehicle_id);
                const material = store.materials.find(m => m.id === p.material_id);
                return (
                  <tr key={p.id}>
                    <td>{p.date}</td>
                    <td className="font-mono text-sm">{p.purchase_slip_number}</td>
                    <td>{supplier?.supplier_name}</td>
                    <td className="font-mono text-sm">{vehicle?.vehicle_number}</td>
                    <td>{material?.material_name}</td>
                    <td>{p.quantity_brass.toFixed(2)}</td>
                    <td>{formatCurrency(p.rate)}</td>
                    <td className="font-medium">{formatCurrency(p.total_amount)}</td>
                    <td><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.transaction_state === 'FULFILLED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.transaction_state}</span></td>
                    <td className="relative">
                      <div ref={openMenu === p.id ? menuRef : null} className="relative">
                        <button 
                          onClick={(e) => {
                            if (openMenu === p.id) {
                              setOpenMenu(null);
                            } else {
                              const button = e.currentTarget;
                              const rect = button.getBoundingClientRect();
                              const spaceBelow = window.innerHeight - rect.bottom;
                              setMenuPosition(spaceBelow < 200 ? 'top' : 'bottom');
                              setOpenMenu(p.id);
                            }
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenu === p.id && (
                          <div className={`absolute right-0 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-[9999] ${
                            menuPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
                          }`}>
                            <button 
                              onClick={() => { setPreviewPurchase(p); setShowPreview(true); setOpenMenu(null); }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Eye size={14} /> Preview / Print
                            </button>
                            {p.transaction_state === 'FULFILLED' && store.currentUser?.role === 'ADMIN' && (
                              <button 
                                onClick={() => {
                                  if (confirm('Are you sure you want to cancel this purchase?')) {
                                    // Add cancel purchase logic here
                                    setOpenMenu(null);
                                  }
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <X size={14} /> Cancel Purchase
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
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm text-slate-600 flex flex-wrap gap-4">
          <span>Showing {filteredPurchases.length} purchases</span>
          <span className="font-medium">Total Quantity: {filteredPurchases.reduce((s, x) => s + x.quantity_brass, 0).toFixed(2)} BRASS</span>
          <span className="font-medium text-blue-700">Total Purchase: {formatCurrency(filteredPurchases.reduce((s, x) => s + x.total_amount, 0))}</span>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">New Purchase / Inward</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 rounded"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <SearchableSelect
                label="Supplier"
                value={supplierId}
                onChange={(value) => { setSupplierId(value); setVehicleId(''); }}
                options={store.suppliers.filter(s => s.is_active).map(s => ({
                  value: s.id,
                  label: s.supplier_name,
                  sublabel: `Mobile: ${s.mobile}`
                }))}
                placeholder="Select supplier"
                searchPlaceholder="Search supplier..."
                required
              />
              {supplierId ? (
                supplierVehicles.length > 0 ? (
                  <SearchableSelect
                    label="Vehicle"
                    value={vehicleId}
                    onChange={setVehicleId}
                    options={supplierVehicles.map(v => ({
                      value: v.id,
                      label: v.vehicle_number,
                      sublabel: `Driver: ${v.driver_name} • Type: ${v.vehicle_type}`
                    }))}
                    placeholder="Select vehicle"
                    searchPlaceholder="Search vehicle..."
                    required
                  />
                ) : <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">No vehicles registered for this supplier.</div>
              ) : <div className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-400 bg-slate-50">Select a supplier first</div>}
              <SearchableSelect
                label="Raw Material"
                value={materialId}
                onChange={setMaterialId}
                options={store.materials.filter(m => m.is_active).map(m => ({
                  value: m.id,
                  label: m.material_name,
                  sublabel: `Category: ${m.category}`
                }))}
                placeholder="Select material"
                searchPlaceholder="Search material..."
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity (BRASS) *</label>
                  <input type="number" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="15.00" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rate / BRASS *</label>
                  <input type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)} placeholder="3500.00" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-emerald-800">Total Amount</span>
                  <span className="text-xl font-bold text-emerald-800">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Optional..." />
              </div>
            </div>
            <div className="p-5 border-t border-slate-200 flex gap-3">
              <button onClick={handleSaveAndPrint} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm">SAVE & PRINT</button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm border border-slate-300">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {showPreview && previewPurchase && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Purchase Slip Preview</h2>
              <button onClick={() => setShowPreview(false)} className="p-1.5 hover:bg-slate-100 rounded"><X size={18} /></button>
            </div>
            <div className="p-6 flex justify-center bg-slate-100">
              <PrintReceipt type="purchase" data={previewPurchase} store={store} />
            </div>
            <div className="p-4 border-t border-slate-200 flex gap-3">
              <button onClick={() => window.print()} className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm"><Printer size={16} /> Print</button>
              <button onClick={() => setShowPreview(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm border border-slate-300">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
