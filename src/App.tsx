import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useStore, type Store } from './store/useStore';
import { SplashScreen } from './components/SplashScreen';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { SalesPage } from './pages/SalesPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { ExpensesPage } from './pages/ExpensesPage';
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

const StoreContext = createContext<Store | null>(null);

export function useStoreContext() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStoreContext must be used within StoreProvider');
  return ctx;
}

type Page = 'dashboard' | 'sales' | 'purchases' | 'expenses' | 'customers' | 'suppliers' |
  'vehicles' | 'materials' | 'rates' | 'customer-payments' | 'supplier-payments' |
  'customer-ledger' | 'supplier-ledger' | 'reports' | 'users' | 'audit-logs' | 'settings';

export default function App() {
  const store = useStore();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  const content = useMemo(() => {
    if (!store.currentUser) return <LoginPage />;
    return (
      <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'sales' && <SalesPage />}
        {currentPage === 'purchases' && <PurchasesPage />}
        {currentPage === 'expenses' && <ExpensesPage />}
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
    );
  }, [store.currentUser, currentPage, store]);

  return (
    <StoreContext.Provider value={store}>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <div className={`transition-opacity duration-500 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        {content}
      </div>
    </StoreContext.Provider>
  );
}
