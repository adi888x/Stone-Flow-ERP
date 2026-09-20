# BALAJI WASH SAND - ERP System

A complete, production-ready Enterprise Resource Planning (ERP) web application designed specifically for **Balaji Wash Sand** business operations.

## Overview

This ERP system manages the complete business workflow:
- **Sales / Outward**: Customer sales with thermal receipt printing
- **Raw Material Inward / Purchase**: Supplier purchases with receipt printing
- **Expenses**: Plant and operational expense tracking
- **Customer & Supplier Payments**: Payment recording and ledger management
- **Reports**: Comprehensive business reports with Excel/PDF export

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS 4 |
| Charts | Recharts |
| Routing | React Router DOM |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Excel Export | ExcelJS |
| PDF Export | jsPDF + jsPDF-AutoTable |
| Printing | ESC/POS via QZ Tray |
| Hosting | Cloudflare Pages (Free) |

## Key Features

### Business Rules
- All transactions in **₹ (INR)**
- All quantities in **BRASS**
- Default rate: ₹4,500/BRASS (configurable)
- Special customer rate: ₹4,200/BRASS (configurable per customer)
- Customer-specific rates with effective dates

### User Roles
| Role | Access |
|------|--------|
| **ADMIN** | Full access - create, edit, cancel, void, manage users, settings |
| **COUNTER_OPERATOR** | Create sales/purchases, view masters, print receipts |
| **ACCOUNTANT** | All transactions, payments, ledgers, reports, export |
| **MANAGER** | Dashboard, view transactions, reports, export |

### Transaction Flow

**SALE / OUTWARD:**
1. Select Customer → Only that customer's vehicles shown
2. Select Vehicle → Auto-fills driver
3. Select Material → Auto-loads applicable rate
4. Enter Quantity (BRASS) → Total auto-calculates
5. Preview receipt → Save → Print → Hand to operator

**PURCHASE / INWARD:**
1. Select Supplier → Only that supplier's vehicles shown
2. Select Vehicle → Auto-fills driver
3. Select Material → Enter rate
4. Enter Quantity (BRASS) → Total auto-calculates
5. Preview receipt → Save → Print → Hand to supplier

### Slip Number Format
- Sales: `SAL-YYYY-000001`
- Purchases: `PUR-YYYY-000001`
- Expenses: `EXP-YYYY-000001`
- Customer Payments: `CPY-YYYY-000001`
- Supplier Payments: `SPY-YYYY-000001`

All generated server-side using PostgreSQL sequences to prevent duplicates.

## Local Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd balaji-wash-sand-erp

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL migration from `supabase/migrations/001_initial.sql`
3. Enable Supabase Auth (Email provider)
4. Create storage bucket for expense attachments
5. Set up RLS policies (included in migration)

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

## Deployment (Cloudflare Pages - Free)

1. Push code to GitHub
2. Connect repository to Cloudflare Pages
3. Build settings:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy!

## Demo Account

The application includes a **DEMO MODE** accessible from the login page:
- Read-only access to all views
- Sample data pre-loaded
- No ability to create/edit/delete
- Clearly marked "DEMO MODE — READ ONLY"

### Demo Credentials
- Email: `admin@balajiwashsand.com`
- Password: `admin123`

## Thermal Printer Setup

### Windows Setup with QZ Tray

1. Download and install [QZ Tray](https://qz.io/)
2. Connect USB thermal printer
3. Install printer driver in Windows
4. Configure printer in ERP Settings page
5. Test print from Settings

### Supported Paper Sizes
- **58mm** (~2 inch) - Compact receipts
- **80mm** (~3 inch) - Standard receipts

### ESC/POS Commands
The system generates proper ESC/POS commands for:
- Text formatting (bold, alignment)
- Line spacing
- Paper cut
- Character encoding

## Database Schema

### Core Tables
- `profiles` - User profiles linked to Supabase Auth
- `customers` - Customer master data
- `suppliers` - Supplier master data
- `vehicles` - Vehicle master (linked to customer/supplier)
- `materials` - Material master data
- `customer_rates` - Customer-specific pricing
- `sales` - Sale/outward transactions
- `purchase_entries` - Purchase/inward transactions
- `expenses` - Plant expenses
- `customer_payments` - Customer payment records
- `supplier_payments` - Supplier payment records
- `audit_logs` - Complete audit trail
- `print_history` - Print tracking
- `app_settings` - Application configuration
- `printer_settings` - Printer configuration

### Key Relationships
- Customer 1→N Vehicles, Sales, Payments
- Supplier 1→N Vehicles, Purchases, Payments
- Material 1→N Sales, Purchases, Rates
- Vehicle belongs to Customer OR Supplier

### Outstanding Calculation
- Customer Outstanding = Total Sales - Total Customer Payments
- Supplier Outstanding = Total Purchases - Total Supplier Payments

## Security

- Supabase Auth for authentication
- Row Level Security (RLS) on all tables
- Role-based access control
- Admin-only editing of financial transactions
- Complete audit logging
- Server-side validation of all calculations
- No sensitive keys in frontend code

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+N | New transaction |
| Ctrl+F | Focus search |
| Ctrl+P | Print |
| Ctrl+S | Save |
| F5 | Refresh |
| Esc | Close modal |

## PWA / Mobile

The application is a Progressive Web App:
- Installable on Android (Add to Home Screen)
- Responsive layout for all screen sizes
- Touch-optimized interface
- Works offline for viewing cached data

## Infrastructure Cost: ₹0/month

| Service | Free Tier |
|---------|-----------|
| Supabase | 500MB DB, 1GB storage, 50K auth users |
| Cloudflare Pages | Unlimited bandwidth, 500 builds/month |
| QZ Tray | Open source, free |
| ExcelJS | MIT license, free |
| jsPDF | MIT license, free |

## Troubleshooting

### Printer not detected
- Ensure QZ Tray is running
- Check USB connection
- Verify printer driver installed
- Try test print from QZ Tray dashboard

### Duplicate slip numbers
- Should never happen (server-side generation)
- If occurs, check database sequence

### Demo mode limitations
- Demo mode is intentionally read-only
- Use admin account for full access

## License

Proprietary - Balaji Wash Sand

---

Built with ❤️ for Balaji Wash Sand
