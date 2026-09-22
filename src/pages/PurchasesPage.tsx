import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStoreContext } from '../App';
import { Plus, Search, Eye, X, Printer, MoreVertical } from 'lucide-react';

function formatCurrency(n: number) { return '₹' + n.toLocaleString('en-IN'); }

export function PurchasesPage() {
  const store = useStoreContext();
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPurchase, setPreviewPurchase] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [rate, setRate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  const filteredPurchases = useMemo(() => {
    return store.purchases.filter(p => {
      const supplier = store.suppliers.find(s => s.id === p.supplier_id);
      return !search || supplier?.supplier_name.toLowerCase().includes(search.toLowerCase()) || p.purchase_slip_number.toLowerCase().includes(search.toLowerCase());
    });
  }, [store.purchases, store.suppliers, search]);

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
      date: new Date().toISOString().split('T')[0],
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
    setSupplierId(''); setVehicleId(''); setMaterialId(''); setQuantity(''); setRate(''); setNotes('');
  };

  return (
    <div className="space-y-4">
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

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by supplier or slip no..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="erp-table text-base">
            <thead>
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
                          onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                          className="p-1.5 hover:bg-slate-100 rounded"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenu === p.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-[9999]">
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
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm text-slate-600">
          Showing {filteredPurchases.length} purchases | Total: {formatCurrency(filteredPurchases.reduce((s, x) => s + (x.transaction_state === 'FULFILLED' ? x.total_amount : 0), 0))}
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Supplier *</label>
                <select value={supplierId} onChange={e => { setSupplierId(e.target.value); setVehicleId(''); }} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="">Select supplier</option>
                  {store.suppliers.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle *</label>
                {supplierId ? (
                  supplierVehicles.length > 0 ? (
                    <select value={vehicleId} onChange={e => setVehicleId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                      <option value="">Select vehicle</option>
                      {supplierVehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_number} — {v.driver_name}</option>)}
                    </select>
                  ) : <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">No vehicles registered for this supplier.</div>
                ) : <div className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-400 bg-slate-50">Select a supplier first</div>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Raw Material *</label>
                <select value={materialId} onChange={e => setMaterialId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="">Select material</option>
                  {store.materials.filter(m => m.is_active).map(m => <option key={m.id} value={m.id}>{m.material_name}</option>)}
                </select>
              </div>
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
              <div className="receipt-80mm bg-white shadow-lg">
                <div className="text-center border-b border-dashed border-slate-400 pb-2 mb-2">
                  <p className="font-bold text-sm">{store.appSettings.business_name}</p>
                  <p className="text-xs">{store.appSettings.business_address}</p>
                  <p className="font-bold text-xs mt-1">RAW MATERIAL INWARD</p>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span>Slip No:</span><span className="font-mono font-bold">{previewPurchase.purchase_slip_number}</span></div>
                  <div className="flex justify-between"><span>Date:</span><span>{previewPurchase.date}</span></div>
                  <div className="flex justify-between"><span>Time:</span><span>{previewPurchase.time}</span></div>
                </div>
                <div className="border-t border-dashed border-slate-400 my-2"></div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span>Supplier:</span><span className="font-medium">{store.suppliers.find(s => s.id === previewPurchase.supplier_id)?.supplier_name}</span></div>
                  <div className="flex justify-between"><span>Vehicle:</span><span className="font-mono">{store.vehicles.find(v => v.id === previewPurchase.vehicle_id)?.vehicle_number}</span></div>
                  <div className="flex justify-between"><span>Driver:</span><span>{previewPurchase.driver_name}</span></div>
                  <div className="flex justify-between"><span>Material:</span><span>{store.materials.find(m => m.id === previewPurchase.material_id)?.material_name}</span></div>
                </div>
                <div className="border-t border-dashed border-slate-400 my-2"></div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span>Quantity:</span><span className="font-bold">{previewPurchase.quantity_brass?.toFixed(2)} BRASS</span></div>
                  <div className="flex justify-between"><span>Rate:</span><span>{formatCurrency(previewPurchase.rate)} / BRASS</span></div>
                </div>
                <div className="border-t-2 border-slate-800 my-2"></div>
                <div className="flex justify-between text-sm font-bold"><span>TOTAL:</span><span>{formatCurrency(previewPurchase.total_amount)}</span></div>
                <div className="border-t border-dashed border-slate-400 my-2"></div>
                <p className="text-xs text-center">Thank you!</p>
              </div>
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
