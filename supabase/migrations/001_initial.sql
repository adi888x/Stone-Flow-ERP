-- ============================================
-- BALAJI WASH SAND ERP - Supabase Migration
-- Complete database schema with RLS policies
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- User Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'COUNTER_OPERATOR' CHECK (role IN ('ADMIN', 'COUNTER_OPERATOR', 'ACCOUNTANT', 'MANAGER')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  alternate_mobile TEXT,
  address TEXT,
  gstin TEXT,
  contact_person TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Suppliers
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  alternate_mobile TEXT,
  address TEXT,
  gstin TEXT,
  contact_person TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vehicles
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_number TEXT NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'Tipper',
  owner_name TEXT,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  driver_name TEXT NOT NULL,
  driver_mobile TEXT,
  capacity TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT vehicle_owner_check CHECK (
    (customer_id IS NOT NULL AND supplier_id IS NULL) OR
    (customer_id IS NULL AND supplier_id IS NOT NULL) OR
    (customer_id IS NULL AND supplier_id IS NULL)
  )
);

-- Materials
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Sand',
  unit TEXT NOT NULL DEFAULT 'BRASS',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customer Rates
CREATE TABLE customer_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  rate NUMERIC(12, 2) NOT NULL CHECK (rate > 0),
  unit TEXT NOT NULL DEFAULT 'BRASS',
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sequence counters for unique slip numbers
CREATE TABLE sequence_counters (
  prefix TEXT PRIMARY KEY,
  year INT NOT NULL,
  last_number INT NOT NULL DEFAULT 0
);

-- Sales
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_slip_number TEXT NOT NULL UNIQUE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  driver_name TEXT NOT NULL,
  material_id UUID NOT NULL REFERENCES materials(id),
  quantity_brass NUMERIC(10, 2) NOT NULL CHECK (quantity_brass > 0),
  rate NUMERIC(12, 2) NOT NULL CHECK (rate > 0),
  total_amount NUMERIC(14, 2) NOT NULL CHECK (total_amount > 0),
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  transaction_state TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (transaction_state IN ('ACTIVE', 'CANCELLED', 'VOID')),
  print_count INT NOT NULL DEFAULT 0,
  first_printed_at TIMESTAMPTZ,
  last_printed_at TIMESTAMPTZ,
  last_printed_by TEXT
);

-- Purchase Entries
CREATE TABLE purchase_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_slip_number TEXT NOT NULL UNIQUE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TEXT NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  driver_name TEXT NOT NULL,
  material_id UUID NOT NULL REFERENCES materials(id),
  quantity_brass NUMERIC(10, 2) NOT NULL CHECK (quantity_brass > 0),
  rate NUMERIC(12, 2) NOT NULL CHECK (rate > 0),
  total_amount NUMERIC(14, 2) NOT NULL CHECK (total_amount > 0),
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  transaction_state TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (transaction_state IN ('ACTIVE', 'CANCELLED', 'VOID')),
  print_count INT NOT NULL DEFAULT 0
);

-- Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_number TEXT NOT NULL UNIQUE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TEXT NOT NULL,
  category TEXT NOT NULL,
  description_of_work TEXT NOT NULL,
  work_area TEXT,
  vendor_or_person TEXT,
  paid_by TEXT NOT NULL,
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('Cash', 'UPI', 'Bank Transfer', 'Card', 'Other')),
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  notes TEXT,
  attachment_url TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  transaction_state TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (transaction_state IN ('ACTIVE', 'CANCELLED', 'VOID'))
);

-- Customer Payments
CREATE TABLE customer_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('Cash', 'UPI', 'Bank Transfer', 'Card', 'Other')),
  reference_number TEXT,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Supplier Payments
CREATE TABLE supplier_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_number TEXT NOT NULL UNIQUE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('Cash', 'UPI', 'Bank Transfer', 'Card', 'Other')),
  reference_number TEXT,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Print History
