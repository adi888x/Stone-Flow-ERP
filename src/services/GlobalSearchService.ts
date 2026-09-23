import { Store } from '../store/useStore';

export interface SearchResult {
  type: 'customer' | 'supplier' | 'vehicle' | 'material' | 'sale' | 'purchase' | 'expense' | 'customer_payment' | 'supplier_payment' | 'cash_bank_transaction' | 'navigation';
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  route?: string;
  data?: any;
}

export interface SearchCategory {
  name: string;
  results: SearchResult[];
}

export class GlobalSearchService {
  static search(query: string, store: Store): SearchCategory[] {
    if (!query.trim()) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const categories: SearchCategory[] = [];

    // Navigation results (always show first)
    const navResults = this.searchNavigation(normalizedQuery, store);
    if (navResults.length > 0) {
      categories.push({ name: 'NAVIGATION', results: navResults });
    }

    // Customers
    const customerResults = this.searchCustomers(normalizedQuery, store);
    if (customerResults.length > 0) {
      categories.push({ name: 'CUSTOMERS', results: customerResults });
    }

    // Suppliers
    const supplierResults = this.searchSuppliers(normalizedQuery, store);
    if (supplierResults.length > 0) {
      categories.push({ name: 'SUPPLIERS', results: supplierResults });
    }

    // Vehicles
    const vehicleResults = this.searchVehicles(normalizedQuery, store);
    if (vehicleResults.length > 0) {
      categories.push({ name: 'VEHICLES', results: vehicleResults });
    }

    // Materials
    const materialResults = this.searchMaterials(normalizedQuery, store);
    if (materialResults.length > 0) {
      categories.push({ name: 'MATERIALS', results: materialResults });
    }

    // Sales
    const saleResults = this.searchSales(normalizedQuery, store);
    if (saleResults.length > 0) {
      categories.push({ name: 'SALES', results: saleResults });
    }

    // Purchases
    const purchaseResults = this.searchPurchases(normalizedQuery, store);
    if (purchaseResults.length > 0) {
      categories.push({ name: 'PURCHASES', results: purchaseResults });
    }

    // Expenses
    const expenseResults = this.searchExpenses(normalizedQuery, store);
    if (expenseResults.length > 0) {
      categories.push({ name: 'EXPENSES', results: expenseResults });
    }

    // Customer Payments
    const customerPaymentResults = this.searchCustomerPayments(normalizedQuery, store);
    if (customerPaymentResults.length > 0) {
      categories.push({ name: 'CUSTOMER PAYMENTS', results: customerPaymentResults });
    }

    // Supplier Payments
    const supplierPaymentResults = this.searchSupplierPayments(normalizedQuery, store);
    if (supplierPaymentResults.length > 0) {
      categories.push({ name: 'SUPPLIER PAYMENTS', results: supplierPaymentResults });
    }

    // Cash & Bank Transactions
    const cashBankResults = this.searchCashBankTransactions(normalizedQuery, store);
    if (cashBankResults.length > 0) {
      categories.push({ name: 'CASH & BANK', results: cashBankResults });
    }

    return categories;
  }

  private static searchNavigation(query: string, store: Store): SearchResult[] {
    const pages = [
      { name: 'Dashboard', route: 'dashboard', keywords: ['dashboard', 'home', 'overview'] },
      { name: 'Sales', route: 'sales', keywords: ['sales', 'outward', 'sell'] },
      { name: 'Raw Material Inward', route: 'purchases', keywords: ['purchases', 'inward', 'raw material', 'purchase'] },
      { name: 'Expenses', route: 'expenses', keywords: ['expenses', 'expense', 'cost'] },
      { name: 'Cash & Bank', route: 'cash-bank', keywords: ['cash', 'bank', 'account', 'money'] },
      { name: 'Customers', route: 'customers', keywords: ['customers', 'customer', 'client'] },
      { name: 'Suppliers', route: 'suppliers', keywords: ['suppliers', 'supplier', 'vendor'] },
      { name: 'Vehicles', route: 'vehicles', keywords: ['vehicles', 'vehicle', 'truck', 'tipper'] },
      { name: 'Materials', route: 'materials', keywords: ['materials', 'material', 'sand'] },
      { name: 'Customer Rates', route: 'rates', keywords: ['rates', 'rate', 'pricing'] },
      { name: 'Customer Payments', route: 'customer-payments', keywords: ['customer payments', 'payment received'] },
      { name: 'Supplier Payments', route: 'supplier-payments', keywords: ['supplier payments', 'payment made'] },
      { name: 'Customer Ledger', route: 'customer-ledger', keywords: ['customer ledger', 'ledger'] },
      { name: 'Supplier Ledger', route: 'supplier-ledger', keywords: ['supplier ledger'] },
      { name: 'Reports', route: 'reports', keywords: ['reports', 'report'] },
    ];

    return pages
      .filter(page => 
        page.name.toLowerCase().includes(query) ||
        page.keywords.some(k => k.includes(query))
      )
      .slice(0, 5)
      .map(page => ({
        type: 'navigation' as const,
        id: `nav-${page.route}`,
        title: page.name,
        subtitle: 'Navigate to page',
        icon: '→',
        route: page.route,
      }));
  }

