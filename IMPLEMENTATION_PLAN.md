# FreelanceHub — Implementation Plan

> Step-by-step execution plan derived from `FREELANCEHUB_DEV_PLAN.md`.
> Each task is ordered by dependency — complete them top to bottom within each phase.

---

## Project Structure (Target)

```
freelancehub/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── clients/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── new/page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── time/page.tsx
│   │   ├── invoices/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── new/page.tsx
│   │   ├── expenses/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   ├── tax/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   └── globals.css
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── layout/              # Sidebar, Header, MobileNav
│   ├── dashboard/           # Stat cards, activity feed, quick actions
│   ├── clients/             # ClientForm, ClientCard, ClientTable
│   ├── invoices/            # InvoiceBuilder, InvoicePreview, PDFTemplate
│   ├── time/                # Timer, ManualEntry, TimesheetView
│   ├── expenses/            # ExpenseForm, ReceiptViewer
│   └── tax/                 # TaxComparison, ThresholdBar, QuarterTable
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # createBrowserClient
│   │   └── server.ts        # createServerClient (cookies)
│   ├── utils.ts             # formatCurrency, formatDate, cn()
│   ├── types.ts             # All DB-derived TypeScript interfaces
│   ├── constants.ts         # Enums, tax brackets, defaults
│   └── tax.ts               # Pure tax computation functions
├── proxy.ts                 # Auth routing (replaces middleware.ts)
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── supabase/
    ├── migrations/
    │   ├── 001_profiles.sql
    │   ├── 002_clients.sql
    │   ├── 003_projects.sql
    │   ├── 004_time_entries.sql
    │   ├── 005_invoices.sql
    │   ├── 006_invoice_items.sql
    │   ├── 007_payments.sql
    │   ├── 008_expenses.sql
    │   ├── 009_expense_categories.sql
    │   ├── 010_tax_estimates.sql
    │   └── 011_rls_policies.sql
    └── seed.sql
```

---

## PHASE 1: Foundation

**Branch:** `phase-1-foundation`
**Goal:** Working app shell with auth, navigation, settings, and client CRUD.

---

### Step 1.1 — Project Scaffolding

**What:** Initialize the Next.js 16 project and install all dependencies.

| # | Task | Details |
|---|------|---------|
| 1 | Initialize Next.js 16 | `npx create-next-app@latest freelancehub --typescript --tailwind --eslint --app --src=no` — Turbopack is default in v16, no flags needed |
| 2 | Install core dependencies | `npm i @supabase/supabase-js @supabase/ssr` |
| 3 | Install form/validation deps | `npm i zod react-hook-form @hookform/resolvers` |
| 4 | Install utility deps | `npm i date-fns lucide-react` |
| 5 | Initialize shadcn/ui | `npx shadcn@latest init` — select New York style, Zinc color, CSS variables |
| 6 | Add shadcn components | `npx shadcn@latest add button input card table dialog select badge tabs dropdown-menu sheet separator label textarea toast sonner` |
| 7 | Configure `next.config.ts` | No special Turbopack config needed. Add image domains for Supabase storage if needed |
| 8 | Create `.env.local` | Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (placeholder values until Supabase project is created) |

**Deliverable:** App runs with `npm run dev`, shadcn components importable, Tailwind functional.

---

### Step 1.2 — Core Library Files

**What:** Create the shared types, constants, and Supabase clients that everything else depends on.

| # | Task | File(s) | Details |
|---|------|---------|---------|
| 1 | Supabase browser client | `lib/supabase/client.ts` | Uses `createBrowserClient` from `@supabase/ssr` |
| 2 | Supabase server client | `lib/supabase/server.ts` | Uses `createServerClient` with `cookies()` from `next/headers` |
| 3 | TypeScript interfaces | `lib/types.ts` | Interfaces for all 10 tables: `Profile`, `Client`, `Project`, `TimeEntry`, `Invoice`, `InvoiceItem`, `Payment`, `Expense`, `ExpenseCategory`, `TaxEstimate` — match DB schema exactly |
| 4 | Constants & enums | `lib/constants.ts` | `CLIENT_STATUSES`, `PROJECT_STATUSES`, `PROJECT_TYPES`, `INVOICE_STATUSES`, `PAYMENT_METHODS`, `DEFAULT_EXPENSE_CATEGORIES`, `TAX_BRACKETS`, `FILING_DEADLINES` |
| 5 | Utility functions | `lib/utils.ts` | `cn()` (class merger), `formatCurrency(amount, currency)`, `formatDate(date)`, `generateInvoiceNumber(lastNumber)` |

