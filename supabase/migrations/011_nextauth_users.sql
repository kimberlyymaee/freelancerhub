-- ============================================================
-- Migration: Switch from Supabase Auth to NextAuth
-- ============================================================
-- Creates public.users table for NextAuth Credentials provider,
-- drops auth.users trigger, changes profiles FK, and disables RLS.
-- ============================================================

-- 1. Create public.users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- 2. Drop the auto-create-profile trigger (depends on auth.users)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Change profiles FK from auth.users to public.users
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;
ALTER TABLE profiles ADD PRIMARY KEY (id);
-- The old FK referenced auth.users(id); remove it and add new one
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 4. Change user_id FKs from auth.users to public.users on all tables
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_user_id_fkey;
ALTER TABLE clients ADD CONSTRAINT clients_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;
ALTER TABLE projects ADD CONSTRAINT projects_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS time_entries_user_id_fkey;
ALTER TABLE time_entries ADD CONSTRAINT time_entries_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_user_id_fkey;
ALTER TABLE invoices ADD CONSTRAINT invoices_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;
ALTER TABLE payments ADD CONSTRAINT payments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_user_id_fkey;
ALTER TABLE expenses ADD CONSTRAINT expenses_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE expense_categories DROP CONSTRAINT IF EXISTS expense_categories_user_id_fkey;
ALTER TABLE expense_categories ADD CONSTRAINT expense_categories_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE tax_estimates DROP CONSTRAINT IF EXISTS tax_estimates_user_id_fkey;
ALTER TABLE tax_estimates ADD CONSTRAINT tax_estimates_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 5. Drop all RLS policies and disable RLS

-- profiles (3 policies)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- clients (4 policies)
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- projects (4 policies)
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- time_entries (4 policies)
DROP POLICY IF EXISTS "Users can view own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can insert own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can update own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can delete own time entries" ON time_entries;
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;

-- invoices (4 policies)
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;

-- invoice_items (4 policies)
DROP POLICY IF EXISTS "Users can view own invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Users can insert own invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Users can update own invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Users can delete own invoice items" ON invoice_items;
ALTER TABLE invoice_items DISABLE ROW LEVEL SECURITY;

-- payments (4 policies)
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
DROP POLICY IF EXISTS "Users can update own payments" ON payments;
DROP POLICY IF EXISTS "Users can delete own payments" ON payments;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- expenses (4 policies)
DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;

-- expense_categories (4 policies)
DROP POLICY IF EXISTS "Users can view own expense categories" ON expense_categories;
DROP POLICY IF EXISTS "Users can insert own expense categories" ON expense_categories;
DROP POLICY IF EXISTS "Users can update own expense categories" ON expense_categories;
DROP POLICY IF EXISTS "Users can delete own expense categories" ON expense_categories;
ALTER TABLE expense_categories DISABLE ROW LEVEL SECURITY;

-- tax_estimates (4 policies)
DROP POLICY IF EXISTS "Users can view own tax estimates" ON tax_estimates;
DROP POLICY IF EXISTS "Users can insert own tax estimates" ON tax_estimates;
DROP POLICY IF EXISTS "Users can update own tax estimates" ON tax_estimates;
DROP POLICY IF EXISTS "Users can delete own tax estimates" ON tax_estimates;
ALTER TABLE tax_estimates DISABLE ROW LEVEL SECURITY;