  private static searchCustomers(query: string, store: Store): SearchResult[] {
    return store.customers
      .filter(c => 
        c.is_active && (
          c.customer_name.toLowerCase().includes(query) ||
          c.mobile.includes(query)
        )
      )
      .slice(0, 5)
      .map(c => ({
        type: 'customer' as const,
        id: c.id,
        title: c.customer_name,
        subtitle: `Mobile: ${c.mobile}`,
        icon: '👤',
        route: 'customers',
        data: c,
      }));
  }

  private static searchSuppliers(query: string, store: Store): SearchResult[] {
    return store.suppliers
      .filter(s => 
        s.is_active && (
          s.supplier_name.toLowerCase().includes(query) ||
          s.mobile.includes(query)
        )
      )
      .slice(0, 5)
      .map(s => ({
        type: 'supplier' as const,
        id: s.id,
        title: s.supplier_name,
        subtitle: `Mobile: ${s.mobile}`,
        icon: '🏭',
        route: 'suppliers',
        data: s,
      }));
  }

  private static searchVehicles(query: string, store: Store): SearchResult[] {
    return store.vehicles
      .filter(v => 
        v.is_active && (
          v.vehicle_number.toLowerCase().includes(query) ||
          v.driver_name.toLowerCase().includes(query) ||
          v.owner_name.toLowerCase().includes(query)
        )
      )
      .slice(0, 5)
      .map(v => {
        const customer = store.customers.find(c => c.id === v.customer_id);
        const supplier = store.suppliers.find(s => s.id === v.supplier_id);
        const owner = customer?.customer_name || supplier?.supplier_name || v.owner_name;
        return {
          type: 'vehicle' as const,
          id: v.id,
          title: v.vehicle_number,
          subtitle: `${owner} • ${v.driver_name}`,
          icon: '🚚',
          route: 'vehicles',
          data: v,
        };
      });
  }

  private static searchMaterials(query: string, store: Store): SearchResult[] {
    return store.materials
      .filter(m => 
        m.is_active && (
          m.material_name.toLowerCase().includes(query) ||
          m.category.toLowerCase().includes(query)
        )
      )
      .slice(0, 5)
      .map(m => ({
        type: 'material' as const,
        id: m.id,
        title: m.material_name,
        subtitle: `Category: ${m.category}`,
        icon: '📦',
        route: 'materials',
        data: m,
      }));
  }

  private static searchSales(query: string, store: Store): SearchResult[] {
    return store.sales
      .filter(s => {
        const customer = store.customers.find(c => c.id === s.customer_id);
        const vehicle = store.vehicles.find(v => v.id === s.vehicle_id);
        const material = store.materials.find(m => m.id === s.material_id);
        return (
          s.sale_slip_number.toLowerCase().includes(query) ||
          (customer && customer.customer_name.toLowerCase().includes(query)) ||
          (vehicle && vehicle.vehicle_number.toLowerCase().includes(query)) ||
          (material && material.material_name.toLowerCase().includes(query))
        );
      })
      .slice(0, 5)
      .map(s => {
        const customer = store.customers.find(c => c.id === s.customer_id);
        const vehicle = store.vehicles.find(v => v.id === s.vehicle_id);
        const material = store.materials.find(m => m.id === s.material_id);
        return {
          type: 'sale' as const,
          id: s.id,
          title: s.sale_slip_number,
          subtitle: `${customer?.customer_name} • ${vehicle?.vehicle_number} • ${s.quantity_brass.toFixed(2)} BRASS • ₹${s.total_amount.toLocaleString('en-IN')}`,
          icon: '🧾',
          route: 'sales',
          data: s,
        };
      });
  }

