-- ============================================================
-- FreelanceHub Seed Data
-- ============================================================
-- This script creates a seed user with email/password auth (NextAuth)
-- and populates the database with sample data.
--
-- Default credentials:
--   Email:    juan@freelancedev.ph
--   Password: password123
--
-- Run this entire script in the Supabase SQL Editor.
-- ============================================================

-- bcrypt hash of "password123" (12 rounds)
DO $$
DECLARE
  uid uuid := gen_random_uuid();
BEGIN

-- Create the user in public.users
INSERT INTO public.users (id, email, password_hash, full_name)
VALUES (uid, 'juan@freelancedev.ph', '$2b$12$Ywy6kimZc3np96et9IiBMudjX2dvNILO300INh61fThR5Njdf6DD2', 'Juan Dela Cruz');

-- Create profile
INSERT INTO profiles (id, email, full_name) VALUES (uid, 'juan@freelancedev.ph', 'Juan Dela Cruz');

-- Update profile with business info
UPDATE profiles SET
  business_name = 'Freelance Dev Studio',
  full_name = 'Juan Dela Cruz',
  email = 'juan@freelancedev.ph',
  phone = '+63 917 123 4567',
  address = 'Makati City, Metro Manila, Philippines',
  tax_id_tin = '123-456-789-000',
  default_currency = 'PHP',
  default_hourly_rate = 1500.00,
  tax_regime = 'eight_percent',
  default_payment_terms = 'Due within 30 days',
  default_invoice_notes = 'Thank you for your business!',
  invoice_prefix = 'INV'
WHERE id = uid;

-- Default expense categories
INSERT INTO expense_categories (user_id, name, is_default) VALUES
  (uid, 'Software / SaaS', true),
  (uid, 'Hardware / Equipment', true),
  (uid, 'Office Supplies', true),
  (uid, 'Travel', true),
  (uid, 'Meals & Entertainment', true),
  (uid, 'Professional Services', true),
  (uid, 'Outsourcing / Contractors', true),
  (uid, 'Marketing', true),
  (uid, 'Internet & Telecom', true),
  (uid, 'Other', true);

-- Sample clients
INSERT INTO clients (id, user_id, company_name, contact_name, email, phone, status, tags) VALUES
  (gen_random_uuid(), uid, 'Acme Corp', 'John Smith', 'john@acme.com', '+1 555 0100', 'active', ARRAY['web', 'react']),
  (gen_random_uuid(), uid, 'TechStart Inc', 'Maria Garcia', 'maria@techstart.io', '+1 555 0200', 'active', ARRAY['mobile', 'flutter']),
  (gen_random_uuid(), uid, 'DesignHub Co', 'Alex Chen', 'alex@designhub.co', NULL, 'prospect', ARRAY['design']);

-- Sample projects (uses client IDs from above)
INSERT INTO projects (id, user_id, client_id, name, type, rate, estimated_hours, status, description)
SELECT
  gen_random_uuid(), uid, c.id,
  'Website Redesign', 'hourly', 1500.00, 80, 'in_progress',
  'Complete redesign of the company website using Next.js and Tailwind CSS.'
FROM clients c WHERE c.company_name = 'Acme Corp' AND c.user_id = uid;

INSERT INTO projects (id, user_id, client_id, name, type, rate, estimated_hours, status, description)
SELECT
  gen_random_uuid(), uid, c.id,
  'Mobile App MVP', 'fixed', 150000.00, 200, 'in_progress',
  'Build MVP of the mobile application with core features.'
FROM clients c WHERE c.company_name = 'TechStart Inc' AND c.user_id = uid;

-- Sample time entries
INSERT INTO time_entries (user_id, project_id, date, hours, description, is_billable)
SELECT uid, p.id, CURRENT_DATE - INTERVAL '5 days', 4.0, 'Homepage layout and hero section', true
FROM projects p WHERE p.name = 'Website Redesign' AND p.user_id = uid;

