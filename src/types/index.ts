// ============================================
// BALAJI WASH SAND ERP - Type Definitions
// ============================================

export type UserRole = 'ADMIN' | 'COUNTER_OPERATOR' | 'ACCOUNTANT' | 'MANAGER';
export type TransactionState = 'ACTIVE' | 'CANCELLED' | 'VOID';
export type PaymentMode = 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Other';
export type PaperSize = '58mm' | '80mm';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  customer_name: string;
  mobile: string;
  alternate_mobile?: string;
  address: string;
  gstin?: string;
  contact_person?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  supplier_name: string;
  mobile: string;
  alternate_mobile?: string;
  address: string;
  gstin?: string;
  contact_person?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  vehicle_number: string;
  vehicle_type: string;
  owner_name: string;
  customer_id?: string;
  supplier_id?: string;
  driver_name: string;
  driver_mobile?: string;
  capacity?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  material_name: string;
  category: string;
  unit: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerRate {
  id: string;
  customer_id: string;
  material_id: string;
  rate: number;
  unit: string;
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  sale_slip_number: string;
  date: string;
  time: string;
  customer_id: string;
  vehicle_id: string;
  driver_name: string;
  material_id: string;
  quantity_brass: number;
  rate: number;
  total_amount: number;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  transaction_state: TransactionState;
  print_count: number;
  first_printed_at?: string;
  last_printed_at?: string;
}

export interface PurchaseEntry {
  id: string;
  purchase_slip_number: string;
  date: string;
  time: string;
  supplier_id: string;
  vehicle_id: string;
  driver_name: string;
  material_id: string;
  quantity_brass: number;
  rate: number;
  total_amount: number;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  transaction_state: TransactionState;
  print_count: number;
}

export interface Expense {
  id: string;
  expense_number: string;
  date: string;
  time: string;
  category: string;
  description_of_work: string;
  work_area: string;
  vendor_or_person: string;
  paid_by: string;
  payment_mode: PaymentMode;
  amount: number;
  notes?: string;
  attachment_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  transaction_state: TransactionState;
}

export interface CustomerPayment {
  id: string;
  payment_number: string;
  customer_id: string;
  date: string;
  amount: number;
  payment_mode: PaymentMode;
  reference_number?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface SupplierPayment {
  id: string;
  payment_number: string;
  supplier_id: string;
  date: string;
  amount: number;
  payment_mode: PaymentMode;
  reference_number?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  reason?: string;
  created_at: string;
}

export interface LedgerEntry {
  date: string;
  reference_no: string;
  type: 'Sale' | 'Purchase' | 'Customer Payment' | 'Supplier Payment';
  description: string;
  vehicle?: string;
  material?: string;
  qty_brass?: number;
  debit: number;
  credit: number;
  balance: number;
}

export interface PrinterSettings {
  printer_name: string;
  paper_size: PaperSize;
  connection: string;
  auto_print: boolean;
  copies: number;
  show_logo: boolean;
  show_qr: boolean;
}

export interface AppSettings {
  business_name: string;
  business_address: string;
  business_phone: string;
  default_rate: number;
  currency: string;
  unit: string;
}
