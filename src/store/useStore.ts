// ============================================
// BALAJI WASH SAND ERP - Data Store
// ============================================
import { useState, useCallback } from 'react';
import type {
  User, Customer, Supplier, Vehicle, Material, CustomerRate,
  Sale, PurchaseEntry, Expense, CustomerPayment, SupplierPayment,
  AuditLog, PrinterSettings, AppSettings, TransactionState,
  CashBankAccount, CashBankTransaction, Transfer
} from '../types';

// ---- Utility ----
const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const today = () => new Date().toISOString().split('T')[0];
const timeNow = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

function generateSlipNumber(prefix: string, existing: string[]): string {
  const year = new Date().getFullYear();
  const nums = existing
    .filter(s => s.startsWith(`${prefix}-${year}-`))
    .map(s => parseInt(s.split('-')[2], 10))
    .filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}-${year}-${String(next).padStart(6, '0')}`;
}

// ---- Demo Data ----
const DEMO_CUSTOMERS: Customer[] = [
  { id: 'c1', customer_name: 'ABC Constructions', mobile: '9876543210', address: 'Pune, Maharashtra', contact_person: 'Rajesh Patil', is_active: true, created_at: '2026-01-15', updated_at: '2026-01-15' },
  { id: 'c2', customer_name: 'XYZ Developers', mobile: '9876543211', address: 'Mumbai, Maharashtra', contact_person: 'Suresh Sharma', is_active: true, created_at: '2026-01-20', updated_at: '2026-01-20' },
  { id: 'c3', customer_name: 'PQR Builders', mobile: '9876543212', address: 'Nashik, Maharashtra', contact_person: 'Amit Deshmukh', is_active: true, created_at: '2026-02-01', updated_at: '2026-02-01' },
  { id: 'c4', customer_name: 'Sunrise Infra', mobile: '9876543213', address: 'Pune, Maharashtra', contact_person: 'Vikram Joshi', is_active: true, created_at: '2026-02-10', updated_at: '2026-02-10' },
  { id: 'c5', customer_name: 'Green Valley Homes', mobile: '9876543214', address: 'Satara, Maharashtra', contact_person: 'Manoj Kulkarni', is_active: false, created_at: '2026-03-01', updated_at: '2026-03-01' },
];

const DEMO_SUPPLIERS: Supplier[] = [
  { id: 's1', supplier_name: 'River Sand Co.', mobile: '9988776655', address: 'River Bed, Pune', contact_person: 'Ganesh Pawar', is_active: true, created_at: '2026-01-10', updated_at: '2026-01-10' },
  { id: 's2', supplier_name: 'Mountain Minerals', mobile: '9988776656', address: 'Quarry Zone, Nashik', contact_person: 'Ravi Shinde', is_active: true, created_at: '2026-01-15', updated_at: '2026-01-15' },
  { id: 's3', supplier_name: 'Deccan Aggregates', mobile: '9988776657', address: 'Mine Area, Satara', contact_person: 'Sanjay More', is_active: true, created_at: '2026-02-01', updated_at: '2026-02-01' },
];

const DEMO_VEHICLES: Vehicle[] = [
  { id: 'v1', vehicle_number: 'MH16AB1234', vehicle_type: 'TIPPER', owner_name: 'Rajesh Patil', customer_id: 'c1', driver_name: 'Ramesh', driver_mobile: '9876540001', capacity: '15 Brass', is_active: true, created_at: '2026-01-15', updated_at: '2026-01-15' },
  { id: 'v2', vehicle_number: 'MH16CD5678', vehicle_type: 'HYVA', owner_name: 'Rajesh Patil', customer_id: 'c1', driver_name: 'Suresh', driver_mobile: '9876540002', capacity: '12 Brass', is_active: true, created_at: '2026-01-15', updated_at: '2026-01-15' },
  { id: 'v3', vehicle_number: 'MH16XY9087', vehicle_type: 'TEMPO', owner_name: 'Suresh Sharma', customer_id: 'c2', driver_name: 'Mahesh', driver_mobile: '9876540003', capacity: '20 Brass', is_active: true, created_at: '2026-01-20', updated_at: '2026-01-20' },
  { id: 'v4', vehicle_number: 'MH15PQ3456', vehicle_type: 'RIKSHA', owner_name: 'Amit Deshmukh', customer_id: 'c3', driver_name: 'Ganesh', driver_mobile: '9876540004', capacity: '10 Brass', is_active: true, created_at: '2026-02-01', updated_at: '2026-02-01' },
  { id: 'v5', vehicle_number: 'MH14RS7890', vehicle_type: 'TRACTOR', owner_name: 'Ganesh Pawar', supplier_id: 's1', driver_name: 'Balu', driver_mobile: '9876540005', capacity: '25 Brass', is_active: true, created_at: '2026-01-10', updated_at: '2026-01-10' },
  { id: 'v6', vehicle_number: 'MH14TU2345', vehicle_type: 'TIPPER', owner_name: 'Ravi Shinde', supplier_id: 's2', driver_name: 'Kiran', driver_mobile: '9876540006', capacity: '15 Brass', is_active: true, created_at: '2026-01-15', updated_at: '2026-01-15' },
  { id: 'v7', vehicle_number: 'MH16VW6789', vehicle_type: 'HYVA', owner_name: 'Vikram Joshi', customer_id: 'c4', driver_name: 'Prakash', driver_mobile: '9876540007', capacity: '12 Brass', is_active: true, created_at: '2026-02-10', updated_at: '2026-02-10' },
];

const DEMO_MATERIALS: Material[] = [
  { id: 'm1', material_name: 'Wash Sand', category: 'Sand', unit: 'BRASS', description: 'Premium quality washed sand for construction', is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
];

const DEMO_RATES: CustomerRate[] = [
  { id: 'r1', customer_id: 'c1', material_id: 'm1', rate: 4200, unit: 'BRASS', effective_from: '2026-01-01', is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'r2', customer_id: 'c2', material_id: 'm1', rate: 4500, unit: 'BRASS', effective_from: '2026-01-01', is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'r3', customer_id: 'c3', material_id: 'm1', rate: 4500, unit: 'BRASS', effective_from: '2026-01-01', is_active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'r4', customer_id: 'c4', material_id: 'm1', rate: 4200, unit: 'BRASS', effective_from: '2026-02-01', is_active: true, created_at: '2026-02-01', updated_at: '2026-02-01' },
];

// Generate sample sales
const DEMO_SALES: Sale[] = [];
const saleCustomers = ['c1', 'c2', 'c3', 'c4'];
const saleVehicles: Record<string, string[]> = { c1: ['v1', 'v2'], c2: ['v3'], c3: ['v4'], c4: ['v7'] };
const saleDrivers: Record<string, string> = { v1: 'Ramesh', v2: 'Suresh', v3: 'Mahesh', v4: 'Ganesh', v7: 'Prakash' };
for (let i = 0; i < 25; i++) {
  const cid = saleCustomers[i % 4];
  const vids = saleVehicles[cid];
  const vid = vids[i % vids.length];
  const rate = cid === 'c1' || cid === 'c4' ? 4200 : 4500;
  const qty = [8, 10, 12, 12.5, 15][i % 5];
  const dayOffset = Math.floor(i / 3);
  const d = new Date();
  d.setDate(d.getDate() - dayOffset);
  DEMO_SALES.push({
    id: uid(),
    sale_slip_number: `SAL-${d.getFullYear()}-${String(i + 1).padStart(6, '0')}`,
    date: d.toISOString().split('T')[0],
    time: `${8 + (i % 10)}:${String((i * 7) % 60).padStart(2, '0')} AM`,
    customer_id: cid,
    vehicle_id: vid,
    driver_name: saleDrivers[vid],
    material_id: 'm1',
    quantity_brass: qty,
    rate,
    total_amount: qty * rate,
    created_by: 'Counter-01',
    created_at: d.toISOString(),
    updated_at: d.toISOString(),
    transaction_state: 'FULFILLED',
    print_count: 1,
    first_printed_at: d.toISOString(),
    last_printed_at: d.toISOString(),
  });
}

// Generate sample purchases
const DEMO_PURCHASES: PurchaseEntry[] = [];
const purSuppliers = ['s1', 's2', 's3'];
const purVehicles: Record<string, string[]> = { s1: ['v5'], s2: ['v6'], s3: ['v5'] };
for (let i = 0; i < 15; i++) {
  const sid = purSuppliers[i % 3];
  const vids = purVehicles[sid];
  const vid = vids[0];
  const rate = 3200 + (i % 3) * 200;
  const qty = [15, 20, 25][i % 3];
  const dayOffset = Math.floor(i / 2);
  const d = new Date();
  d.setDate(d.getDate() - dayOffset);
  DEMO_PURCHASES.push({
    id: uid(),
    purchase_slip_number: `PUR-${d.getFullYear()}-${String(i + 1).padStart(6, '0')}`,
    date: d.toISOString().split('T')[0],
    time: `${7 + (i % 8)}:${String((i * 11) % 60).padStart(2, '0')} AM`,
    supplier_id: sid,
    vehicle_id: vid,
    driver_name: vid === 'v5' ? 'Balu' : 'Kiran',
    material_id: 'm2',
    quantity_brass: qty,
    rate,
    total_amount: qty * rate,
    created_by: 'Counter-01',
    created_at: d.toISOString(),
    updated_at: d.toISOString(),
    transaction_state: 'FULFILLED',
    print_count: 1,
  });
}

const DEMO_EXPENSES: Expense[] = [
  { id: 'e1', expense_number: 'EXP-2026-000001', date: today(), time: timeNow(), category: 'Machine Repair', description_of_work: 'Conveyor belt replacement', work_area: 'Plant Area A', vendor_or_person: 'Mechanic Ramesh', paid_by: 'Admin', payment_mode: 'Cash', amount: 15000, created_by: 'Admin', created_at: now(), updated_at: now(), transaction_state: 'FULFILLED' },
  { id: 'e2', expense_number: 'EXP-2026-000002', date: today(), time: timeNow(), category: 'Fuel', description_of_work: 'Diesel for loader', work_area: 'Plant', vendor_or_person: 'HP Petrol Pump', paid_by: 'Admin', payment_mode: 'UPI', amount: 8500, created_by: 'Admin', created_at: now(), updated_at: now(), transaction_state: 'FULFILLED' },
  { id: 'e3', expense_number: 'EXP-2026-000003', date: today(), time: timeNow(), category: 'Electrical', description_of_work: 'Motor rewinding', work_area: 'Washing Unit', vendor_or_person: 'Electrician Suresh', paid_by: 'Admin', payment_mode: 'Cash', amount: 12000, created_by: 'Admin', created_at: now(), updated_at: now(), transaction_state: 'FULFILLED' },
  { id: 'e4', expense_number: 'EXP-2026-000004', date: today(), time: timeNow(), category: 'Labour', description_of_work: 'Daily labour wages', work_area: 'Loading Area', vendor_or_person: 'Labour Contractor', paid_by: 'Manager', payment_mode: 'Cash', amount: 5000, created_by: 'Manager', created_at: now(), updated_at: now(), transaction_state: 'FULFILLED' },
  { id: 'e5', expense_number: 'EXP-2026-000005', date: today(), time: timeNow(), category: 'Spare Parts', description_of_work: 'Bearings and seals', work_area: 'Screen Unit', vendor_or_person: 'SKF Bearings', paid_by: 'Admin', payment_mode: 'Bank Transfer', amount: 7500, created_by: 'Admin', created_at: now(), updated_at: now(), transaction_state: 'FULFILLED' },
];

const DEMO_CUSTOMER_PAYMENTS: CustomerPayment[] = [
  { id: 'cp1', payment_number: 'CPY-2026-000001', customer_id: 'c1', date: today(), amount: 50000, payment_mode: 'UPI', reference_number: 'UPI123456', notes: 'Partial payment', created_by: 'Accountant', created_at: now() },
  { id: 'cp2', payment_number: 'CPY-2026-000002', customer_id: 'c2', date: today(), amount: 100000, payment_mode: 'Bank Transfer', reference_number: 'NEFT789', created_by: 'Accountant', created_at: now() },
];

const DEMO_SUPPLIER_PAYMENTS: SupplierPayment[] = [
  { id: 'sp1', payment_number: 'SPY-2026-000001', supplier_id: 's1', date: today(), amount: 75000, payment_mode: 'Bank Transfer', reference_number: 'NEFT456', created_by: 'Accountant', created_at: now() },
];

const DEMO_USERS: User[] = [
  { id: 'u1', full_name: 'Admin User', email: 'admin@balajiwashsand.com', phone: '9876543210', role: 'ADMIN', is_active: true, created_at: '2026-01-01' },
  { id: 'u2', full_name: 'Counter Operator', email: 'counter@balajiwashsand.com', phone: '9876543211', role: 'COUNTER_OPERATOR', is_active: true, created_at: '2026-01-01' },
  { id: 'u3', full_name: 'Accountant', email: 'accountant@balajiwashsand.com', phone: '9876543212', role: 'ACCOUNTANT', is_active: true, created_at: '2026-01-01' },
  { id: 'u4', full_name: 'Manager', email: 'manager@balajiwashsand.com', phone: '9876543213', role: 'MANAGER', is_active: true, created_at: '2026-01-01' },
];

const DEMO_AUDIT_LOGS: AuditLog[] = [
  { id: 'a1', user_id: 'u1', user_name: 'Admin User', action: 'CREATE', entity_type: 'Sale', entity_id: 'sale1', new_data: { slip: 'SAL-2026-000001' }, created_at: now() },
  { id: 'a2', user_id: 'u1', user_name: 'Admin User', action: 'CREATE', entity_type: 'Customer', entity_id: 'c1', new_data: { name: 'ABC Constructions' }, created_at: now() },
];

// Demo Cash & Bank Data
const DEMO_ACCOUNTS: CashBankAccount[] = [
  {
    id: 'acc1',
    account_name: 'Cash in Hand',
    account_type: 'CASH',
    balance: 150000,
    opening_balance: 150000,
    opening_balance_date: '2026-01-01',
    is_active: true,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'acc2',
    account_name: 'HDFC Current Account',
    account_type: 'BANK',
    balance: 2846370,
    opening_balance: 1000000,
    opening_balance_date: '2026-01-01',
    account_holder_name: 'Balaji Wash Sand',
    account_number: '501000123456',
    ifsc_code: 'HDFC0001234',
    bank_name: 'HDFC Bank',
    branch_name: 'Pune Main Branch',
    is_active: true,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'acc3',
    account_name: 'ICICI Savings Account',
    account_type: 'BANK',
    balance: 1520000,
    opening_balance: 500000,
    opening_balance_date: '2026-01-01',
    account_holder_name: 'Balaji Wash Sand',
    account_number: '001201234567',
    ifsc_code: 'ICIC0005678',
    bank_name: 'ICICI Bank',
    branch_name: 'Mumbai Central',
    is_active: true,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
];

const DEMO_TRANSACTIONS: CashBankTransaction[] = [
  {
    id: 'txn1',
    transaction_id: 'TXN-2026-000001',
    account_id: 'acc1',
    date: '2026-01-15',
    transaction_type: 'Add Money',
    mode: 'Adjustment',
    paid_amount: 0,
    received_amount: 150000,
    balance_after: 150000,
    notes: 'Opening balance',
    source_type: 'manual',
    created_by: 'Admin',
    created_at: '2026-01-15',
  },
  {
    id: 'txn2',
    transaction_id: 'TXN-2026-000002',
    account_id: 'acc2',
    date: '2026-01-15',
    transaction_type: 'Add Money',
    mode: 'Adjustment',
    paid_amount: 0,
    received_amount: 1000000,
    balance_after: 1000000,
    notes: 'Opening balance',
    source_type: 'manual',
    created_by: 'Admin',
    created_at: '2026-01-15',
  },
  {
    id: 'txn3',
    transaction_id: 'TXN-2026-000003',
    account_id: 'acc2',
    date: '2026-01-20',
    transaction_type: 'Payment In',
    party_type: 'customer',
    party_id: 'c1',
    party_name: 'ABC Constructions',
    mode: 'UPI',
    paid_amount: 0,
    received_amount: 500000,
    balance_after: 1500000,
    reference_no: 'UPI123456',
    source_type: 'customer_payment',
    source_id: 'cp1',
    created_by: 'Accountant',
    created_at: '2026-01-20',
  },
  {
    id: 'txn4',
    transaction_id: 'TXN-2026-000004',
    account_id: 'acc2',
    date: '2026-01-25',
    transaction_type: 'Payment Out',
    party_type: 'supplier',
    party_id: 's1',
    party_name: 'River Sand Co.',
    mode: 'Bank Transfer',
    paid_amount: 750000,
    received_amount: 0,
    balance_after: 750000,
    reference_no: 'NEFT789',
    source_type: 'supplier_payment',
    source_id: 'sp1',
    created_by: 'Accountant',
    created_at: '2026-01-25',
  },
  {
    id: 'txn5',
    transaction_id: 'TXN-2026-000005',
    account_id: 'acc2',
    date: '2026-02-01',
    transaction_type: 'Transfer In',
    mode: 'Bank Transfer',
    paid_amount: 0,
    received_amount: 2000000,
    balance_after: 2750000,
    notes: 'Transfer from ICICI',
    transfer_id: 'trf1',
    source_type: 'transfer',
    created_by: 'Admin',
    created_at: '2026-02-01',
  },
  {
    id: 'txn6',
    transaction_id: 'TXN-2026-000006',
    account_id: 'acc3',
    date: '2026-02-01',
    transaction_type: 'Transfer Out',
    mode: 'Bank Transfer',
    paid_amount: 2000000,
    received_amount: 0,
    balance_after: -500000,
    notes: 'Transfer to HDFC',
    transfer_id: 'trf1',
    source_type: 'transfer',
    created_by: 'Admin',
    created_at: '2026-02-01',
  },
];

const DEMO_TRANSFERS: Transfer[] = [
  {
    id: 'trf1',
    transfer_id: 'TRF-2026-000001',
    from_account_id: 'acc3',
    to_account_id: 'acc2',
    amount: 2000000,
    date: '2026-02-01',
    notes: 'Transfer from ICICI to HDFC',
    created_by: 'Admin',
    created_at: '2026-02-01',
  },
];

// ---- Store Hook ----
export function useStore() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>(DEMO_CUSTOMERS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(DEMO_SUPPLIERS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(DEMO_VEHICLES);
  const [materials, setMaterials] = useState<Material[]>(DEMO_MATERIALS);
  const [customerRates, setCustomerRates] = useState<CustomerRate[]>(DEMO_RATES);
  const [sales, setSales] = useState<Sale[]>(DEMO_SALES);
  const [purchases, setPurchases] = useState<PurchaseEntry[]>(DEMO_PURCHASES);
  const [expenses, setExpenses] = useState<Expense[]>(DEMO_EXPENSES);
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>(DEMO_CUSTOMER_PAYMENTS);
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(DEMO_SUPPLIER_PAYMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(DEMO_AUDIT_LOGS);
  const [users] = useState<User[]>(DEMO_USERS);
  const [cashBankAccounts, setCashBankAccounts] = useState<CashBankAccount[]>(DEMO_ACCOUNTS);
  const [cashBankTransactions, setCashBankTransactions] = useState<CashBankTransaction[]>(DEMO_TRANSACTIONS);
  const [transfers, setTransfers] = useState<Transfer[]>(DEMO_TRANSFERS);

  const [printerSettings] = useState<PrinterSettings>({
    printer_name: 'Thermal Printer',
    paper_size: '80mm',
    connection: 'USB',
    auto_print: false,
    copies: 1,
    show_logo: true,
    show_qr: false,
  });

  const [appSettings] = useState<AppSettings>({
    business_name: 'BALAJI WASH SAND',
    business_address: 'Plant Area, Pune, Maharashtra',
    business_phone: '+91 98765 43210',
    default_rate: 4500,
    currency: 'INR',
    unit: 'BRASS',
  });

  const login = useCallback((email: string, _password: string) => {
    const user = DEMO_USERS.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      setIsDemoMode(false);
      return true;
    }
    return false;
  }, []);

  const enterDemo = useCallback(() => {
    setCurrentUser({ id: 'demo', full_name: 'Demo User', email: 'demo@demo.com', phone: '', role: 'MANAGER', is_active: true, created_at: '' });
    setIsDemoMode(true);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsDemoMode(false);
  }, []);

  const addAuditLog = useCallback((action: string, entity_type: string, entity_id: string, old_data?: Record<string, unknown>, new_data?: Record<string, unknown>, reason?: string) => {
    if (!currentUser) return;
    setAuditLogs(prev => [{
      id: uid(),
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      action,
      entity_type,
      entity_id,
      old_data,
      new_data,
      reason,
      created_at: now(),
    }, ...prev]);
  }, [currentUser]);

  // Customer operations
  const addCustomer = useCallback((data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    const c: Customer = { ...data, id: uid(), created_at: now(), updated_at: now() };
    setCustomers(prev => [c, ...prev]);
    addAuditLog('CREATE', 'Customer', c.id, undefined, { customer_name: c.customer_name });
    return c;
  }, [addAuditLog]);

  const updateCustomer = useCallback((id: string, data: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data, updated_at: now() } : c));
    addAuditLog('UPDATE', 'Customer', id, undefined, data);
  }, [addAuditLog]);

  // Supplier operations
  const addSupplier = useCallback((data: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
    const s: Supplier = { ...data, id: uid(), created_at: now(), updated_at: now() };
    setSuppliers(prev => [s, ...prev]);
    addAuditLog('CREATE', 'Supplier', s.id, undefined, { supplier_name: s.supplier_name });
    return s;
  }, [addAuditLog]);

  const updateSupplier = useCallback((id: string, data: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data, updated_at: now() } : s));
    addAuditLog('UPDATE', 'Supplier', id, undefined, data);
  }, [addAuditLog]);

  // Vehicle operations
  const addVehicle = useCallback((data: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => {
    const v: Vehicle = { ...data, id: uid(), created_at: now(), updated_at: now() };
    setVehicles(prev => [v, ...prev]);
    addAuditLog('CREATE', 'Vehicle', v.id, undefined, { vehicle_number: v.vehicle_number });
    return v;
  }, [addAuditLog]);

  // Material operations
  const addMaterial = useCallback((data: Omit<Material, 'id' | 'created_at' | 'updated_at'>) => {
    const m: Material = { ...data, id: uid(), created_at: now(), updated_at: now() };
    setMaterials(prev => [m, ...prev]);
    return m;
  }, []);

  // Rate operations
  const addRate = useCallback((data: Omit<CustomerRate, 'id' | 'created_at' | 'updated_at'>) => {
    const r: CustomerRate = { ...data, id: uid(), created_at: now(), updated_at: now() };
    setCustomerRates(prev => [r, ...prev]);
    addAuditLog('CREATE', 'CustomerRate', r.id, undefined, { rate: r.rate });
    return r;
  }, [addAuditLog]);

  // Sale operations
  const addSale = useCallback((data: Omit<Sale, 'id' | 'sale_slip_number' | 'created_at' | 'updated_at' | 'transaction_state' | 'print_count'>) => {
    const slipNum = generateSlipNumber('SAL', sales.map(s => s.sale_slip_number));
    const s: Sale = {
      ...data,
      id: uid(),
      sale_slip_number: slipNum,
      created_at: now(),
      updated_at: now(),
      transaction_state: 'FULFILLED',
      print_count: 0,
    };
    setSales(prev => [s, ...prev]);
    addAuditLog('CREATE', 'Sale', s.id, undefined, { slip_number: slipNum, total: s.total_amount });
    return s;
  }, [sales, addAuditLog]);

  const cancelSale = useCallback((id: string, reason: string) => {
    setSales(prev => prev.map(s => s.id === id ? { ...s, transaction_state: 'CANCELLED' as TransactionState, updated_at: now() } : s));
    addAuditLog('CANCEL', 'Sale', id, undefined, undefined, reason);
  }, [addAuditLog]);

  // Purchase operations
  const addPurchase = useCallback((data: Omit<PurchaseEntry, 'id' | 'purchase_slip_number' | 'created_at' | 'updated_at' | 'transaction_state' | 'print_count'>) => {
    const slipNum = generateSlipNumber('PUR', purchases.map(p => p.purchase_slip_number));
    const p: PurchaseEntry = {
      ...data,
      id: uid(),
      purchase_slip_number: slipNum,
      created_at: now(),
      updated_at: now(),
      transaction_state: 'FULFILLED',
      print_count: 0,
    };
    setPurchases(prev => [p, ...prev]);
    addAuditLog('CREATE', 'Purchase', p.id, undefined, { slip_number: slipNum });
    return p;
  }, [purchases, addAuditLog]);

  // Expense operations
  const addExpense = useCallback((data: Omit<Expense, 'id' | 'expense_number' | 'created_at' | 'updated_at' | 'transaction_state'>) => {
    const num = generateSlipNumber('EXP', expenses.map(e => e.expense_number));
    const e: Expense = {
      ...data,
      id: uid(),
      expense_number: num,
      created_at: now(),
      updated_at: now(),
      transaction_state: 'FULFILLED',
    };
    setExpenses(prev => [e, ...prev]);
    addAuditLog('CREATE', 'Expense', e.id, undefined, { amount: e.amount });
    return e;
  }, [expenses, addAuditLog]);

  // Payment operations
  const addCustomerPayment = useCallback((data: Omit<CustomerPayment, 'id' | 'payment_number' | 'created_at'>) => {
    const num = generateSlipNumber('CPY', customerPayments.map(p => p.payment_number));
    const p: CustomerPayment = { ...data, id: uid(), payment_number: num, created_at: now() };
    setCustomerPayments(prev => [p, ...prev]);
    addAuditLog('CREATE', 'CustomerPayment', p.id, undefined, { amount: p.amount });
    return p;
  }, [customerPayments, addAuditLog]);

  const addSupplierPayment = useCallback((data: Omit<SupplierPayment, 'id' | 'payment_number' | 'created_at'>) => {
    const num = generateSlipNumber('SPY', supplierPayments.map(p => p.payment_number));
    const p: SupplierPayment = { ...data, id: uid(), payment_number: num, created_at: now() };
    setSupplierPayments(prev => [p, ...prev]);
    addAuditLog('CREATE', 'SupplierPayment', p.id, undefined, { amount: p.amount });
    return p;
  }, [supplierPayments, addAuditLog]);

  // Computed values
  const getCustomerOutstanding = useCallback((customerId: string) => {
    const totalSales = sales.filter(s => s.customer_id === customerId && s.transaction_state === 'FULFILLED').reduce((sum, s) => sum + s.total_amount, 0);
    const totalPayments = customerPayments.filter(p => p.customer_id === customerId).reduce((sum, p) => sum + p.amount, 0);
    return totalSales - totalPayments;
  }, [sales, customerPayments]);

  const getSupplierOutstanding = useCallback((supplierId: string) => {
    const totalPurchases = purchases.filter(p => p.supplier_id === supplierId && p.transaction_state === 'FULFILLED').reduce((sum, p) => sum + p.total_amount, 0);
    const totalPayments = supplierPayments.filter(p => p.supplier_id === supplierId).reduce((sum, p) => sum + p.amount, 0);
    return totalPurchases - totalPayments;
  }, [purchases, supplierPayments]);

  const getApplicableRate = useCallback((customerId: string, materialId: string) => {
    const rate = customerRates.find(r =>
      r.customer_id === customerId &&
      r.material_id === materialId &&
      r.is_active &&
      new Date(r.effective_from) <= new Date() &&
      (!r.effective_to || new Date(r.effective_to) >= new Date())
    );
    return rate?.rate ?? appSettings.default_rate;
  }, [customerRates, appSettings.default_rate]);

  const getCustomerVehicles = useCallback((customerId: string) => {
    return vehicles.filter(v => v.customer_id === customerId && v.is_active);
  }, [vehicles]);

  const getSupplierVehicles = useCallback((supplierId: string) => {
    return vehicles.filter(v => v.supplier_id === supplierId && v.is_active);
  }, [vehicles]);

  // Cash & Bank operations
  const addCashBankAccount = useCallback((data: Omit<CashBankAccount, 'id' | 'created_at' | 'updated_at'>) => {
    const acc: CashBankAccount = { ...data, id: uid(), created_at: now(), updated_at: now() };
    setCashBankAccounts(prev => [...prev, acc]);
    addAuditLog('CREATE', 'CashBankAccount', acc.id, undefined, { account_name: acc.account_name });
    return acc;
  }, [addAuditLog]);

  const updateCashBankAccount = useCallback((id: string, data: Partial<CashBankAccount>) => {
    setCashBankAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, ...data, updated_at: now() } : acc));
    addAuditLog('UPDATE', 'CashBankAccount', id, undefined, data);
  }, [addAuditLog]);

  const deactivateCashBankAccount = useCallback((id: string) => {
    setCashBankAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, is_active: false, updated_at: now() } : acc));
    addAuditLog('DEACTIVATE', 'CashBankAccount', id, undefined, { is_active: false });
  }, [addAuditLog]);

  const addCashBankTransaction = useCallback((data: Omit<CashBankTransaction, 'id' | 'transaction_id' | 'created_at'>) => {
    const txnId = generateSlipNumber('TXN', cashBankTransactions.map(t => t.transaction_id));
    const txn: CashBankTransaction = { ...data, id: uid(), transaction_id: txnId, created_at: now() };
    setCashBankTransactions(prev => [...prev, txn]);
    
    // Update account balance
    const balanceChange = txn.received_amount - txn.paid_amount;
    setCashBankAccounts(prev => prev.map(acc => {
      if (acc.id === txn.account_id) {
        return { ...acc, balance: acc.balance + balanceChange, updated_at: now() };
      }
      return acc;
    }));
    
    addAuditLog('CREATE', 'CashBankTransaction', txn.id, undefined, { 
      transaction_id: txnId, 
      amount: balanceChange 
    });
    return txn;
  }, [cashBankTransactions, addAuditLog]);

  const addTransfer = useCallback((data: Omit<Transfer, 'id' | 'transfer_id' | 'created_at'>) => {
    const trfId = generateSlipNumber('TRF', transfers.map(t => t.transfer_id));
    const trf: Transfer = { ...data, id: uid(), transfer_id: trfId, created_at: now() };
    setTransfers(prev => [...prev, trf]);
    
    // Create transaction for source account (money out)
    const sourceTxn = addCashBankTransaction({
      account_id: data.from_account_id,
      date: data.date,
      transaction_type: 'Transfer Out',
      mode: 'Bank Transfer',
      paid_amount: data.amount,
      received_amount: 0,
      balance_after: 0, // Will be calculated
      notes: data.notes,
      transfer_id: trfId,
      source_type: 'transfer',
      created_by: data.created_by,
    });
    
    // Create transaction for destination account (money in)
    const destTxn = addCashBankTransaction({
      account_id: data.to_account_id,
      date: data.date,
      transaction_type: 'Transfer In',
      mode: 'Bank Transfer',
      paid_amount: 0,
      received_amount: data.amount,
      balance_after: 0, // Will be calculated
      notes: data.notes,
      transfer_id: trfId,
      source_type: 'transfer',
      created_by: data.created_by,
    });
    
    addAuditLog('CREATE', 'Transfer', trf.id, undefined, { 
      transfer_id: trfId, 
      amount: data.amount,
      from: data.from_account_id,
      to: data.to_account_id
    });
    
    return { transfer: trf, sourceTxn, destTxn };
  }, [transfers, addCashBankTransaction, addAuditLog]);

  const getAccountBalance = useCallback((accountId: string) => {
    const account = cashBankAccounts.find(acc => acc.id === accountId);
    return account?.balance || 0;
  }, [cashBankAccounts]);

  const getTotalBalance = useCallback(() => {
    return cashBankAccounts
      .filter(acc => acc.is_active)
      .reduce((sum, acc) => sum + acc.balance, 0);
  }, [cashBankAccounts]);

  const getAccountTransactions = useCallback((accountId: string) => {
    return cashBankTransactions
      .filter(txn => txn.account_id === accountId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [cashBankTransactions]);

  return {
    currentUser, isDemoMode, login, enterDemo, logout,
    customers, suppliers, vehicles, materials, customerRates,
    sales, purchases, expenses, customerPayments, supplierPayments,
    auditLogs, users, printerSettings, appSettings,
    cashBankAccounts, cashBankTransactions, transfers,
    addCustomer, updateCustomer, addSupplier, updateSupplier,
    addVehicle, addMaterial, addRate,
    addSale, cancelSale, addPurchase, addExpense,
    addCustomerPayment, addSupplierPayment,
    addCashBankAccount, updateCashBankAccount, deactivateCashBankAccount,
    addCashBankTransaction, addTransfer,
    getCustomerOutstanding, getSupplierOutstanding,
    getApplicableRate, getCustomerVehicles, getSupplierVehicles,
    getAccountBalance, getTotalBalance, getAccountTransactions,
  };
}

export type Store = ReturnType<typeof useStore>;
