import React from 'react';

interface PrintReceiptProps {
  type: 'sale' | 'purchase';
  data: any;
  store: any;
}

export function PrintReceipt({ type, data, store }: PrintReceiptProps) {
  const customer = type === 'sale' ? store.customers.find((c: any) => c.id === data.customer_id) : null;
  const supplier = type === 'purchase' ? store.suppliers.find((s: any) => s.id === data.supplier_id) : null;
  const vehicle = store.vehicles.find((v: any) => v.id === data.vehicle_id);
  const material = store.materials.find((m: any) => m.id === data.material_id);

  const formatCurrency = (n: number) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="receipt-80mm">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-2 mb-2">
        <p className="font-bold text-base mb-1">BALAJI WASH SAND</p>
        <p className="text-xs leading-tight">
          JM2M+C8P, Shrirampur, Shirasgaon,<br />
          Maharashtra 413717
        </p>
        <p className="font-bold text-sm mt-2">
          {type === 'sale' ? 'SALE SLIP' : 'RAW MATERIAL INWARD'}
        </p>
      </div>

      {/* Slip Info */}
      <div className="space-y-1 text-xs mb-2">
        <div className="flex justify-between">
          <span className="font-semibold">Slip No:</span>
          <span className="font-mono font-bold">
            {type === 'sale' ? data.sale_slip_number : data.purchase_slip_number}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Date:</span>
          <span>{data.date}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Time:</span>
          <span>{data.time}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      {/* Party Info */}
      <div className="space-y-1 text-xs mb-2">
        <div className="flex justify-between">
          <span className="font-semibold">{type === 'sale' ? 'Customer:' : 'Supplier:'}</span>
          <span className="font-medium">
            {type === 'sale' ? customer?.customer_name : supplier?.supplier_name}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Vehicle:</span>
          <span className="font-mono">{vehicle?.vehicle_number}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Driver:</span>
          <span>{data.driver_name || vehicle?.driver_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Material:</span>
          <span>{material?.material_name}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      {/* Quantity - Highlighted */}
      <div className="border-2 border-black p-2 my-2 text-center">
        <p className="text-xs font-semibold mb-1">QUANTITY</p>
        <p className="text-xl font-bold">{data.quantity_brass.toFixed(2)} BRASS</p>
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      {/* Rate and Total */}
      <div className="space-y-1 text-xs mb-2">
        <div className="flex justify-between">
          <span className="font-semibold">Rate:</span>
          <span>{formatCurrency(data.rate)} / BRASS</span>
        </div>
      </div>

      <div className="border-t-2 border-black my-2"></div>

      <div className="flex justify-between text-sm font-bold mb-2">
        <span>TOTAL:</span>
        <span>{formatCurrency(data.total_amount)}</span>
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      {/* Footer */}
      <div className="text-center text-xs mt-2">
        <p className="font-semibold">Thank you for your business!</p>
        <p className="text-[10px] mt-1">— BALAJI WASH SAND —</p>
      </div>
    </div>
  );
}