**Deliverable:** All shared code ready for consumption by pages and components.

---

### Step 1.3 — Database Setup

**What:** Create all Supabase tables, RLS policies, and seed data.

| # | Task | Details |
|---|------|---------|
| 1 | Create Supabase project | Via Supabase dashboard — note URL and anon key |
| 2 | Update `.env.local` | Insert real `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| 3 | Write migration: profiles | `supabase/migrations/001_profiles.sql` — table + RLS (uses `id = auth.uid()`) |
| 4 | Write migration: clients | `supabase/migrations/002_clients.sql` — table + RLS |
| 5 | Write migration: projects | `supabase/migrations/003_projects.sql` — table + RLS |
| 6 | Write migration: time_entries | `supabase/migrations/004_time_entries.sql` — table + RLS |
| 7 | Write migration: invoices | `supabase/migrations/005_invoices.sql` — table + RLS |
| 8 | Write migration: invoice_items | `supabase/migrations/006_invoice_items.sql` — table + RLS |
| 9 | Write migration: payments | `supabase/migrations/007_payments.sql` — table + RLS |
| 10 | Write migration: expenses | `supabase/migrations/008_expenses.sql` — table + RLS |
| 11 | Write migration: expense_categories | `supabase/migrations/009_expense_categories.sql` — table + RLS |
| 12 | Write migration: tax_estimates | `supabase/migrations/010_tax_estimates.sql` — table + RLS |
| 13 | Write seed file | `supabase/seed.sql` — default expense categories, 2-3 sample clients, 1-2 projects, sample time entries, invoices, expenses |
| 14 | Apply migrations | Run via Supabase dashboard SQL editor or `supabase db push` |
| 15 | Create auto-profile trigger | DB function + trigger: on `auth.users` insert → auto-create `profiles` row |
| 16 | Create Supabase Storage bucket | Create `receipts` bucket for expense receipt uploads |
| 17 | Verify RLS | Test that unauthenticated requests and cross-user queries are blocked |

**Deliverable:** Fully provisioned database with RLS, seed data loadable.

---

### Step 1.4 — Authentication

**What:** Auth pages and route protection.

| # | Task | File(s) | Details |
|---|------|---------|---------|
| 1 | Auth utility functions | `lib/supabase/auth.ts` | `getUser()`, `signIn(email, password)`, `signUp(email, password)`, `signInWithMagicLink(email)`, `signOut()` |
| 2 | `proxy.ts` | `proxy.ts` (project root) | Replaces `middleware.ts`. Export `proxy` function. Redirect unauth → `/login`. Redirect auth → `/` from `/login` and `/signup`. Refresh Supabase session. |
| 3 | Login page | `app/(auth)/login/page.tsx` | Email+password form, magic link option, link to signup. Uses `react-hook-form` + `zod`. Loading states, error display. |
| 4 | Signup page | `app/(auth)/signup/page.tsx` | Email+password registration form. On success → redirect to dashboard. Profile auto-created via DB trigger (Step 1.3.15). |
| 5 | Auth layout | `app/(auth)/layout.tsx` | Centered card layout for auth pages — no sidebar |

**Deliverable:** Full auth flow working — signup, login (password + magic link), logout, route protection.

---

### Step 1.5 — Dashboard Layout & Navigation

**What:** Sidebar, header, and responsive shell for all dashboard pages.

| # | Task | File(s) | Details |
|---|------|---------|---------|
| 1 | Sidebar component | `components/layout/sidebar.tsx` | Nav links: Dashboard, Clients, Projects, Time, Invoices, Expenses, Tax, Settings. Lucide icons for each. Active link highlighting via `usePathname()`. User info + sign-out at bottom. Width: 240px fixed. |
| 2 | Mobile navigation | `components/layout/mobile-nav.tsx` | Hamburger button in header → Sheet overlay with same nav links. Uses shadcn `Sheet` component. |
| 3 | Header component | `components/layout/header.tsx` | Page title (dynamic), hamburger button (mobile only), running timer indicator (placeholder for Phase 2) |
| 4 | Dashboard layout | `app/(dashboard)/layout.tsx` | Fetches user session (redirect if none). Renders sidebar (desktop) + header + mobile nav + `{children}`. Responsive: sidebar hidden < 768px, hamburger visible. |

**Deliverable:** All dashboard routes render inside a consistent layout shell. Navigation works on desktop and mobile.

---

### Step 1.6 — Settings Page

**What:** Business profile configuration and expense category management.

| # | Task | File(s) | Details |
|---|------|---------|---------|
| 1 | Settings page | `app/(dashboard)/settings/page.tsx` | Server component — fetch profile data |
| 2 | Profile form component | `components/settings/profile-form.tsx` | `"use client"`. Sections: Business Profile (name, full_name, email, phone, address, TIN), Default Rates (hourly rate, currency), Tax Settings (regime toggle 8% vs graduated, VAT threshold display). Uses `react-hook-form` + `zod`. |
| 3 | Logo upload | Part of profile form | Upload to Supabase Storage `logos` bucket. Display current logo with option to replace. |
| 4 | Expense category manager | `components/settings/expense-categories.tsx` | `"use client"`. List current categories, add new, edit name, delete (with confirmation). Save to `expense_categories` table. |
| 5 | Invoice defaults section | Part of profile form | Default payment terms text, default notes/footer text — stored in `profiles` or a separate settings table. |
| 6 | Toast feedback | All form submissions | Success: "Settings saved". Error: "Failed to save — [reason]". Uses shadcn `Sonner` or `Toast`. |

**Deliverable:** User can configure their business profile, tax regime, default rates, and expense categories.

---

### Step 1.7 — Client Management (CRUD)

**What:** Full client list, creation, detail view, edit, and delete.

| # | Task | File(s) | Details |
|---|------|---------|---------|
| 1 | Client list page | `app/(dashboard)/clients/page.tsx` | Server component. Fetch clients. Render `ClientTable`. |
| 2 | Client table component | `components/clients/client-table.tsx` | `"use client"`. Columns: company name, contact, email, status (badge), actions (view/delete). Search bar filters by company/contact name. Status filter tabs (All, Active, On Hold, Completed, Prospect). Click row → navigate to `/clients/[id]`. |
| 3 | New client page | `app/(dashboard)/clients/new/page.tsx` | Renders `ClientForm` component. |
| 4 | Client form component | `components/clients/client-form.tsx` | `"use client"`. Fields: company_name (required), contact_name, email, phone, address, status (select), tags (comma-separated input), notes (textarea). Zod validation. On save → redirect to `/clients/[id]`. Reusable for create and edit. |
| 5 | Client detail page | `app/(dashboard)/clients/[id]/page.tsx` | Server component. `const { id } = await params;`. Fetch client + associated projects + invoices. Display client info card, associated data in tabs (Projects, Invoices, Payments). Edit button → inline edit mode or navigates to edit form. Delete with confirmation dialog. |
| 6 | Client card component | `components/clients/client-card.tsx` | Displays client info — company, contact, status badge, total revenue (calculated from paid invoices). |

**Deliverable:** Full client CRUD. Searchable/filterable list. Detail page with associated data.

---

### Phase 1 Verification Checklist

- [ ] `npm run dev` starts without errors
- [ ] Can sign up a new account
- [ ] Can log in with email/password
- [ ] Can log in with magic link
- [ ] Unauthenticated users redirected to `/login`
- [ ] Sidebar navigation works on desktop (persistent) and mobile (sheet overlay)
- [ ] Active nav link is highlighted
- [ ] Settings page loads profile data and saves changes
- [ ] Logo upload works
- [ ] Expense categories can be added/edited/deleted
- [ ] Client list page renders with search and status filters
- [ ] Can create a new client
- [ ] Client detail page shows client info
- [ ] Can edit and delete a client
- [ ] RLS prevents cross-user data access
- [ ] All forms show validation errors and loading states

**After verification:** PR `phase-1-foundation` → `main`, merge.

---

## PHASE 2: Core Features

**Branch:** `phase-2-core`
**Goal:** Projects, time tracking, expenses, tax calculator, and dashboard with real data.

---

### Step 2.1 — Project CRUD

**What:** Project list, creation, detail with time entries and financials.

| # | Task | File(s) | Details |
|---|------|---------|---------|
| 1 | Project list page | `app/(dashboard)/projects/page.tsx` | Server component. Fetch projects with client names (join). |
| 2 | Project table component | `components/projects/project-table.tsx` | `"use client"`. Columns: name, client, type (badge), status (badge), hours logged, total billed. Status filter. "New Project" button opens dialog/modal. |
| 3 | Project form component | `components/projects/project-form.tsx` | `"use client"`. Fields: name (required), client (dropdown from clients table), type (fixed/hourly/retainer), rate (auto-suggest from settings default_hourly_rate), estimated_hours, deadline (date picker), status, description. Zod validation. |
| 4 | Project detail page | `app/(dashboard)/projects/[id]/page.tsx` | `const { id } = await params;`. Project info card (editable). Time entries list for this project. Financial summary: total hours, total billed (hours × rate or fixed amount), remaining budget (estimated - actual), % complete. Quick "Log Time" button. |

**Deliverable:** Full project CRUD linked to clients. Financial summary per project.

---

### Step 2.2 — Time Tracking

**What:** Manual entry, timer, and timesheet view.

| # | Task | File(s) | Details |
|---|------|---------|---------|
| 1 | Time page | `app/(dashboard)/time/page.tsx` | Server component. Fetches time entries. Renders manual entry form + timesheet view. |
| 2 | Manual entry form | `components/time/manual-entry.tsx` | `"use client"`. Quick-add form at top: date (default today), project (dropdown), hours, description, billable toggle. Zod validation. Submits to DB and appends to list. |
| 3 | Timer component | `components/time/timer.tsx` | `"use client"`. Start/stop button. Elapsed time display (HH:MM:SS). On stop → opens form pre-filled with calculated duration. Timer start time stored in `localStorage` to persist across navigations. |
| 4 | Running timer indicator | Update `components/layout/header.tsx` | Check localStorage for active timer. If running, show blinking dot + elapsed time in header. Click navigates to `/time`. |
| 5 | Timesheet view | `components/time/timesheet-view.tsx` | `"use client"`. Weekly view (default) with day columns. Shows hours per day per project. Filter by project. Totals row per day and grand total. Toggle weekly/monthly view. |

**Deliverable:** Time can be logged manually or via timer. Timesheet provides weekly/monthly overview.

---

### Step 2.3 — Expense Tracking

**What:** Expense list, creation form, receipt upload and viewing.

| # | Task | File(s) | Details |
|---|------|---------|---------|
| 1 | Expense list page | `app/(dashboard)/expenses/page.tsx` | Server component. Fetch expenses. Summary cards at top: total this month by category. |
| 2 | Expense table component | `components/expenses/expense-table.tsx` | `"use client"`. Columns: date, description, category, vendor, amount, receipt (icon if attached), tax-deductible (checkbox icon). Filters: category, date range, tax-deductible. |
| 3 | New expense page | `app/(dashboard)/expenses/new/page.tsx` | Renders `ExpenseForm`. |
| 4 | Expense form component | `components/expenses/expense-form.tsx` | `"use client"`. Fields: amount (required), date, category (dropdown from expense_categories), vendor, description, payment_method (select), receipt upload (file input — jpg/png/pdf), tax_deductible (checkbox, default true), project (optional dropdown). Upload receipt to Supabase Storage `receipts` bucket, store URL. |
| 5 | Receipt viewer | `components/expenses/receipt-viewer.tsx` | `"use client"`. Modal/lightbox. Displays uploaded receipt image or PDF. Triggered from receipt icon in expense table. |

**Deliverable:** Expense tracking with categories, receipt uploads, and filtering.

---

### Step 2.4 — Tax Calculation Module

**What:** Pure tax computation functions and the tax overview page.

| # | Task | File(s) | Details |
|---|------|---------|---------|
| 1 | Tax computation library | `lib/tax.ts` | Pure functions (no DB calls): `calculate8PercentTax(grossRevenue, exemption?)`, `calculateGraduatedTax(netTaxableIncome)`, `calculatePercentageTax(grossRevenue)` (3%), `compareTaxRegimes(grossRevenue, totalExpenses)` → `TaxComparison`, `getQuarterFromDate(date)`, `getQuarterDeadline(year, quarter)`, `getVatThresholdStatus(grossRevenue, threshold?)` |
| 2 | Tax comparison component | `components/tax/tax-comparison.tsx` | `"use client"`. Side-by-side cards: 8% regime vs Graduated. Shows: gross revenue, deductions (expenses for graduated, exemption for 8%), taxable amount, income tax, percentage tax (3% for graduated, 0 for 8%), total tax. Highlights cheaper option. |
| 3 | What-if simulator | Part of tax comparison | Editable input fields to override revenue/expenses and see projected impact. Debounced recalculation. |
| 4 | VAT threshold tracker | `components/tax/threshold-bar.tsx` | Progress bar showing current gross vs 3M limit. Color coding: green (<80%), yellow (80-90%), red (>90%). |
| 5 | Quarterly breakdown table | `components/tax/quarter-table.tsx` | Table: Q1-Q4 rows. Columns: gross revenue, tax due (per regime), cumulative tax paid, filing deadline, filed status. Editable "filed" checkbox → saves to `tax_estimates`. |
| 6 | Tax page | `app/(dashboard)/tax/page.tsx` | Server component. Fetches paid invoices (gross revenue) and expenses by quarter. Computes tax using `lib/tax.ts`. Renders: YTD summary, TaxComparison, QuarterTable, ThresholdBar, upcoming deadlines. |

**Deliverable:** Tax page shows real-time 8% vs graduated comparison, quarterly breakdown, and VAT threshold warning.

---

### Step 2.5 — Dashboard

**What:** Home page with financial widgets, activity feed, and quick actions.

| # | Task | File(s) | Details |
|---|------|---------|---------|
| 1 | Revenue card | `components/dashboard/revenue-card.tsx` | Total revenue this month + YTD. % change from previous month. Data from paid invoices. |
| 2 | Outstanding invoices card | `components/dashboard/outstanding-card.tsx` | Count + total amount of unpaid invoices (status: sent, viewed, overdue). |
| 3 | Tax due card | `components/dashboard/tax-due-card.tsx` | Estimated tax for current quarter under selected regime. Uses `lib/tax.ts`. |
| 4 | Expenses card | `components/dashboard/expenses-card.tsx` | Total expenses this month. % change from previous month. |
| 5 | VAT threshold bar | Reuse `components/tax/threshold-bar.tsx` | Only displayed if user's regime is 8%. |
| 6 | Active projects list | `components/dashboard/active-projects.tsx` | List of in-progress projects with status badges and hours logged. |
| 7 | Recent activity feed | `components/dashboard/activity-feed.tsx` | Last 10 actions across all tables (invoice created, payment received, expense logged, time logged). Query multiple tables by `created_at` desc. |
| 8 | Quick actions | `components/dashboard/quick-actions.tsx` | Buttons: New Invoice, Log Expense, Add Client, Log Time. Navigate to respective pages. |
| 9 | Dashboard page | `app/(dashboard)/page.tsx` | Server component. Fetch all dashboard data. Use `"use cache"` on aggregation queries. Responsive grid: 4 stat cards (2×2 desktop, 1 column mobile), then projects + activity side by side, quick actions. |

**Deliverable:** Dashboard shows real financial data, activity feed, and provides quick actions.

---

### Phase 2 Verification Checklist

- [ ] Can create projects linked to clients
- [ ] Project detail shows time entries and financial summary
- [ ] Can log time manually via form
- [ ] Timer starts, tracks elapsed time, and saves entry on stop
- [ ] Running timer indicator visible in header
- [ ] Timesheet view shows weekly hours breakdown
- [ ] Can log expenses with all fields
- [ ] Receipt upload works (image and PDF)
- [ ] Receipts viewable in lightbox from expense list
- [ ] Tax page shows accurate 8% computation
- [ ] Tax page shows accurate graduated computation with 3% percentage tax
- [ ] Tax comparison highlights the cheaper option
- [ ] What-if simulator updates calculations in real-time
- [ ] VAT threshold bar shows correct percentage and color
- [ ] Quarterly table shows revenue and tax per quarter
- [ ] Dashboard stat cards show real data
- [ ] Activity feed shows recent actions
- [ ] Quick actions navigate to correct pages
- [ ] All pages have loading skeletons and error handling

**After verification:** PR `phase-2-core` → `main`, merge.

---

## PHASE 3: Invoicing & Polish

**Branch:** `phase-3-invoicing`
**Goal:** Full invoicing workflow, PDF export, payment recording, and app-wide polish.

---

### Step 3.1 — Invoice List & Creation

**What:** Invoice list page and the invoice builder.

| # | Task | File(s) | Details |
|---|------|---------|---------|
| 1 | Invoice list page | `app/(dashboard)/invoices/page.tsx` | Server component. Fetch invoices with client names. Overdue detection: auto-flag invoices past `due_date` that aren't paid. |
| 2 | Invoice table component | `components/invoices/invoice-table.tsx` | `"use client"`. Columns: invoice number, client, issue date, due date, total, status (color-coded badge). Status tabs: All, Draft, Sent, Paid, Overdue. Click → detail page. |
| 3 | Invoice builder page | `app/(dashboard)/invoices/new/page.tsx` | Renders `InvoiceBuilder` component. |
| 4 | Invoice builder component | `components/invoices/invoice-builder.tsx` | `"use client"`. Sections: Header (business info from settings, client dropdown), Meta (auto-generated invoice number, issue date, due date, payment terms), Line items (dynamic add/remove rows — description, quantity, unit_price, auto-calculated amount), Import from Time Entries button (select project + date range → converts unbilled hours to line items), Totals (subtotal auto-sum, optional tax rate, tax amount, total), Notes textarea. Actions: Save Draft, Save & Mark Sent. |
| 5 | Invoice number generator | Part of builder | Query last invoice, parse sequence, increment. Format: `{PREFIX}-{YEAR}-{SEQUENCE}` padded to 3 digits. |
| 6 | Time entry import | `components/invoices/time-import-dialog.tsx` | `"use client"`. Dialog: select project, date range. Fetches unbilled time entries. Preview list. Confirm → inserts as line items (description = entry description, quantity = hours, unit_price = project rate). |

**Deliverable:** Can create invoices from scratch or from time entries. Auto-incrementing invoice numbers.

---

### Step 3.2 — Invoice Detail & PDF Export

**What:** Invoice preview, status management, and PDF download.

| # | Task | File(s) | Details |
|---|------|---------|---------|
| 1 | Invoice detail page | `app/(dashboard)/invoices/[id]/page.tsx` | `const { id } = await params;`. Fetch invoice + items + payments. Render preview + actions. |
| 2 | Invoice preview component | `components/invoices/invoice-preview.tsx` | Styled to look like a real invoice document. Business logo + info, client info, line items table, totals, payment terms, notes. Status badge. |
| 3 | PDF template | `components/invoices/pdf-template.tsx` | Using `@react-pdf/renderer`. Mirrors the on-screen preview layout. Includes: logo, business info, client info, invoice number, dates, line items table, totals, payment terms, notes. |
| 4 | PDF download action | Part of detail page | "Download PDF" button → generates PDF client-side → triggers browser download as `{invoice_number}.pdf`. |
| 5 | Status management | Part of detail page | Actions: Edit (only if draft), Mark as Sent, Record Payment, Cancel. Status transitions: Draft → Sent → Paid. Update DB on action. |
| 6 | Payment history section | Part of detail page | List of payments recorded against this invoice: date, amount, method, reference. Total paid vs. invoice total. Remaining balance. |

**Deliverable:** Professional invoice preview and PDF. Status transitions. Payment history visible.

---

### Step 3.3 — Payment Recording

**What:** Record full/partial payments and auto-update invoice status.

| # | Task | File(s) | Details |
|---|------|---------|---------|
| 1 | Payment form dialog | `components/invoices/payment-dialog.tsx` | `"use client"`. Dialog triggered from invoice detail. Fields: amount (default: remaining balance), date, payment method (dropdown: Bank Transfer, Cash, Check, PayPal, GCash, Maya, Wise, Other), reference note. Zod validation. |
| 2 | Auto-status update | Server action or route handler | After recording payment: sum all payments for invoice. If sum >= total → set status = "paid". If sum > 0 but < total → display "Partially Paid" indicator on invoice. |
| 3 | Payment on dashboard | Update `activity-feed.tsx` | New payment entries appear in the recent activity feed. |

**Deliverable:** Full and partial payment recording. Auto status update. Partially paid indicator.

---

### Step 3.4 — Recurring Invoices (Stretch)

**What:** Optional recurring invoice configuration.

| # | Task | Details |
|---|------|---------|
| 1 | Add recurring fields to invoices | Add `is_recurring`, `recurrence_frequency` (monthly/quarterly), `next_recurrence_date` columns to invoices table |
| 2 | Recurring config UI | Toggle on invoice creation — frequency select, start from date |
| 3 | Recurrence check | On dashboard page load: check for invoices where `next_recurrence_date <= today`. Auto-generate a new Draft invoice copying line items. Update `next_recurrence_date`. |

**Deliverable:** Invoices can be set to auto-generate on a schedule.

---

### Step 3.5 — App-Wide Polish

**What:** Loading states, error handling, empty states, responsive audit, and UX improvements.

| # | Task | Details |
|---|------|---------|
| 1 | Skeleton loaders | Add skeleton components for: client table, project table, invoice table, expense table, time entries, dashboard cards, tax page sections. Show while server components are fetching. |
| 2 | Error boundaries | Add `error.tsx` files in each route segment. Display friendly error messages with retry button. |
| 3 | Empty states | Each table/list: show illustration + message + CTA when empty. Examples: "No clients yet — Add your first client", "No invoices — Create your first invoice". |
| 4 | Form validation UX | Inline error messages below each field. Disable submit while submitting (show spinner). |
| 5 | Toast notifications | Consistent pattern: green toast for success, red for error. All CRUD operations. |
| 6 | Responsive audit | Test and fix all pages at 375px (mobile), 768px (tablet), 1280px+ (desktop). Fix any overflow, truncation, or layout issues. |
| 7 | Overdue indicators | Red badge on dashboard outstanding card. Red row highlight or badge on invoice table. |
| 8 | Optimistic updates | Status changes (invoice status, project status, client status) update UI immediately, revert on error. |
| 9 | Dark mode (nice-to-have) | shadcn/ui supports this via CSS variables. Add theme toggle in header. Persist preference in localStorage. |
| 10 | Keyboard shortcuts (nice-to-have) | `N` → New (context-dependent), `/` → focus search bar, `Esc` → close dialogs. |

**Deliverable:** Polished, responsive app with proper loading, error, and empty states.

---

### Phase 3 Verification Checklist

- [ ] Can create invoices with dynamic line items
- [ ] Can import time entries into invoice line items
- [ ] Invoice numbers auto-increment (e.g., INV-2026-001, INV-2026-002)
- [ ] Invoice detail page shows professional preview
- [ ] PDF download generates a clean document matching the preview
- [ ] Can record full payment → invoice auto-marked as paid
- [ ] Can record partial payment → shows remaining balance
- [ ] Overdue invoices flagged on dashboard and invoice list
- [ ] All tables show skeleton loaders while loading
- [ ] Error boundaries catch and display errors gracefully
- [ ] Empty states shown when no data exists
- [ ] All forms validate inline with zod
- [ ] App works well on mobile (375px) and desktop (1280px+)
- [ ] Full E2E workflow: Client → Project → Time → Invoice → PDF → Payment → Tax

**After verification:** PR `phase-3-invoicing` → `main`, merge.

---

## MVP Completion Criteria

The app is MVP-complete when this entire workflow succeeds:

1. Sign up / log in → see dashboard with real data
2. Add client → create project for them
3. Track time (manual + timer) against the project
4. Create invoice from tracked time (or manual line items)
5. Export invoice as professional PDF
6. Record payment → invoice marked as paid
7. Log business expense with receipt photo
8. View revenue, expenses, profit for current month on dashboard
9. See estimated 8% income tax for current quarter + YTD
10. Compare 8% flat vs. graduated with expense deductions on tax page
11. VAT threshold warning triggers at 80% and 90% of 3M PHP

---

## Git Workflow

| Phase | Branch | Merge Target |
|-------|--------|--------------|
| Phase 1 | `phase-1-foundation` | `main` |
| Phase 2 | `phase-2-core` | `main` |
| Phase 3 | `phase-3-invoicing` | `main` |

- Commit after each completed step (e.g., "feat: add client CRUD with search and filtering")
- PR at end of each phase for review before merging
- Tag releases: `v0.1.0` (Phase 1), `v0.2.0` (Phase 2), `v1.0.0` (Phase 3 / MVP)

---

## Dependency Graph

```
Step 1.1 (Scaffolding)
  └── Step 1.2 (Lib files)
        ├── Step 1.3 (Database) ──────────────────────┐
        │     └── Step 1.4 (Auth)                     │
        │           └── Step 1.5 (Layout/Nav)         │
        │                 ├── Step 1.6 (Settings)     │
        │                 └── Step 1.7 (Clients)      │
        │                       └── Step 2.1 (Projects)
        │                             └── Step 2.2 (Time Tracking)
        │                                   └── Step 3.1 (Invoice Builder)
        │                                         └── Step 3.2 (Invoice Detail/PDF)
        │                                               └── Step 3.3 (Payments)
        ├── Step 2.3 (Expenses) ──── requires DB + Layout
        ├── Step 2.4 (Tax Module) ── requires Expenses + Invoices conceptually
        └── Step 2.5 (Dashboard) ─── requires all Phase 2 data sources
              └── Step 3.5 (Polish) ── final pass after all features
```

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth routing | `proxy.ts` (not `middleware.ts`) | Next.js 16 standard — runs on Node.js runtime |
| Route params | Always `await params` | Next.js 16 requires async params in dynamic routes |
| Caching | `"use cache"` directive (opt-in) | Next.js 16 caching is explicit, not implicit |
| State management | No external store | Single-user app — server components + URL state + localStorage for timer is sufficient |
| PDF generation | `@react-pdf/renderer` | React-native approach, full layout control, client-side generation |
| Form handling | `react-hook-form` + `zod` | Industry standard, good DX, zod schemas mirror DB types |
| Tax computation | Pure functions in `lib/tax.ts` | Testable, no side effects, computed from real invoice/expense data |
| Styling | Tailwind + shadcn/ui | Consistent design system, rapid development, built-in dark mode support |