INSERT INTO time_entries (user_id, project_id, date, hours, description, is_billable)
SELECT uid, p.id, CURRENT_DATE - INTERVAL '4 days', 6.5, 'About page and contact form', true
FROM projects p WHERE p.name = 'Website Redesign' AND p.user_id = uid;

INSERT INTO time_entries (user_id, project_id, date, hours, description, is_billable)
SELECT uid, p.id, CURRENT_DATE - INTERVAL '3 days', 3.0, 'Responsive testing and bug fixes', true
FROM projects p WHERE p.name = 'Website Redesign' AND p.user_id = uid;

INSERT INTO time_entries (user_id, project_id, date, hours, description, is_billable)
SELECT uid, p.id, CURRENT_DATE - INTERVAL '2 days', 8.0, 'App architecture and auth flow', true
FROM projects p WHERE p.name = 'Mobile App MVP' AND p.user_id = uid;

INSERT INTO time_entries (user_id, project_id, date, hours, description, is_billable)
SELECT uid, p.id, CURRENT_DATE - INTERVAL '1 day', 5.5, 'Dashboard screen implementation', true
FROM projects p WHERE p.name = 'Mobile App MVP' AND p.user_id = uid;

-- Sample expenses
INSERT INTO expenses (user_id, amount, date, category, vendor, description, is_tax_deductible) VALUES
  (uid, 1499.00, CURRENT_DATE - INTERVAL '10 days', 'Software / SaaS', 'JetBrains', 'WebStorm annual license', true),
  (uid, 999.00, CURRENT_DATE - INTERVAL '7 days', 'Software / SaaS', 'Vercel', 'Pro plan - monthly', true),
  (uid, 2500.00, CURRENT_DATE - INTERVAL '5 days', 'Internet & Telecom', 'PLDT', 'Fiber internet - monthly', true),
  (uid, 350.00, CURRENT_DATE - INTERVAL '3 days', 'Meals & Entertainment', 'Starbucks', 'Client meeting coffee', true),
  (uid, 15000.00, CURRENT_DATE - INTERVAL '1 day', 'Hardware / Equipment', 'Silicon Valley', 'USB-C hub and cables', true);

-- Sample invoice (for Acme Corp - Website Redesign)
INSERT INTO invoices (id, user_id, client_id, project_id, invoice_number, status, issue_date, due_date, subtotal, tax_rate, tax_amount, total, payment_terms, notes)
SELECT
  gen_random_uuid(), uid, c.id, p.id,
  'INV-2026-001', 'paid',
  CURRENT_DATE - INTERVAL '15 days',
  CURRENT_DATE - INTERVAL '0 days',
  20250.00, 0, 0, 20250.00,
  'Due within 30 days',
  'Thank you for your business!'
FROM clients c
JOIN projects p ON p.client_id = c.id AND p.name = 'Website Redesign'
WHERE c.company_name = 'Acme Corp' AND c.user_id = uid;

-- Invoice line items
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount)
SELECT i.id, 'Homepage layout and hero section', 4.0, 1500.00, 6000.00
FROM invoices i WHERE i.invoice_number = 'INV-2026-001' AND i.user_id = uid;

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount)
SELECT i.id, 'About page and contact form', 6.5, 1500.00, 9750.00
FROM invoices i WHERE i.invoice_number = 'INV-2026-001' AND i.user_id = uid;

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount)
SELECT i.id, 'Responsive testing and bug fixes', 3.0, 1500.00, 4500.00
FROM invoices i WHERE i.invoice_number = 'INV-2026-001' AND i.user_id = uid;

-- Payment for the invoice
INSERT INTO payments (user_id, invoice_id, amount, date, method, reference_note)
SELECT uid, i.id, 20250.00, CURRENT_DATE - INTERVAL '5 days', 'bank_transfer', 'BDO wire transfer ref #12345'
FROM invoices i WHERE i.invoice_number = 'INV-2026-001' AND i.user_id = uid;

RAISE NOTICE 'Seed data inserted successfully for user %', uid;

END $$;
