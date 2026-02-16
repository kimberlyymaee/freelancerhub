# FreelanceHub — Development Plan

> A personal freelance business management system for tracking clients, projects, time, invoices, expenses, and Philippine tax obligations (8% flat rate and graduated rates).

---

## Project Overview

**What this is:** A single-user web app for a freelance software engineer based in the Philippines. It replaces scattered spreadsheets, invoice tools, and mental math with one clean system.

**Who it's for:** Single user (the freelancer). Not multi-tenant. Not a SaaS product (yet).

**Core modules:** Dashboard, Clients, Projects, Time Tracking, Invoicing, Expenses, Tax Calculation (PH 8% vs. Graduated), Settings.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16 (App Router) | Turbopack default, React 19.2, async params, `proxy.ts` replaces middleware |
| Styling | Tailwind CSS + shadcn/ui | Consistent design system, fast to build |
| Backend | Next.js Route Handlers + Supabase | No separate backend server |
| Bundler | Turbopack (stable, default) | No flags needed. FS caching stable in 16.1 |
| Database | Supabase (PostgreSQL) | RLS, real-time, auth built-in |
| Auth | Supabase Auth | Email/password + magic link |
| File Storage | Supabase Storage | Receipts, contracts, attachments |
| Hosting | Vercel | Zero-config deploys |
| PDF Generation | @react-pdf/renderer or jsPDF | Client-side invoice PDF generation |

### Next.js 16 Specifics to Follow

- **Turbopack is the default bundler.** Do not add `--turbopack` flags. Just use `next dev` and `next build`.
- **`proxy.ts` replaces `middleware.ts`.** Auth redirects and route protection go here. Runs on Node.js runtime. Export a `proxy` function, not `middleware`.
- **All route params and searchParams are async.** Every dynamic page must `await params` before accessing route data.
- **Cache Components with `"use cache"` directive.** Caching is opt-in, not implicit. Use it on dashboard summaries, client lists, and tax computation results where appropriate.
- **React Compiler is stable but opt-in.** Enable `reactCompiler: true` in `next.config.ts` if desired.

---

## Project Structure

```
freelancehub/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # Sidebar layout wrapper
│   │   ├── page.tsx                    # Dashboard home
│   │   ├── clients/
│   │   │   ├── page.tsx               # Client list
│   │   │   ├── [id]/page.tsx          # Client detail (async params)
│   │   │   └── new/page.tsx           # New client form
│   │   ├── projects/
│   │   │   ├── page.tsx               # Project list
│   │   │   └── [id]/page.tsx          # Project detail (async params)
│   │   ├── time/page.tsx              # Time tracking
│   │   ├── invoices/
│   │   │   ├── page.tsx               # Invoice list
│   │   │   ├── [id]/page.tsx          # Invoice detail (async params)
│   │   │   └── new/page.tsx           # Invoice builder
│   │   ├── expenses/
│   │   │   ├── page.tsx               # Expense list
│   │   │   └── new/page.tsx           # New expense form
│   │   ├── tax/page.tsx               # Tax calculator & summaries
│   │   └── settings/page.tsx          # Business profile & config
│   ├── api/                           # Route handlers if needed
│   └── globals.css
├── components/
│   ├── ui/                            # shadcn/ui components
│   ├── layout/                        # Sidebar, Header, Nav
│   ├── dashboard/                     # Dashboard widgets
│   ├── clients/                       # Client-specific components
│   ├── invoices/                      # Invoice builder, PDF template
│   ├── time/                          # Timer, timesheet components
│   ├── expenses/                      # Expense form, receipt viewer
│   └── tax/                           # Tax calculator, comparison, threshold bar
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # Supabase browser client
│   │   └── server.ts                  # Supabase server client
│   ├── utils.ts                       # Helpers, formatters
│   ├── types.ts                       # TypeScript interfaces
│   ├── constants.ts                   # Enums, defaults, tax brackets
│   └── tax.ts                         # Tax computation logic (8% and graduated)
├── proxy.ts                           # Replaces middleware.ts (Node.js runtime)
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── supabase/
    ├── migrations/                    # SQL migration files
    └── seed.sql                       # Sample data for dev
```

---

## Database Schema

