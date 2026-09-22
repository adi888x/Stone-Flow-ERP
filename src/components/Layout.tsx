import React, { useState } from 'react';
import { useStoreContext } from '../App';
import {
  LayoutDashboard, ShoppingCart, Package, Receipt, Users, Truck,
  Boxes, IndianRupee, CreditCard, BookOpen, BarChart3, UserCog,
  ClipboardList, Settings, Menu, X, LogOut, ChevronDown
} from 'lucide-react';

type Page = 'dashboard' | 'sales' | 'purchases' | 'expenses' | 'customers' | 'suppliers' |
  'vehicles' | 'materials' | 'rates' | 'customer-payments' | 'supplier-payments' |
  'customer-ledger' | 'supplier-ledger' | 'reports' | 'users' | 'audit-logs' | 'settings';

interface LayoutProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode; roles: string[] }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, roles: ['ADMIN', 'COUNTER_OPERATOR', 'ACCOUNTANT', 'MANAGER'] },
  { id: 'sales', label: 'Sales / Outward', icon: <ShoppingCart size={18} />, roles: ['ADMIN', 'COUNTER_OPERATOR', 'ACCOUNTANT', 'MANAGER'] },
  { id: 'purchases', label: 'Raw Material Inward', icon: <Package size={18} />, roles: ['ADMIN', 'COUNTER_OPERATOR', 'ACCOUNTANT'] },
  { id: 'expenses', label: 'Expenses', icon: <Receipt size={18} />, roles: ['ADMIN', 'ACCOUNTANT', 'MANAGER'] },
  { id: 'customer-payments', label: 'Customer Payments', icon: <CreditCard size={18} />, roles: ['ADMIN', 'ACCOUNTANT'] },
  { id: 'supplier-payments', label: 'Supplier Payments', icon: <IndianRupee size={18} />, roles: ['ADMIN', 'ACCOUNTANT'] },
  { id: 'customers', label: 'Customers', icon: <Users size={18} />, roles: ['ADMIN', 'COUNTER_OPERATOR', 'MANAGER'] },
  { id: 'suppliers', label: 'Suppliers', icon: <Users size={18} />, roles: ['ADMIN', 'COUNTER_OPERATOR', 'MANAGER'] },
  { id: 'vehicles', label: 'Vehicles', icon: <Truck size={18} />, roles: ['ADMIN', 'COUNTER_OPERATOR'] },
  { id: 'materials', label: 'Materials', icon: <Boxes size={18} />, roles: ['ADMIN', 'COUNTER_OPERATOR'] },
  { id: 'rates', label: 'Customer Rates', icon: <IndianRupee size={18} />, roles: ['ADMIN'] },
  { id: 'customer-ledger', label: 'Customer Ledger', icon: <BookOpen size={18} />, roles: ['ADMIN', 'ACCOUNTANT', 'MANAGER'] },
  { id: 'supplier-ledger', label: 'Supplier Ledger', icon: <BookOpen size={18} />, roles: ['ADMIN', 'ACCOUNTANT', 'MANAGER'] },
  { id: 'reports', label: 'Reports', icon: <BarChart3 size={18} />, roles: ['ADMIN', 'ACCOUNTANT', 'MANAGER'] },
  { id: 'users', label: 'Users', icon: <UserCog size={18} />, roles: ['ADMIN'] },
  { id: 'audit-logs', label: 'Audit Logs', icon: <ClipboardList size={18} />, roles: ['ADMIN'] },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} />, roles: ['ADMIN'] },
];

export function Layout({ currentPage, setCurrentPage, children }: LayoutProps) {
  const store = useStoreContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const filteredNav = NAV_ITEMS.filter(item =>
    store.currentUser && item.roles.includes(store.currentUser.role)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">BW</div>
            <div>
              <h1 className="font-bold text-sm leading-tight">BALAJI WASH SAND</h1>
              <p className="text-xs text-slate-400">ERP System</p>
            </div>
          </div>
          {store.isDemoMode && (
            <div className="mt-2 px-2 py-1 bg-amber-500/20 border border-amber-500/50 rounded text-amber-300 text-xs font-medium text-center">
              DEMO MODE — READ ONLY
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {filteredNav.map(item => (
            <button
              key={item.id}
              onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                currentPage === item.id
                  ? 'bg-blue-600/20 text-blue-300 border-r-2 border-blue-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-xs font-medium">
              {store.currentUser?.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{store.currentUser?.full_name}</p>
              <p className="text-xs text-slate-400">{store.currentUser?.role}</p>
            </div>
            <button onClick={() => store.logout()} className="p-1.5 hover:bg-slate-700 rounded" title="Logout">
              <LogOut size={16} className="text-slate-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-4 shrink-0">
          <button className="lg:hidden p-2 hover:bg-slate-100 rounded" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="flex-1"></div>
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 rounded-lg text-sm"
            >
              <span className="hidden sm:inline">{store.currentUser?.full_name}</span>
              <ChevronDown size={14} />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-sm font-medium">{store.currentUser?.full_name}</p>
                  <p className="text-xs text-slate-500">{store.currentUser?.email}</p>
                </div>
                <button onClick={() => { store.logout(); setUserMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
