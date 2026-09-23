import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useStore, type Store } from './store/useStore';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { SalesPage } from './pages/SalesPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { CashBankPage } from './pages/CashBankPage';
import { CustomersPage } from './pages/CustomersPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { RatesPage } from './pages/RatesPage';
import { CustomerPaymentsPage } from './pages/CustomerPaymentsPage';
import { SupplierPaymentsPage } from './pages/SupplierPaymentsPage';
import { CustomerLedgerPage } from './pages/CustomerLedgerPage';
import { SupplierLedgerPage } from './pages/SupplierLedgerPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Layout } from './components/Layout';
import { GlobalSearchDialog } from './components/GlobalSearchDialog';

const StoreContext = createContext<Store | null>(null);

export function useStoreContext() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStoreContext must be used within StoreProvider');
  return ctx;
}

type Page = 'dashboard' | 'sales' | 'purchases' | 'expenses' | 'cash-bank' | 'customers' | 'suppliers' |
  'vehicles' | 'materials' | 'rates' | 'customer-payments' | 'supplier-payments' |
  'customer-ledger' | 'supplier-ledger' | 'reports' | 'users' | 'audit-logs' | 'settings';

export default function App() {
  const store = useStore();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page as Page);
    // You can extend this to handle specific record navigation if needed
  };

  const content = useMemo(() => {
    if (!store.currentUser) return <LoginPage />;
    return (
      <>
        <Layout currentPage={currentPage} setCurrentPage={setCurrentPage} onOpenSearch={() => setIsSearchOpen(true)}>
          {currentPage === 'dashboard' && <Dashboard setCurrentPage={setCurrentPage} />}
          {currentPage === 'sales' && <SalesPage />}
          {currentPage === 'purchases' && <PurchasesPage />}
          {currentPage === 'expenses' && <ExpensesPage />}
          {currentPage === 'cash-bank' && <CashBankPage />}
          {currentPage === 'customers' && <CustomersPage />}
          {currentPage === 'suppliers' && <SuppliersPage />}
          {currentPage === 'vehicles' && <VehiclesPage />}
          {currentPage === 'materials' && <MaterialsPage />}
          {currentPage === 'rates' && <RatesPage />}
          {currentPage === 'customer-payments' && <CustomerPaymentsPage />}
          {currentPage === 'supplier-payments' && <SupplierPaymentsPage />}
          {currentPage === 'customer-ledger' && <CustomerLedgerPage />}
          {currentPage === 'supplier-ledger' && <SupplierLedgerPage />}
          {currentPage === 'reports' && <ReportsPage />}
          {currentPage === 'users' && <UsersPage />}
          {currentPage === 'audit-logs' && <AuditLogsPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </Layout>
        <GlobalSearchDialog
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          store={store}
          onNavigate={handleNavigate}
        />
      </>
    );
  }, [store.currentUser, currentPage, store, isSearchOpen]);

  return (
    <StoreContext.Provider value={store}>
      {content}
    </StoreContext.Provider>
  );
}