CREATE TABLE print_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  slip_number TEXT NOT NULL,
  printed_by TEXT NOT NULL,
  paper_size TEXT NOT NULL DEFAULT '80mm',
  printer_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- App Settings
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Printer Settings
CREATE TABLE printer_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  printer_name TEXT NOT NULL DEFAULT 'Thermal Printer',
  paper_size TEXT NOT NULL DEFAULT '80mm' CHECK (paper_size IN ('58mm', '80mm')),
  connection TEXT NOT NULL DEFAULT 'USB',
  auto_print BOOLEAN NOT NULL DEFAULT false,
  copies INT NOT NULL DEFAULT 1,
  show_logo BOOLEAN NOT NULL DEFAULT true,
  show_qr BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_sales_slip_number ON sales(sale_slip_number);
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_sales_vehicle_id ON sales(vehicle_id);
CREATE INDEX idx_sales_material_id ON sales(material_id);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_transaction_state ON sales(transaction_state);
CREATE INDEX idx_sales_created_at ON sales(created_at);

CREATE INDEX idx_purchases_slip_number ON purchase_entries(purchase_slip_number);
CREATE INDEX idx_purchases_supplier_id ON purchase_entries(supplier_id);
CREATE INDEX idx_purchases_vehicle_id ON purchase_entries(vehicle_id);
CREATE INDEX idx_purchases_date ON purchase_entries(date);
CREATE INDEX idx_purchases_transaction_state ON purchase_entries(transaction_state);

CREATE INDEX idx_expenses_number ON expenses(expense_number);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);

CREATE INDEX idx_customer_payments_customer ON customer_payments(customer_id);
CREATE INDEX idx_customer_payments_date ON customer_payments(date);

CREATE INDEX idx_supplier_payments_supplier ON supplier_payments(supplier_id);
CREATE INDEX idx_supplier_payments_date ON supplier_payments(date);

CREATE INDEX idx_vehicles_customer ON vehicles(customer_id);
CREATE INDEX idx_vehicles_supplier ON vehicles(supplier_id);
CREATE INDEX idx_vehicles_number ON vehicles(vehicle_number);

CREATE INDEX idx_customer_rates_customer ON customer_rates(customer_id);
CREATE INDEX idx_customer_rates_material ON customer_rates(material_id);
CREATE INDEX idx_customer_rates_effective ON customer_rates(effective_from, effective_to);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Unique constraint for active vehicle numbers
CREATE UNIQUE INDEX idx_vehicles_unique_active ON vehicles(vehicle_number) WHERE is_active = true;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Generate unique slip number
CREATE OR REPLACE FUNCTION generate_slip_number(p_prefix TEXT) RETURNS TEXT AS $$
DECLARE
  v_year INT;
  v_number INT;
  v_slip TEXT;
BEGIN
  v_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Lock and increment sequence
  INSERT INTO sequence_counters (prefix, year, last_number)
  VALUES (p_prefix, v_year, 1)
  ON CONFLICT (prefix, year) -- Need composite PK
  DO UPDATE SET last_number = sequence_counters.last_number + 1
  RETURNING last_number INTO v_number;
  
  -- If insert happened (no conflict), get the value
  IF v_number IS NULL THEN
    SELECT last_number INTO v_number FROM sequence_counters
    WHERE prefix = p_prefix AND year = v_year;
  END IF;
  
  v_slip := p_prefix || '-' || v_year || '-' || LPAD(v_number::TEXT, 6, '0');
  RETURN v_slip;
END;
$$ LANGUAGE plpgsql;

-- Fix sequence_counters to have composite primary key
ALTER TABLE sequence_counters DROP CONSTRAINT IF EXISTS sequence_counters_pkey;
ALTER TABLE sequence_counters ADD PRIMARY KEY (prefix, year);

-- Validate sale vehicle belongs to customer
CREATE OR REPLACE FUNCTION validate_sale_vehicle() RETURNS TRIGGER AS $$
DECLARE
  v_vehicle_customer UUID;
BEGIN
  SELECT customer_id INTO v_vehicle_customer FROM vehicles WHERE id = NEW.vehicle_id;
  IF v_vehicle_customer IS DISTINCT FROM NEW.customer_id THEN
    RAISE EXCEPTION 'Vehicle does not belong to the selected customer';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Validate purchase vehicle belongs to supplier
