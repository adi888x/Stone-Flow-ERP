import React from 'react';
import { useStoreContext } from '../App';
import { Printer, Monitor, Smartphone, Globe } from 'lucide-react';

export function SettingsPage() {
  const store = useStoreContext();

  return (
    <div className="space-y-6">
      <div><p className="text-sm text-slate-500">Configure system settings and preferences</p></div>

      {/* Business Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Business Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label><input type="text" value={store.appSettings.business_name} readOnly className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone</label><input type="text" value={store.appSettings.business_phone} readOnly className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50" /></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">Address</label><input type="text" value={store.appSettings.business_address} readOnly className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Default Rate (₹/BRASS)</label><input type="text" value={`₹${store.appSettings.default_rate.toLocaleString('en-IN')}`} readOnly className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Unit</label><input type="text" value={store.appSettings.unit} readOnly className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50" /></div>
        </div>
      </div>

      {/* Printer Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4"><Printer size={18} className="text-blue-600" /><h2 className="font-semibold text-slate-800">Printer Settings</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Printer Name</label><input type="text" value={store.printerSettings.printer_name} readOnly className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Paper Size</label><input type="text" value={store.printerSettings.paper_size} readOnly className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Connection</label><input type="text" value={store.printerSettings.connection} readOnly className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Copies</label><input type="text" value={store.printerSettings.copies} readOnly className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50" /></div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p className="font-medium mb-1">Thermal Printing Setup:</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            <li>Install QZ Tray on Windows for USB thermal printer support</li>
            <li>Supports 58mm (2-inch) and 80mm (3-inch) thermal paper</li>
            <li>ESC/POS commands for direct printer communication</li>
            <li>Auto-print option available for high-volume operations</li>
          </ul>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-800 mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1"><Globe size={14} className="text-blue-600" /><span className="text-xs text-slate-500">Database</span></div>
            <p className="text-sm font-medium">Supabase PostgreSQL</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1"><Monitor size={14} className="text-green-600" /><span className="text-xs text-slate-500">Hosting</span></div>
            <p className="text-sm font-medium">Cloudflare Pages</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1"><Smartphone size={14} className="text-purple-600" /><span className="text-xs text-slate-500">PWA</span></div>
            <p className="text-sm font-medium">Enabled (Add to Home Screen)</p>
          </div>
        </div>
      </div>

      {/* Database Schema Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Database Tables</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {['profiles', 'customers', 'suppliers', 'vehicles', 'materials', 'customer_rates', 'sales', 'purchase_entries', 'expenses', 'customer_payments', 'supplier_payments', 'audit_logs', 'print_history', 'app_settings', 'printer_settings'].map(t => (
            <div key={t} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-600">{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