All tables use UUIDs as primary keys, include `created_at` and `updated_at` timestamps, and are scoped to the authenticated user via Supabase Row Level Security (RLS).

### profiles
```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text,
  full_name text,
  email text,
  phone text,
  address text,
  logo_url text,
  tax_id_tin text,
  default_currency text default 'PHP',
  default_hourly_rate numeric(10,2),
  tax_regime text default 'eight_percent' check (tax_regime in ('eight_percent', 'graduated')),
  vat_threshold numeric(12,2) default 3000000,
  tax_exemption_amount numeric(12,2) default 250000,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### clients
```sql
create table clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  address text,
  status text default 'active' check (status in ('active', 'on_hold', 'completed', 'prospect')),
  tags text[] default '{}',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### projects
```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references clients(id) on delete set null,
  name text not null,
  type text default 'hourly' check (type in ('fixed', 'hourly', 'retainer')),
  rate numeric(10,2),
  estimated_hours numeric(8,2),
  deadline date,
  status text default 'not_started' check (status in ('not_started', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### time_entries
```sql
create table time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade not null,
  date date not null default current_date,
  hours numeric(6,2) not null,
  description text,
  is_billable boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### invoices
```sql
create table invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references clients(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  invoice_number text not null,
  status text default 'draft' check (status in ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled')),
  issue_date date not null default current_date,
  due_date date,
  subtotal numeric(12,2) default 0,
  tax_rate numeric(5,4) default 0,
  tax_amount numeric(12,2) default 0,
  total numeric(12,2) default 0,
  notes text,
  payment_terms text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### invoice_items
```sql
create table invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade not null,
  description text not null,
  quantity numeric(10,2) default 1,
  unit_price numeric(12,2) not null,
  amount numeric(12,2) not null,
  created_at timestamptz default now()
);
```

### payments
```sql
create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  invoice_id uuid references invoices(id) on delete cascade not null,
  amount numeric(12,2) not null,
  date date not null default current_date,
  method text check (method in ('bank_transfer', 'cash', 'check', 'paypal', 'gcash', 'maya', 'wise', 'other')),
  reference_note text,
  created_at timestamptz default now()
);
```

### expenses
```sql
create table expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(12,2) not null,
  date date not null default current_date,
  category text not null,
  vendor text,
  description text,
  payment_method text,
  receipt_url text,
  is_tax_deductible boolean default true,
  project_id uuid references projects(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### expense_categories
```sql
create table expense_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);
```

### tax_estimates
```sql
create table tax_estimates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  year integer not null,
  quarter integer not null check (quarter between 1 and 4),
  gross_revenue numeric(12,2) default 0,
  total_expenses numeric(12,2) default 0,
  exemption_applied numeric(12,2) default 0,
  taxable_amount_8pct numeric(12,2) default 0,
  tax_due_8pct numeric(12,2) default 0,
  taxable_amount_graduated numeric(12,2) default 0,
  tax_due_graduated numeric(12,2) default 0,
  percentage_tax_due numeric(12,2) default 0,
  filing_deadline date,
  is_filed boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, year, quarter)
);
```

### RLS Policies

Apply to every table (except `profiles` which uses `id = auth.uid()`):

```sql
-- Example for clients table. Repeat pattern for all tables.
alter table clients enable row level security;

create policy "Users can view own clients"
  on clients for select using (user_id = auth.uid());

create policy "Users can insert own clients"
  on clients for insert with check (user_id = auth.uid());

create policy "Users can update own clients"
  on clients for update using (user_id = auth.uid());

create policy "Users can delete own clients"
  on clients for delete using (user_id = auth.uid());
```

### Default Expense Categories (Seed Data)

Insert these on first user setup:
- Software / SaaS
- Hardware / Equipment
- Office Supplies
- Travel
- Meals & Entertainment
- Professional Services
- Outsourcing / Contractors
- Marketing
- Internet & Telecom
- Other

---

## Tax Calculation Logic

### Philippine 8% Income Tax Rate (TRAIN Law)

**Eligibility:** Self-employed individual, non-VAT registered, gross sales/receipts under 3,000,000 PHP annually.

**Formula:**
```
Tax Due = (Gross Sales/Receipts - 250,000) × 8%
```

- The 250,000 PHP exemption applies once per year (applied in Q1).
- No expense deductions allowed under this regime.
- Replaces both income tax and percentage tax (no need to file BIR Form 2551Q).
- Filed quarterly via BIR Form 1701Q and annually via Form 1701A.

**Quarterly computation is cumulative:**
- Q1: (YTD Revenue - 250,000) × 8%
- Q2: (YTD Revenue - 250,000) × 8% - Q1 tax paid
- Q3: (YTD Revenue - 250,000) × 8% - (Q1 + Q2 tax paid)
- Annual: (Full Year Revenue - 250,000) × 8% - (Q1 + Q2 + Q3 tax paid)

### Graduated Income Tax Rates (TRAIN Law 2025)

| Taxable Income Bracket | Tax Rate |
|----------------------|----------|
| 0 - 250,000 | 0% |
| 250,001 - 400,000 | 15% of excess over 250,000 |
| 400,001 - 800,000 | 22,500 + 20% of excess over 400,000 |
| 800,001 - 2,000,000 | 102,500 + 25% of excess over 800,000 |
| 2,000,001 - 8,000,000 | 402,500 + 30% of excess over 2,000,000 |
| Over 8,000,000 | 2,202,500 + 35% of excess over 8,000,000 |

**Under graduated rates:**
- Taxable income = Gross Revenue - Allowable Business Expenses (or 40% OSD)
- Expenses include: outsourcing/contractor payments, software, hardware, travel, etc.
- Additionally owes 3% Percentage Tax on gross sales (BIR Form 2551Q)
- Total tax = Graduated Income Tax + 3% Percentage Tax

### Comparison Calculator Logic

The `/tax` page shows both computations side by side using actual data from the app:

```typescript
// lib/tax.ts

interface TaxComparison {
  grossRevenue: number;
  totalExpenses: number;

  // 8% regime
  exemption8Pct: number;        // 250,000
  taxableAmount8Pct: number;    // grossRevenue - 250,000
  taxDue8Pct: number;           // taxableAmount8Pct * 0.08
  percentageTax8Pct: number;    // 0 (included in 8%)
  totalTax8Pct: number;         // same as taxDue8Pct

  // Graduated regime
  taxableAmountGraduated: number; // grossRevenue - totalExpenses
  incomeTaxGraduated: number;     // from bracket table
  percentageTaxGraduated: number; // grossRevenue * 0.03
  totalTaxGraduated: number;      // incomeTaxGraduated + percentageTaxGraduated

  // Result
  recommendation: 'eight_percent' | 'graduated';
  savings: number;
}
```

### Filing Deadlines

| Period | Form | Deadline |
|--------|------|----------|
| Q1 (Jan-Mar) | 1701Q | May 15 |
| Q2 (Apr-Jun) | 1701Q | August 15 |
| Q3 (Jul-Sep) | 1701Q | November 15 |
| Annual | 1701A | April 15 (following year) |

### VAT Threshold Warning

When cumulative gross revenue for the year approaches 3,000,000 PHP:
- At 80% (2,400,000): Show yellow warning on dashboard
- At 90% (2,700,000): Show red warning on dashboard and tax page
- At 100%: Alert that 8% option is no longer available, must register for VAT

---

## Development Phases

Each phase is self-contained and reviewable. Complete and review one phase before starting the next.

---

### PHASE 1: Foundation (Week 1-2)

**Goal:** Working app shell with auth, navigation, settings, and client management.

#### Task 1.1 — Project Scaffolding

- [ ] Initialize Next.js 16 project: `npx create-next-app@latest freelancehub`
- [ ] Confirm Turbopack is default (no flags needed)
- [ ] Install dependencies:
  - `@supabase/supabase-js`, `@supabase/ssr`
  - `tailwindcss`, `@tailwindcss/forms`, `@tailwindcss/typography`
  - `shadcn/ui` (init and add core components: Button, Input, Card, Table, Dialog, Select, Badge, Tabs, DropdownMenu, Sheet, Separator, Label, Textarea, Toast)
  - `lucide-react` (icons)
  - `date-fns` (date formatting)
  - `zod` (form validation)
  - `react-hook-form` + `@hookform/resolvers`
- [ ] Configure `next.config.ts` (no special Turbopack config needed)
- [ ] Set up environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Create Supabase clients:
  - `lib/supabase/client.ts` — browser client using `createBrowserClient`
  - `lib/supabase/server.ts` — server client using `createServerClient` with cookies
- [ ] Create `lib/types.ts` with all TypeScript interfaces matching the database schema
- [ ] Create `lib/constants.ts` with enums (statuses, payment methods, expense categories, tax brackets)

#### Task 1.2 — Database Setup

- [ ] Create Supabase project
- [ ] Write migration files for all tables (see schema above)
- [ ] Apply RLS policies for every table
- [ ] Create `supabase/seed.sql` with:
  - Default expense categories
  - 2-3 sample clients
  - 1-2 sample projects
  - A few sample time entries, invoices, expenses
- [ ] Test that RLS blocks cross-user access

#### Task 1.3 — Authentication

- [ ] Create `proxy.ts` in project root:
  - Redirect unauthenticated users to `/login`
  - Redirect authenticated users away from `/login` and `/signup` to `/`
  - Refresh Supabase session
- [ ] Build `/login` page:
  - Email + password login
  - Magic link option
  - Link to signup
  - Error handling and loading states
- [ ] Build `/signup` page:
  - Email + password registration
  - Auto-create `profiles` row on signup (use Supabase trigger or client-side)
  - Redirect to dashboard after signup
- [ ] Create auth utility functions: `getUser()`, `signOut()`, `signIn()`, `signUp()`

#### Task 1.4 — Layout and Navigation

- [ ] Build `(dashboard)/layout.tsx`:
  - Responsive sidebar (collapsible on mobile using Sheet component)
  - Navigation links: Dashboard, Clients, Projects, Time, Invoices, Expenses, Tax, Settings
  - Active link highlighting based on current route
  - User avatar/name at bottom with sign-out option
  - Icons from lucide-react for each nav item
- [ ] Make sidebar responsive:
  - Desktop: persistent sidebar (240px width)
  - Mobile: hamburger menu that opens Sheet overlay

#### Task 1.5 — Settings Page

- [ ] Build `/settings` page with form sections:
  - **Business Profile:** business name, full name, email, phone, address, logo upload (Supabase Storage), TIN
  - **Default Rates:** default hourly rate, default currency (PHP default, support USD)
  - **Tax Settings:** tax regime toggle (8% flat vs. graduated), VAT threshold display (3M), quarterly filing reminder toggle
  - **Invoice Template:** default payment terms text, default notes/footer text
  - **Expense Categories:** list with add/edit/delete functionality
- [ ] Use `react-hook-form` + `zod` for validation
- [ ] Save to `profiles` table and `expense_categories` table
- [ ] Toast notifications on save success/failure

#### Task 1.6 — Client Management (CRUD)

- [ ] Build `/clients` page:
  - Table/list view with columns: company name, contact, status, total revenue (calculated), actions
  - Search bar (filter by company name or contact name)
  - Status filter tabs or dropdown (All, Active, On Hold, Completed, Prospect)
  - "New Client" button
  - Click row to navigate to detail page
- [ ] Build `/clients/new` page:
  - Form: company name (required), contact name, email, phone, address, status, tags (multi-select or comma-separated), notes
  - Validate with zod
  - Save and redirect to client detail page
- [ ] Build `/clients/[id]` page:
  - Client info card (editable inline or via edit mode)
  - Tabs or sections for: Associated Projects, Invoices, Payments, Activity
  - Total revenue from this client (sum of paid invoices)
  - Edit and Delete actions (delete with confirmation dialog)
- [ ] Remember: `[id]/page.tsx` must use `async params` — `const { id } = await params;`

#### Phase 1 Review Checklist

- [ ] Can sign up, log in, log out
- [ ] Unauthenticated users are redirected to login
- [ ] Sidebar navigation works on desktop and mobile
- [ ] Settings page saves and loads business profile
- [ ] Can create, view, edit, and delete clients
- [ ] Client list is searchable and filterable
- [ ] RLS confirmed working (data scoped to user)

---

### PHASE 2: Core Features (Week 3-4)

**Goal:** Project tracking, time logging, expense management, tax calculator, and a functional dashboard.

#### Task 2.1 — Project CRUD

- [ ] Build `/projects` page:
  - Table with columns: project name, client, type, status, hours logged, total billed
  - Filter by status
  - "New Project" button (can also be a dialog/modal)
- [ ] Project creation form (page or modal):
  - Name (required), client (dropdown from clients table), type (fixed/hourly/retainer), rate, estimated hours, deadline, status, description
  - If client is selected, auto-suggest the default rate from settings
- [ ] Build `/projects/[id]` page:
  - Project info card (editable)
  - Time entries list for this project
  - Financial summary: total hours, total billed, remaining budget, % complete
  - Quick "Log Time" action from this page

#### Task 2.2 — Time Tracking

- [ ] Build `/time` page with two modes:
  - **Manual entry:** date, project (dropdown), hours, description, billable toggle. Quick-add form at top of page.
  - **Timer:** start/stop button that calculates elapsed time. On stop, opens a form pre-filled with the duration to save as a time entry.
- [ ] Weekly/monthly timesheet view:
  - Calendar or table view showing hours per day
  - Filter by project
  - Totals per day/week/month
- [ ] Timer state management:
  - Store timer start time in localStorage (persists across page navigations)
  - Show running timer in sidebar or header
  - Timer does not need to persist across browser sessions (nice-to-have for post-MVP)

#### Task 2.3 — Expense Tracking

- [ ] Build `/expenses` page:
  - Table with columns: date, description, category, vendor, amount, receipt (icon if attached), tax-deductible flag
  - Filter by category, date range, tax-deductible status
  - Monthly totals by category (summary cards at top)
- [ ] Build `/expenses/new` page:
  - Form: amount (required), date, category (dropdown from expense_categories), vendor, description, payment method, receipt upload (Supabase Storage), tax-deductible checkbox, project (optional dropdown)
  - Receipt upload: accept image files (jpg, png) and PDF. Show thumbnail preview.
- [ ] Receipt storage:
  - Upload to Supabase Storage bucket `receipts`
  - Store the public URL in `receipt_url` column
  - Display receipt in a modal/lightbox from the expense list

#### Task 2.4 — Tax Calculation Module

- [ ] Create `lib/tax.ts` with pure functions:
  - `calculate8PercentTax(grossRevenue: number, exemption?: number): TaxResult`
  - `calculateGraduatedTax(netTaxableIncome: number): TaxResult`
  - `calculatePercentageTax(grossRevenue: number): number` — 3% of gross
  - `compareTaxRegimes(grossRevenue: number, totalExpenses: number): TaxComparison`
  - `getQuarterFromDate(date: Date): 1 | 2 | 3 | 4`
  - `getQuarterDeadline(year: number, quarter: number): Date`
  - `getVatThresholdStatus(grossRevenue: number, threshold?: number): { percentage: number, level: 'safe' | 'warning' | 'danger' }`
- [ ] Build `/tax` page with sections:
  - **Current Year Summary:** total gross revenue YTD, total expenses YTD, current quarter
  - **8% vs. Graduated Comparison:** side-by-side cards showing both computations with the user's actual data. Highlight which one saves more. Allow toggling "what if" scenarios (manually adjust revenue or expense amounts to see projected impact).
  - **Quarterly Breakdown:** table showing each quarter — gross revenue, tax due (under current regime), filing deadline, filed status
  - **VAT Threshold Tracker:** progress bar showing current gross vs. 3M limit
  - **Filing Deadlines:** upcoming deadlines with countdown
- [ ] Tax data is computed on-the-fly from `invoices` (paid) and `expenses` tables, not stored unless the user explicitly "saves" a quarterly estimate to `tax_estimates`.

#### Task 2.5 — Dashboard

- [ ] Build `(dashboard)/page.tsx` with widget components:
  - **Revenue Card:** total revenue this month + this year, with % change from previous period
  - **Outstanding Invoices Card:** count + total amount of unpaid invoices
  - **Estimated Tax Due Card:** current quarter estimated tax (under selected regime)
  - **Expenses Card:** total expenses this month vs. previous month
  - **VAT Threshold Bar:** progress bar (only show if relevant, i.e., under 8% regime)
  - **Active Projects:** list of in-progress projects with status badges
  - **Recent Activity Feed:** last 10 actions (invoice created, payment received, expense logged, etc.) — query from multiple tables ordered by `created_at`
  - **Quick Actions:** buttons for New Invoice, Log Expense, Add Client, Log Time
- [ ] Use `"use cache"` directive on dashboard data fetching functions where appropriate
- [ ] Responsive grid: 2 columns on desktop for stat cards, single column on mobile

#### Phase 2 Review Checklist

- [ ] Can create projects and associate them with clients
- [ ] Can log time manually and with the timer
- [ ] Time entries show up on project detail page
- [ ] Can log expenses with receipt uploads
- [ ] Receipts are viewable from expense list
- [ ] Tax page shows accurate 8% and graduated calculations using real invoice/expense data
- [ ] Tax comparison clearly shows which regime is cheaper
- [ ] VAT threshold warning appears at 80% and 90%
- [ ] Dashboard shows real financial data from the database
- [ ] All CRUD operations have proper loading states and error handling

---

### PHASE 3: Invoicing and Polish (Week 5-6)

**Goal:** Full invoicing workflow with PDF export, payment tracking, and overall polish.

#### Task 3.1 — Invoice Creation

- [ ] Build `/invoices` page:
  - Table with columns: invoice number, client, issue date, due date, total, status, actions
  - Status tabs: All, Draft, Sent, Paid, Overdue
  - Overdue detection: auto-flag invoices past due_date that aren't paid
- [ ] Build `/invoices/new` page — the invoice builder:
  - **Header section:** auto-populated business info from settings, client dropdown (loads client address/info)
  - **Invoice meta:** invoice number (auto-incremented with prefix, e.g., INV-2026-001), issue date, due date, payment terms
  - **Line items:** dynamic rows — description, quantity, unit price, amount (auto-calculated). Add/remove rows.
  - **Auto-populate option:** button to "Import from Time Entries" — select a project and date range, converts unbilled time entries into line items
  - **Totals:** subtotal (auto-sum), tax rate (optional input), tax amount (auto-calculated), total
  - **Notes/footer:** textarea for additional notes
  - **Actions:** Save as Draft, Save and Mark as Sent
- [ ] Invoice number auto-increment:
  - Query latest invoice number, parse the numeric part, increment
  - Prefix configurable in settings (default: "INV")
  - Format: `{PREFIX}-{YEAR}-{SEQUENCE}` e.g., INV-2026-001

#### Task 3.2 — Invoice Detail and PDF

- [ ] Build `/invoices/[id]` page:
  - Full invoice preview (styled to look like a real invoice document)
  - Business logo and info at top
  - Client info
  - Line items table
  - Totals
  - Payment history section (list of payments made against this invoice)
  - Status badge with ability to update (Draft → Sent → Paid, etc.)
  - Actions: Edit (if draft), Download PDF, Record Payment, Mark as Sent, Cancel
- [ ] PDF generation:
  - Use `@react-pdf/renderer` or `jsPDF` to generate a clean, professional PDF
  - Match the on-screen invoice layout
  - Include: business logo, business info, client info, invoice number, dates, line items, totals, payment terms, notes
  - Download as `{invoice_number}.pdf`

#### Task 3.3 — Payment Recording

- [ ] Payment recording modal/form (accessible from invoice detail page):
  - Amount (default to remaining balance), date, payment method (dropdown: Bank Transfer, Cash, Check, PayPal, GCash, Maya, Wise, Other), reference note
  - Support partial payments — show remaining balance after each payment
- [ ] Auto-update invoice status:
  - If total payments >= invoice total → status = "paid"
  - If total payments > 0 but < invoice total → show "Partially Paid" indicator
- [ ] Payment history on invoice detail: list all payments with date, amount, method

#### Task 3.4 — Recurring Invoices

- [ ] Add recurring invoice configuration (optional on invoice creation):
  - Frequency: monthly, quarterly
  - Auto-generate next invoice based on template (copies line items)
  - Mark generated invoices as "Draft" for review before sending
- [ ] Simple implementation: cron-like check on dashboard load or via Supabase Edge Function

#### Task 3.5 — Polish and Refinement

- [ ] **Loading states:** skeleton loaders on all data-fetching pages
- [ ] **Error handling:** error boundaries, toast notifications for failed operations, form validation messages
- [ ] **Empty states:** friendly messaging when tables are empty ("No clients yet. Add your first client!")
- [ ] **Responsive design audit:** test all pages on mobile (375px), tablet (768px), desktop (1280px+)
- [ ] **Overdue invoice indicators:** red badge/highlight on dashboard and invoice list for overdue items
- [ ] **Data consistency:** when a client is deleted, confirm what happens to their projects/invoices (soft delete vs. cascade)
- [ ] **Optimistic updates:** for quick actions like status changes, use optimistic UI updates
- [ ] **Keyboard shortcuts:** (nice-to-have) N for new, / for search
- [ ] **Dark mode:** (nice-to-have) since we're using shadcn/ui, this is mostly toggling CSS variables

#### Phase 3 Review Checklist

- [ ] Can create invoices from scratch with line items
- [ ] Can auto-populate invoice from time entries
- [ ] Invoice numbers auto-increment correctly
- [ ] PDF export generates a clean, professional document
- [ ] Can record full and partial payments
- [ ] Invoice status updates automatically based on payments
- [ ] Overdue invoices are flagged on dashboard and invoice list
- [ ] All pages have loading states, error handling, and empty states
- [ ] App is responsive on mobile and desktop
- [ ] Full end-to-end workflow: client → project → time → invoice → payment → tax calculation

---

## MVP Success Criteria

The MVP is done when you can do this entire workflow:

1. Log in and see a dashboard with real financial data
2. Add a new client and create a project for them
3. Track time against the project (manual or timer)
4. Create an invoice from tracked time or manual line items
5. Export the invoice as a professional PDF
6. Record a payment and see the invoice marked as paid
7. Log a business expense with a receipt photo
8. View total revenue, expenses, and profit for the current month
9. See estimated 8% income tax due for the current quarter and year-to-date
10. Compare tax liability under 8% flat rate vs. graduated rates with expense deductions
11. Get a warning when gross sales approach the 3M PHP VAT threshold

---

## Post-MVP Roadmap

These are explicitly out of scope for the MVP:

- **BIR form auto-generation** — pre-filled 1701Q and 1701A for eBIR/eFPS filing
- **Email integration** — send invoices via Resend or SendGrid
- **Advanced tax reports** — P&L statements, annual summaries, CSV export
- **Contract management** — store SOWs and contracts with clients/projects
- **Client portal** — read-only view for clients to see invoices and pay
- **Stripe/PayMongo integration** — online invoice payments
- **Multi-currency** — automatic conversion rates for international clients
- **Recurring expenses** — auto-log monthly SaaS subscriptions
- **AI insights** — monthly summaries, profitability analysis, rate recommendations
- **Mobile PWA** — service worker for offline access
- **Zapier / webhooks** — connect to accounting tools, Slack notifications

---

## Conventions and Standards

### Code Style
- Use TypeScript strict mode throughout
- Prefer Server Components by default. Use `"use client"` only when needed (forms, interactive components, timers)
- Use `async/await` for all data fetching (no `.then()` chains)
- Use `zod` schemas that mirror database types for form validation
- Keep components small and focused. Extract reusable pieces into `components/`

### Naming
- Files: kebab-case (`invoice-builder.tsx`)
- Components: PascalCase (`InvoiceBuilder`)
- Functions/variables: camelCase (`calculateTax`)
- Database columns: snake_case (`created_at`)
- Constants/enums: UPPER_SNAKE_CASE or PascalCase object

### Data Fetching
- Server Components fetch data directly using Supabase server client
- Client Components use Server Actions or Route Handlers for mutations
- Use `"use cache"` on expensive computations (dashboard aggregations, tax calculations)
- Always handle loading and error states

### Forms
- Use `react-hook-form` + `zod` resolver for all forms
- Show inline validation errors
- Disable submit button while submitting
- Toast notification on success or failure

### Git
- Commit after each completed task
- Branch per phase: `phase-1-foundation`, `phase-2-core`, `phase-3-invoicing`
- PR and review at the end of each phase before merging to main