CREATE OR REPLACE FUNCTION validate_purchase_vehicle() RETURNS TRIGGER AS $$
DECLARE
  v_vehicle_supplier UUID;
BEGIN
  SELECT supplier_id INTO v_vehicle_supplier FROM vehicles WHERE id = NEW.vehicle_id;
  IF v_vehicle_supplier IS DISTINCT FROM NEW.supplier_id THEN
    RAISE EXCEPTION 'Vehicle does not belong to the selected supplier';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trg_validate_sale_vehicle
  BEFORE INSERT OR UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION validate_sale_vehicle();

CREATE TRIGGER trg_validate_purchase_vehicle
  BEFORE INSERT OR UPDATE ON purchase_entries
  FOR EACH ROW EXECUTE FUNCTION validate_purchase_vehicle();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_suppliers_updated BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_vehicles_updated BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_materials_updated BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customer_rates_updated BEFORE UPDATE ON customer_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_sales_updated BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_purchases_updated BEFORE UPDATE ON purchase_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_expenses_updated BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE printer_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_current_user_role() RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE auth_user_id = auth.uid() AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Policies: All authenticated users can read
CREATE POLICY "Authenticated users can read customers" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read suppliers" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read vehicles" ON vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read materials" ON materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read rates" ON customer_rates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read sales" ON sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read purchases" ON purchase_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read expenses" ON expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read customer payments" ON customer_payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read supplier payments" ON supplier_payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read settings" ON app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read printer settings" ON printer_settings FOR SELECT TO authenticated USING (true);

-- Insert policies for all roles
CREATE POLICY "All roles can insert sales" ON sales FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "All roles can insert purchases" ON purchase_entries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "All roles can insert expenses" ON expenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "All roles can insert customer payments" ON customer_payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "All roles can insert supplier payments" ON supplier_payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "All roles can insert customers" ON customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "All roles can insert suppliers" ON suppliers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "All roles can insert vehicles" ON vehicles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "All roles can insert materials" ON materials FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "All roles can insert rates" ON customer_rates FOR INSERT TO authenticated WITH CHECK (true);

-- Update policies - Only ADMIN can update transactions
CREATE POLICY "Admin can update sales" ON sales FOR UPDATE TO authenticated USING (get_current_user_role() = 'ADMIN');
CREATE POLICY "Admin can update purchases" ON purchase_entries FOR UPDATE TO authenticated USING (get_current_user_role() = 'ADMIN');
CREATE POLICY "Admin can update expenses" ON expenses FOR UPDATE TO authenticated USING (get_current_user_role() = 'ADMIN');
CREATE POLICY "Admin can update customer payments" ON customer_payments FOR UPDATE TO authenticated USING (get_current_user_role() = 'ADMIN');
CREATE POLICY "Admin can update supplier payments" ON supplier_payments FOR UPDATE TO authenticated USING (get_current_user_role() = 'ADMIN');

-- Admin can update masters
CREATE POLICY "Admin can update customers" ON customers FOR UPDATE TO authenticated USING (get_current_user_role() = 'ADMIN');
CREATE POLICY "Admin can update suppliers" ON suppliers FOR UPDATE TO authenticated USING (get_current_user_role() = 'ADMIN');
CREATE POLICY "Admin can update vehicles" ON vehicles FOR UPDATE TO authenticated USING (get_current_user_role() = 'ADMIN');
CREATE POLICY "Admin can update materials" ON materials FOR UPDATE TO authenticated USING (get_current_user_role() = 'ADMIN');
CREATE POLICY "Admin can update rates" ON customer_rates FOR UPDATE TO authenticated USING (get_current_user_role() = 'ADMIN');
CREATE POLICY "Admin can update profiles" ON profiles FOR UPDATE TO authenticated USING (get_current_user_role() = 'ADMIN');
CREATE POLICY "Admin can update settings" ON app_settings FOR UPDATE TO authenticated USING (get_current_user_role() = 'ADMIN');
CREATE POLICY "Admin can update printer settings" ON printer_settings FOR UPDATE TO authenticated USING (get_current_user_role() = 'ADMIN');