  private static searchPurchases(query: string, store: Store): SearchResult[] {
    return store.purchases
      .filter(p => {
        const supplier = store.suppliers.find(s => s.id === p.supplier_id);
        const vehicle = store.vehicles.find(v => v.id === p.vehicle_id);
        const material = store.materials.find(m => m.id === p.material_id);
        return (
          p.purchase_slip_number.toLowerCase().includes(query) ||
          (supplier && supplier.supplier_name.toLowerCase().includes(query)) ||
          (vehicle && vehicle.vehicle_number.toLowerCase().includes(query)) ||
          (material && material.material_name.toLowerCase().includes(query))
        );
      })
      .slice(0, 5)
      .map(p => {
        const supplier = store.suppliers.find(s => s.id === p.supplier_id);
        const vehicle = store.vehicles.find(v => v.id === p.vehicle_id);
        return {
          type: 'purchase' as const,
          id: p.id,
          title: p.purchase_slip_number,
          subtitle: `${supplier?.supplier_name} • ${vehicle?.vehicle_number} • ${p.quantity_brass.toFixed(2)} BRASS • ₹${p.total_amount.toLocaleString('en-IN')}`,
          icon: '📦',
          route: 'purchases',
          data: p,
        };
      });
  }

  private static searchExpenses(query: string, store: Store): SearchResult[] {
    return store.expenses
      .filter(e => 
        e.expense_number.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query) ||
        e.description_of_work.toLowerCase().includes(query) ||
        e.vendor_or_person.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .map(e => ({
        type: 'expense' as const,
        id: e.id,
        title: e.expense_number,
        subtitle: `${e.category} • ₹${e.amount.toLocaleString('en-IN')}`,
        icon: '💰',
        route: 'expenses',
        data: e,
      }));
  }

  private static searchCustomerPayments(query: string, store: Store): SearchResult[] {
    return store.customerPayments
      .filter(p => {
        const customer = store.customers.find(c => c.id === p.customer_id);
        return (
          p.payment_number.toLowerCase().includes(query) ||
          (customer && customer.customer_name.toLowerCase().includes(query)) ||
          (p.reference_number && p.reference_number.toLowerCase().includes(query))
        );
      })
      .slice(0, 5)
      .map(p => {
        const customer = store.customers.find(c => c.id === p.customer_id);
        return {
          type: 'customer_payment' as const,
          id: p.id,
          title: p.payment_number,
          subtitle: `${customer?.customer_name} • ₹${p.amount.toLocaleString('en-IN')} • ${p.payment_mode}`,
          icon: '💵',
          route: 'customer-payments',
          data: p,
        };
      });
  }

  private static searchSupplierPayments(query: string, store: Store): SearchResult[] {
    return store.supplierPayments
      .filter(p => {
        const supplier = store.suppliers.find(s => s.id === p.supplier_id);
        return (
          p.payment_number.toLowerCase().includes(query) ||
          (supplier && supplier.supplier_name.toLowerCase().includes(query)) ||
          (p.reference_number && p.reference_number.toLowerCase().includes(query))
        );
      })
      .slice(0, 5)
      .map(p => {
        const supplier = store.suppliers.find(s => s.id === p.supplier_id);
        return {
          type: 'supplier_payment' as const,
          id: p.id,
          title: p.payment_number,
          subtitle: `${supplier?.supplier_name} • ₹${p.amount.toLocaleString('en-IN')} • ${p.payment_mode}`,
          icon: '💸',
          route: 'supplier-payments',
          data: p,
        };
      });
  }

  private static searchCashBankTransactions(query: string, store: Store): SearchResult[] {
    return store.cashBankTransactions
      .filter(t => 
        t.transaction_id.toLowerCase().includes(query) ||
        (t.party_name && t.party_name.toLowerCase().includes(query)) ||
        (t.reference_no && t.reference_no.toLowerCase().includes(query)) ||
        t.transaction_type.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .map(t => {
        const account = store.cashBankAccounts.find(a => a.id === t.account_id);
        const amount = t.received_amount > 0 ? t.received_amount : t.paid_amount;
        const type = t.received_amount > 0 ? 'Received' : 'Paid';
        return {
          type: 'cash_bank_transaction' as const,
          id: t.id,
          title: t.transaction_id,
          subtitle: `${account?.account_name} • ${type} ₹${amount.toLocaleString('en-IN')} • ${t.transaction_type}`,
          icon: '💳',
          route: 'cash-bank',
          data: t,
        };
      });
  }
}