-- Audit logs - only admin can read
CREATE POLICY "Admin can read audit logs" ON audit_logs FOR SELECT TO authenticated USING (get_current_user_role() = 'ADMIN');
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Print history
CREATE POLICY "Authenticated can read print history" ON print_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert print history" ON print_history FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- SEED DATA
-- ============================================

-- Default app settings
INSERT INTO app_settings (key, value) VALUES
  ('business_name', 'BALAJI WASH SAND'),
  ('business_address', 'Plant Area, Pune, Maharashtra'),
  ('business_phone', '+91 98765 43210'),
  ('default_rate', '4500'),
  ('currency', 'INR'),
  ('unit', 'BRASS');

-- Default printer settings
INSERT INTO printer_settings (printer_name, paper_size, connection, auto_print, copies, show_logo, show_qr)
VALUES ('Thermal Printer', '80mm', 'USB', false, 1, true, false);

-- Default materials
INSERT INTO materials (material_name, category, unit, description) VALUES
  ('Wash Sand', 'Sand', 'BRASS', 'Premium quality washed sand for construction'),
  ('River Sand', 'Sand', 'BRASS', 'Natural river sand'),
  ('M-Sand', 'Sand', 'BRASS', 'Manufactured sand'),
  ('Stone Dust', 'Aggregate', 'BRASS', 'Crusher stone dust');

-- Initialize sequence counters
INSERT INTO sequence_counters (prefix, year, last_number) VALUES
  ('SAL', EXTRACT(YEAR FROM CURRENT_DATE)::INT, 0),
  ('PUR', EXTRACT(YEAR FROM CURRENT_DATE)::INT, 0),
  ('EXP', EXTRACT(YEAR FROM CURRENT_DATE)::INT, 0),
  ('CPY', EXTRACT(YEAR FROM CURRENT_DATE)::INT, 0),
  ('SPY', EXTRACT(YEAR FROM CURRENT_DATE)::INT, 0);

-- ============================================
-- VIEWS (for convenience)
-- ============================================

-- Customer outstanding view
CREATE OR REPLACE VIEW customer_outstanding AS
SELECT
  c.id,
  c.customer_name,
  COALESCE(SUM(s.total_amount) FILTER (WHERE s.transaction_state = 'ACTIVE'), 0) as total_sales,
  COALESCE(SUM(cp.amount), 0) as total_payments,
  COALESCE(SUM(s.total_amount) FILTER (WHERE s.transaction_state = 'ACTIVE'), 0) - COALESCE(SUM(cp.amount), 0) as outstanding,
  COALESCE(SUM(s.quantity_brass) FILTER (WHERE s.transaction_state = 'ACTIVE'), 0) as total_qty_brass
FROM customers c
LEFT JOIN sales s ON s.customer_id = c.id
LEFT JOIN customer_payments cp ON cp.customer_id = c.id
GROUP BY c.id, c.customer_name;

-- Supplier outstanding view
CREATE OR REPLACE VIEW supplier_outstanding AS
SELECT
  s.id,
  s.supplier_name,
  COALESCE(SUM(p.total_amount) FILTER (WHERE p.transaction_state = 'ACTIVE'), 0) as total_purchases,
  COALESCE(SUM(sp.amount), 0) as total_payments,
  COALESCE(SUM(p.total_amount) FILTER (WHERE p.transaction_state = 'ACTIVE'), 0) - COALESCE(SUM(sp.amount), 0) as outstanding,
  COALESCE(SUM(p.quantity_brass) FILTER (WHERE p.transaction_state = 'ACTIVE'), 0) as total_qty_brass
FROM suppliers s
LEFT JOIN purchase_entries p ON p.supplier_id = s.id
LEFT JOIN supplier_payments sp ON sp.supplier_id = s.id
GROUP BY s.id, s.supplier_name;
